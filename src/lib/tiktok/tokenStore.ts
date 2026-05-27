import crypto from "node:crypto";
import type { Sql } from "postgres";
import { getServerEnv } from "@/lib/env";

export type TokenData = {
  openId: string;
  scope: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
  nickname?: string;
  avatarUrl?: string;
};

export type StoredTikTokAccount = {
  id: string;
  departmentId: string;
  accountId: string;
  openId: string;
  scope: string;
  expiresAt: string;
  refreshExpiresAt: string;
  nickname?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoredTikTokToken = StoredTikTokAccount & {
  accessToken: string;
  refreshToken: string;
};

export type TokenStoreStatus = {
  kind: "postgres" | "memory";
  persistent: boolean;
  warning?: string;
};

export interface TokenStore {
  saveToken(
    accountId: string,
    departmentId: string,
    tokenData: TokenData,
  ): Promise<void>;
  getToken(accountId: string): Promise<StoredTikTokAccount | null>;
  getTokenData(accountId: string): Promise<StoredTikTokToken | null>;
  deleteToken(accountId: string): Promise<void>;
  listAccounts(): Promise<StoredTikTokAccount[]>;
  getStatus(): TokenStoreStatus;
}

const memoryAccounts = new Map<
  string,
  StoredTikTokAccount & {
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
  }
>();

let postgresClient: Sql | null = null;

export function getTokenStore(): TokenStore {
  const env = getServerEnv();

  if (env.DATABASE_URL) {
    return new PostgresTokenStore(env.DATABASE_URL, env.TOKEN_ENCRYPTION_KEY);
  }

  return new MemoryTokenStore(env.TOKEN_ENCRYPTION_KEY);
}

class MemoryTokenStore implements TokenStore {
  constructor(private readonly encryptionKey: string) {}

  async saveToken(
    accountId: string,
    departmentId: string,
    tokenData: TokenData,
  ) {
    const now = new Date().toISOString();
    const existing = memoryAccounts.get(accountId);

    memoryAccounts.set(accountId, {
      id: existing?.id || crypto.randomUUID(),
      departmentId,
      accountId,
      openId: tokenData.openId,
      scope: tokenData.scope,
      expiresAt: tokenData.expiresAt,
      refreshExpiresAt: tokenData.refreshExpiresAt,
      nickname: tokenData.nickname,
      avatarUrl: tokenData.avatarUrl,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      accessTokenEncrypted: encryptToken(
        tokenData.accessToken,
        this.encryptionKey,
      ),
      refreshTokenEncrypted: encryptToken(
        tokenData.refreshToken,
        this.encryptionKey,
      ),
    });
  }

  async getToken(accountId: string) {
    const account = memoryAccounts.get(accountId);
    return account ? publicAccount(account) : null;
  }

  async getTokenData(accountId: string) {
    const account = memoryAccounts.get(accountId);

    if (!account) {
      return null;
    }

    return {
      ...publicAccount(account),
      accessToken: decryptToken(account.accessTokenEncrypted, this.encryptionKey),
      refreshToken: decryptToken(
        account.refreshTokenEncrypted,
        this.encryptionKey,
      ),
    };
  }

  async deleteToken(accountId: string) {
    memoryAccounts.delete(accountId);
  }

  async listAccounts() {
    return Array.from(memoryAccounts.values()).map(publicAccount);
  }

  getStatus(): TokenStoreStatus {
    return {
      kind: "memory",
      persistent: false,
      warning: "Live tokens are not persisted without DB",
    };
  }
}

class PostgresTokenStore implements TokenStore {
  constructor(
    private readonly databaseUrl: string,
    private readonly encryptionKey: string,
  ) {}

  async saveToken(
    accountId: string,
    departmentId: string,
    tokenData: TokenData,
  ) {
    const sql = await getPostgresClient(this.databaseUrl);
    await ensureTable(sql);

    await sql`
      insert into tiktok_accounts (
        department_id,
        account_id,
        open_id,
        scope,
        access_token_encrypted,
        refresh_token_encrypted,
        expires_at,
        refresh_expires_at,
        nickname,
        avatar_url,
        created_at,
        updated_at
      )
      values (
        ${departmentId},
        ${accountId},
        ${tokenData.openId},
        ${tokenData.scope},
        ${encryptToken(tokenData.accessToken, this.encryptionKey)},
        ${encryptToken(tokenData.refreshToken, this.encryptionKey)},
        ${tokenData.expiresAt},
        ${tokenData.refreshExpiresAt},
        ${tokenData.nickname || null},
        ${tokenData.avatarUrl || null},
        now(),
        now()
      )
      on conflict (account_id)
      do update set
        department_id = excluded.department_id,
        open_id = excluded.open_id,
        scope = excluded.scope,
        access_token_encrypted = excluded.access_token_encrypted,
        refresh_token_encrypted = excluded.refresh_token_encrypted,
        expires_at = excluded.expires_at,
        refresh_expires_at = excluded.refresh_expires_at,
        nickname = excluded.nickname,
        avatar_url = excluded.avatar_url,
        updated_at = now()
    `;
  }

  async getToken(accountId: string) {
    const sql = await getPostgresClient(this.databaseUrl);
    await ensureTable(sql);
    const rows = await sql`
      select id, department_id, account_id, open_id, scope, expires_at,
        refresh_expires_at, nickname, avatar_url, created_at, updated_at
      from tiktok_accounts
      where account_id = ${accountId}
      limit 1
    `;

    return rows[0] ? mapRow(rows[0]) : null;
  }

  async getTokenData(accountId: string) {
    const sql = await getPostgresClient(this.databaseUrl);
    await ensureTable(sql);
    const rows = await sql`
      select id, department_id, account_id, open_id, scope, expires_at,
        refresh_expires_at, nickname, avatar_url, created_at, updated_at,
        access_token_encrypted, refresh_token_encrypted
      from tiktok_accounts
      where account_id = ${accountId}
      limit 1
    `;

    if (!rows[0]) {
      return null;
    }

    return {
      ...mapRow(rows[0]),
      accessToken: decryptToken(
        String(rows[0].access_token_encrypted),
        this.encryptionKey,
      ),
      refreshToken: decryptToken(
        String(rows[0].refresh_token_encrypted),
        this.encryptionKey,
      ),
    };
  }

  async deleteToken(accountId: string) {
    const sql = await getPostgresClient(this.databaseUrl);
    await ensureTable(sql);
    await sql`delete from tiktok_accounts where account_id = ${accountId}`;
  }

  async listAccounts() {
    const sql = await getPostgresClient(this.databaseUrl);
    await ensureTable(sql);
    const rows = await sql`
      select id, department_id, account_id, open_id, scope, expires_at,
        refresh_expires_at, nickname, avatar_url, created_at, updated_at
      from tiktok_accounts
      order by updated_at desc
    `;

    return rows.map(mapRow);
  }

  getStatus(): TokenStoreStatus {
    return {
      kind: "postgres",
      persistent: true,
    };
  }
}

async function getPostgresClient(databaseUrl: string) {
  if (!postgresClient) {
    const postgres = (await import("postgres")).default;
    postgresClient = postgres(databaseUrl, {
      max: 1,
      prepare: false,
      ssl: databaseUrl.includes("sslmode=require")
        ? "require"
        : databaseUrl.includes("supabase")
          ? "require"
          : undefined,
    });
  }

  return postgresClient;
}

async function ensureTable(
  sql: Sql,
): Promise<void> {
  await sql`
    create table if not exists tiktok_accounts (
      id text primary key default md5(random()::text || clock_timestamp()::text),
      department_id text not null,
      account_id text not null unique,
      open_id text not null,
      scope text not null,
      access_token_encrypted text not null,
      refresh_token_encrypted text not null,
      expires_at timestamptz not null,
      refresh_expires_at timestamptz not null,
      nickname text,
      avatar_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
}

function encryptToken(value: string, keySource: string): string {
  const key = crypto.createHash("sha256").update(keySource || "dev-key").digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptToken(value: string, keySource: string): string {
  const [ivValue, tagValue, encryptedValue] = value.split(".");

  if (!ivValue || !tagValue || !encryptedValue) {
    throw new Error("invalid_encrypted_token");
  }

  const key = crypto.createHash("sha256").update(keySource || "dev-key").digest();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function publicAccount(
  account: StoredTikTokAccount,
): StoredTikTokAccount {
  return {
    id: account.id,
    departmentId: account.departmentId,
    accountId: account.accountId,
    openId: account.openId,
    scope: account.scope,
    expiresAt: account.expiresAt,
    refreshExpiresAt: account.refreshExpiresAt,
    nickname: account.nickname,
    avatarUrl: account.avatarUrl,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

function mapRow(row: Record<string, unknown>): StoredTikTokAccount {
  return {
    id: String(row.id),
    departmentId: String(row.department_id),
    accountId: String(row.account_id),
    openId: String(row.open_id),
    scope: String(row.scope),
    expiresAt: toIsoString(row.expires_at),
    refreshExpiresAt: toIsoString(row.refresh_expires_at),
    nickname: row.nickname ? String(row.nickname) : undefined,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    createdAt: row.created_at ? toIsoString(row.created_at) : undefined,
    updatedAt: row.updated_at ? toIsoString(row.updated_at) : undefined,
  };
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(String(value)).toISOString();
}
