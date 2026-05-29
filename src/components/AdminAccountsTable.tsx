"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import {
  mockAccounts,
  mockScheduledPosts,
  type MockTikTokProfile,
  type MockTikTokVideo,
  type MockScheduledPost,
  type MockTikTokAccount,
} from "@/lib/tiktok/mockData";

type AdminReportState = {
  profile?: MockTikTokProfile;
  videos?: MockTikTokVideo[];
  summary?: {
    totalVideosAnalyzed: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    topVideo: string;
    insights: string[];
    recommendations: string[];
  };
  scopesUsed?: string[];
};

type LiveTokenAccount = {
  departmentId: string;
  accountId: string;
  openId: string;
  scope: string;
  expiresAt: string;
  refreshExpiresAt: string;
  nickname?: string;
  avatarUrl?: string;
  updatedAt?: string;
};

type TokenStoreStatus = {
  kind: "postgres" | "memory";
  persistent: boolean;
  warning?: string;
};

export function AdminAccountsTable() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<MockTikTokAccount[]>(mockAccounts);
  const [scheduledPosts, setScheduledPosts] =
    useState<MockScheduledPost[]>(mockScheduledPosts);
  const [message, setMessage] = useState<string | null>(null);
  const [reportState, setReportState] = useState<AdminReportState>({});
  const [liveAccounts, setLiveAccounts] = useState<LiveTokenAccount[]>([]);
  const [tokenStoreStatus, setTokenStoreStatus] =
    useState<TokenStoreStatus | null>(null);
  const connectedDepartment = searchParams.get("departmentId");
  const error = searchParams.get("error");

  useEffect(() => {
    let isMounted = true;

    async function loadLiveAccounts() {
      const response = await fetch("/api/tiktok/tokens/accounts", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        accounts: LiveTokenAccount[];
        tokenStore: TokenStoreStatus;
      };

      if (isMounted) {
        setLiveAccounts(data.accounts);
        setTokenStoreStatus(data.tokenStore);
      }
    }

    loadLiveAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const liveAccountById = useMemo(
    () => new Map(liveAccounts.map((account) => [account.accountId, account])),
    [liveAccounts],
  );

  async function disconnect(account: MockTikTokAccount) {
    setMessage(null);

    const response = await fetch("/api/tiktok/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentId: account.departmentId,
        accountId: account.accountId,
      }),
    });

    if (!response.ok) {
      setMessage("Disconnect request failed.");
      return;
    }

    setAccounts((current) =>
      current.map((item) =>
        item.accountId === account.accountId
          ? {
              ...item,
              nickname: "-",
              status: "Disconnected",
              scopes: [],
              lastConnected: "-",
            }
          : item,
      ),
    );
    setLiveAccounts((current) =>
      current.filter((item) => item.accountId !== account.accountId),
    );
    setMessage(`${account.department} disconnected.`);
  }

  async function runScheduleNow(schedule: MockScheduledPost) {
    setMessage(null);

    const response = await fetch("/api/tiktok/schedules/run-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId: schedule.scheduleId }),
    });

    if (!response.ok) {
      setMessage("Run schedule request failed.");
      return;
    }

    const data = (await response.json()) as {
      publishId: string;
      status: string;
    };

    setScheduledPosts((current) =>
      current.map((item) =>
        item.scheduleId === schedule.scheduleId
          ? { ...item, status: "READY" }
          : item,
      ),
    );
    setMessage(
      `${schedule.scheduleId} ran now: ${data.status} (${data.publishId}).`,
    );
  }

  async function refreshProfileStats() {
    const response = await fetch("/api/tiktok/report/profile");
    const data = (await response.json()) as {
      profile: MockTikTokProfile;
      scopesUsed: string[];
    };

    setReportState((current) => ({
      ...current,
      profile: data.profile,
      scopesUsed: data.scopesUsed,
    }));
    setMessage("Profile stats refreshed.");
  }

  async function fetchRecentVideos() {
    const response = await fetch("/api/tiktok/report/videos");
    const data = (await response.json()) as {
      videos: MockTikTokVideo[];
      scopesUsed: string[];
    };

    setReportState((current) => ({
      ...current,
      videos: data.videos,
      scopesUsed: data.scopesUsed,
    }));
    setMessage("Recent public videos fetched.");
  }

  async function viewReport() {
    const response = await fetch("/api/tiktok/report/summary");
    const data = (await response.json()) as {
      summary: NonNullable<AdminReportState["summary"]>;
      scopesUsed: string[];
    };

    setReportState((current) => ({
      ...current,
      summary: data.summary,
      scopesUsed: data.scopesUsed,
    }));
    setMessage("Executive report generated.");
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <StatusBadge tone="info">Workspace Console</StatusBadge>
          <h1 className="mt-4 text-3xl font-bold text-[#111827] sm:text-4xl">
            Connected Social Accounts by Workspace
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5f6f84]">
            Each workspace can connect a TikTok account it is authorized to
            manage. Tokens and TikTok client secrets are never shown in the
            browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Direct Post Enabled</StatusBadge>
          <StatusBadge tone="warning">Mock Data</StatusBadge>
        </div>
      </div>

      {tokenStoreStatus?.warning ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {tokenStoreStatus.warning}
        </p>
      ) : null}

      {connectedDepartment ? (
        <p className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
          OAuth callback returned for workspace: {connectedDepartment}. The
          table status below is based only on live token store records.
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          OAuth error: {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
          {message}
        </p>
      ) : null}

      <section className="mt-8 overflow-hidden rounded-xl border border-[#e1e6ef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-[#f3f6fa] text-xs uppercase text-[#6d7c91]">
              <tr>
                <th className="px-4 py-4 font-semibold">Workspace</th>
                <th className="px-4 py-4 font-semibold">Account ID</th>
                <th className="px-4 py-4 font-semibold">TikTok nickname</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Scopes</th>
                <th className="px-4 py-4 font-semibold">Last connected</th>
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f7]">
              {accounts.map((account) => (
                <tr key={account.accountId}>
                  <td className="px-4 py-4 font-semibold text-[#1d2433]">
                    {account.department}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-[#42526a]">
                    {account.accountId}
                  </td>
                  <td className="px-4 py-4 text-[#42526a]">
                    {liveAccountById.get(account.accountId)?.nickname ||
                      account.nickname}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={statusTone(liveAccountById.has(account.accountId))}>
                      {liveAccountById.has(account.accountId)
                        ? "Connected"
                        : "Disconnected"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-[#42526a]">
                    {liveAccountById.get(account.accountId)?.scope || "-"}
                  </td>
                  <td className="px-4 py-4 text-[#42526a]">
                    {liveAccountById.get(account.accountId)?.updatedAt || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <a
                        href={`/api/tiktok/oauth/start?departmentId=${encodeURIComponent(
                          account.departmentId,
                        )}&accountId=${encodeURIComponent(account.accountId)}`}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-transparent bg-[#121827] px-3 text-xs font-semibold text-white hover:bg-[#20293a]"
                      >
                        Connect
                      </a>
                      <button
                        type="button"
                        onClick={() => disconnect(account)}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#d7dde8] bg-white px-3 text-xs font-semibold text-[#42526a] hover:bg-[#f8fafc]"
                      >
                        Disconnect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">
              Reporting Access
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5f6f84]">
              Accounts authorized for profile, stats, public video list,
              publishing, and reporting scopes.
            </p>
          </div>
          <StatusBadge tone="info">
            Scopes: user.info.basic, user.info.profile, user.info.stats, video.list, video.upload, video.publish
          </StatusBadge>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="overflow-hidden rounded-xl border border-[#e7edf6]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f3f6fa] text-xs uppercase text-[#6d7c91]">
                  <tr>
                    <th className="px-4 py-3">Workspace</th>
                    <th className="px-4 py-3">Account ID</th>
                    <th className="px-4 py-3">Reporting scopes</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f7]">
                  {accounts.map((account) => (
                    <tr key={`report-${account.accountId}`}>
                      <td className="px-4 py-3 font-semibold">
                        {account.department}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {account.accountId}
                      </td>
                      <td className="px-4 py-3 text-[#42526a]">
                        {account.scopes.join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={viewReport}
                            className="rounded-lg bg-[#121827] px-3 py-2 text-xs font-semibold text-white"
                          >
                            View Report
                          </button>
                          <button
                            type="button"
                            onClick={refreshProfileStats}
                            className="rounded-lg border border-[#d7dde8] bg-white px-3 py-2 text-xs font-semibold text-[#42526a]"
                          >
                            Refresh Profile Stats
                          </button>
                          <button
                            type="button"
                            onClick={fetchRecentVideos}
                            className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800"
                          >
                            Fetch Recent Videos
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[#e7edf6] bg-[#fbfcfe] p-4">
            <h3 className="text-base font-semibold text-[#111827]">
              Reporting Result
            </h3>
            {reportState.scopesUsed ? (
              <p className="mt-2 text-sm text-[#5f6f84]">
                Scopes used: {reportState.scopesUsed.join(", ")}
              </p>
            ) : null}
            {reportState.profile ? (
              <dl className="mt-4 grid gap-2 text-sm">
                <AdminInfo label="username" value={reportState.profile.username} />
                <AdminInfo
                  label="display_name"
                  value={reportState.profile.display_name}
                />
                <AdminInfo
                  label="followers"
                  value={reportState.profile.follower_count.toLocaleString()}
                />
                <AdminInfo
                  label="likes"
                  value={reportState.profile.likes_count.toLocaleString()}
                />
                <AdminInfo
                  label="videos"
                  value={reportState.profile.video_count.toLocaleString()}
                />
              </dl>
            ) : null}
            {reportState.videos ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-[#1d2433]">
                  Recent videos: {reportState.videos.length}
                </p>
                <ul className="mt-2 space-y-2 text-sm text-[#5f6f84]">
                  {reportState.videos.map((video) => (
                    <li key={video.id}>
                      {video.title}: {video.view_count.toLocaleString()} views
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {reportState.summary ? (
              <div className="mt-4 text-sm text-[#42526a]">
                <p className="font-semibold text-[#1d2433]">
                  Top video: {reportState.summary.topVideo}
                </p>
                <p className="mt-2">
                  Total views: {reportState.summary.totalViews.toLocaleString()}
                </p>
                <p className="mt-2">
                  Total engagements:{" "}
                  {(
                    reportState.summary.totalLikes +
                    reportState.summary.totalComments +
                    reportState.summary.totalShares
                  ).toLocaleString()}
                </p>
              </div>
            ) : null}
            {!reportState.profile &&
            !reportState.videos &&
            !reportState.summary ? (
              <p className="mt-4 text-sm text-[#6d7c91]">
                Use the reporting buttons to fetch mock authorized TikTok data.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border border-[#e1e6ef] bg-white shadow-sm">
        <div className="border-b border-[#edf1f7] px-5 py-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            Scheduled Posts
          </h2>
          <p className="mt-2 text-sm text-[#5f6f84]">
            Mock workspace schedule queue. At the scheduled time, the backend
            calls TikTok Direct Post API with the authorized account.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#f3f6fa] text-xs uppercase text-[#6d7c91]">
              <tr>
                <th className="px-4 py-4 font-semibold">scheduleId</th>
                <th className="px-4 py-4 font-semibold">Workspace</th>
                <th className="px-4 py-4 font-semibold">scheduledAt</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f7]">
              {scheduledPosts.map((schedule) => (
                <tr key={schedule.scheduleId}>
                  <td className="px-4 py-4 font-mono text-xs text-[#42526a]">
                    {schedule.scheduleId}
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#1d2433]">
                    {schedule.department}
                  </td>
                  <td className="px-4 py-4 text-[#42526a]">
                    {schedule.scheduledAt}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      tone={schedule.status === "SCHEDULED" ? "info" : "success"}
                    >
                      {schedule.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => runScheduleNow(schedule)}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-transparent bg-[#121827] px-3 text-xs font-semibold text-white hover:bg-[#20293a]"
                    >
                      Run now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function AdminInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[#6d7c91]">{label}</dt>
      <dd className="text-right font-semibold text-[#1d2433]">{value}</dd>
    </div>
  );
}

function statusTone(isConnected: boolean) {
  return isConnected ? "success" : "default";
}
