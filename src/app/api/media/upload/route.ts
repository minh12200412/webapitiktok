import { put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import {
  buildVerifiedMediaUrl,
  redactStorageUrl,
  saveMediaMetadata,
} from "@/lib/media/mediaStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  const authResult = validateAuthorization(request);

  if (!authResult.ok) {
    return errorResponse(401, "UNAUTHORIZED", "Missing or invalid bearer token.");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return errorResponse(400, "FILE_REQUIRED", "multipart/form-data file is required.");
  }

  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    return errorResponse(
      400,
      "UNSUPPORTED_MEDIA_TYPE",
      "Only mp4, mov, webm, jpeg, png, and webp files are allowed.",
    );
  }

  const maxMb = getMaxUploadMb();
  const maxBytes = maxMb * 1024 * 1024;

  if (file.size > maxBytes) {
    return errorResponse(
      413,
      "FILE_TOO_LARGE",
      `File exceeds MEDIA_UPLOAD_MAX_MB=${maxMb}.`,
    );
  }

  const folder = sanitizePathSegment(
    String(formData.get("folder") || "tiktok/videos"),
  );
  const requestedFilename = formData.get("filename");
  const filename = sanitizeFilename(
    typeof requestedFilename === "string" && requestedFilename.trim()
      ? requestedFilename
      : file.name,
  );
  const key = `${folder}/${Date.now()}-${filename}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    saveMediaMetadata({
      key,
      storageUrl: blob.url,
      sizeBytes: file.size,
      contentType: file.type,
      createdAt: new Date().toISOString(),
    });

    return Response.json({
      ok: true,
      url: buildVerifiedMediaUrl(request, key),
      storageUrl: redactStorageUrl(blob.url),
      sizeBytes: file.size,
      contentType: file.type,
    });
  }

  if (
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_BUCKET
  ) {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      },
    );
    const bytes = await file.arrayBuffer();
    const upload = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(key, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (upload.error) {
      return errorResponse(
        502,
        "MEDIA_STORAGE_UPLOAD_FAILED",
        upload.error.message,
      );
    }

    const publicUrl = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(key);
    saveMediaMetadata({
      key,
      storageUrl: publicUrl.data.publicUrl,
      sizeBytes: file.size,
      contentType: file.type,
      createdAt: new Date().toISOString(),
    });

    return Response.json({
      ok: true,
      url: buildVerifiedMediaUrl(request, key),
      storageUrl: redactStorageUrl(publicUrl.data.publicUrl),
      sizeBytes: file.size,
      contentType: file.type,
    });
  }

  return errorResponse(
    500,
    "MEDIA_STORAGE_NOT_CONFIGURED",
    "Configure BLOB_READ_WRITE_TOKEN or Supabase Storage env variables.",
  );
}

function validateAuthorization(request: Request) {
  const expectedToken = process.env.MEDIA_UPLOAD_TOKEN;

  if (!expectedToken) {
    return { ok: false };
  }

  const authorization = request.headers.get("authorization");
  const prefix = "Bearer ";

  if (!authorization?.startsWith(prefix)) {
    return { ok: false };
  }

  return {
    ok: authorization.slice(prefix.length) === expectedToken,
  };
}

function getMaxUploadMb(): number {
  const value = Number(process.env.MEDIA_UPLOAD_MAX_MB || "80");

  if (!Number.isFinite(value) || value <= 0) {
    return 80;
  }

  return value;
}

function sanitizePathSegment(value: string): string {
  return (
    value
      .split("/")
      .map((segment) =>
        segment
          .toLowerCase()
          .replace(/[^a-z0-9._-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
      )
      .filter(Boolean)
      .join("/") || "uploads"
  );
}

function sanitizeFilename(value: string): string {
  const fallback = "media";
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || fallback;
}

function errorResponse(status: number, errorCode: string, message: string) {
  return Response.json(
    {
      ok: false,
      errorCode,
      message,
    },
    { status },
  );
}
