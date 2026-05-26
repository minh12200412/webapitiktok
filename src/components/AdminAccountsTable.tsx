"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { mockAccounts, type MockTikTokAccount } from "@/lib/tiktok/mockData";

export function AdminAccountsTable() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<MockTikTokAccount[]>(mockAccounts);
  const [message, setMessage] = useState<string | null>(null);
  const connectedDepartment = searchParams.get("departmentId");
  const error = searchParams.get("error");

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
    setMessage(`${account.department} disconnected.`);
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <StatusBadge tone="info">Internal Admin</StatusBadge>
          <h1 className="mt-4 text-3xl font-bold text-[#111827] sm:text-4xl">
            TikTok Accounts by Department
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5f6f84]">
            Manage department TikTok account connections without showing tokens
            or TikTok client secrets in the browser.
          </p>
        </div>
        <StatusBadge tone="warning">Mock Data</StatusBadge>
      </div>

      {connectedDepartment ? (
        <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Connected account for department: {connectedDepartment}
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
                <th className="px-4 py-4 font-semibold">Department</th>
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
                    {account.nickname}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={statusTone(account.status)}>
                      {account.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-[#42526a]">
                    {account.scopes.length > 0
                      ? account.scopes.join(", ")
                      : "-"}
                  </td>
                  <td className="px-4 py-4 text-[#42526a]">
                    {account.lastConnected}
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
    </main>
  );
}

function statusTone(status: MockTikTokAccount["status"]) {
  if (status === "Connected") {
    return "success";
  }

  if (status === "Token expired") {
    return "warning";
  }

  return "default";
}
