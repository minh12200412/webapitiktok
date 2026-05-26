"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { departments } from "@/lib/tiktok/mockData";

type PublishResponse =
  | {
      ok: true;
      publishId: string;
      status: string;
      mode: string;
      product: string;
      scopeUsed: string;
      departmentId: string;
      accountId: string;
    }
  | {
      ok: false;
      errorCode: string;
      message?: string;
    };

export function DemoPublisher() {
  const searchParams = useSearchParams();
  const initialDepartmentId = searchParams.get("departmentId") || "kdtm";
  const initialDepartment =
    departments.find((department) => department.id === initialDepartmentId) ||
    departments[0];
  const [departmentId, setDepartmentId] = useState(initialDepartment.id);
  const [accountId, setAccountId] = useState(
    searchParams.get("accountId") || initialDepartment.accountId,
  );
  const [title, setTitle] = useState("KOISU WA-4018T4 High Pressure Washer");
  const [caption, setCaption] = useState(
    "Approved marketing content for garage and car care businesses.",
  );
  const [hashtags, setHashtags] = useState(
    "#tanphatetek #koisu #garage #carcare",
  );
  const [mediaUrl, setMediaUrl] = useState(
    "https://example.com/media/koisu-wa-4018t4-demo.mp4",
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResponse | null>(
    null,
  );

  const selectedDepartment = useMemo(
    () =>
      departments.find((department) => department.id === departmentId) ||
      departments[0],
    [departmentId],
  );

  const isConnected =
    searchParams.get("mockConnected") === "1" ||
    searchParams.get("connected") === "1";
  const connectHref = `/api/tiktok/oauth/start?departmentId=${encodeURIComponent(
    departmentId,
  )}&accountId=${encodeURIComponent(accountId)}`;
  const mockOpenId = `open_****_${selectedDepartment.id}`;

  function handleDepartmentChange(value: string) {
    const nextDepartment =
      departments.find((department) => department.id === value) ||
      departments[0];

    setDepartmentId(nextDepartment.id);
    setAccountId(nextDepartment.accountId);
    setPublishResult(null);
  }

  async function uploadToDraft() {
    setIsPublishing(true);
    setPublishResult(null);

    const payload = {
      departmentId,
      accountId,
      approval: { status: "approved", approvedBy: "pho_phong" },
      post: {
        mediaType: "VIDEO",
        postMode: "MEDIA_UPLOAD",
        title,
        caption,
        hashtags,
      },
    };

    try {
      const response = await fetch("/api/tiktok/publish/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as PublishResponse;
      setPublishResult(data);
    } catch {
      setPublishResult({
        ok: false,
        errorCode: "NETWORK_ERROR",
        message: "Unable to call mock publish API.",
      });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <StatusBadge tone="info">TikTok Review Demo</StatusBadge>
          <h1 className="mt-4 text-3xl font-bold text-[#111827] sm:text-4xl">
            Login Kit + Content Posting API Flow
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5f6f84]">
            Demo flow for authorized departments to connect a TikTok account,
            prepare approved content, and upload it to TikTok draft/inbox flow.
          </p>
        </div>
        <StatusBadge tone="success">Demo/Sandbox Mode</StatusBadge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
            <StepLabel number="1" title="Connect TikTok Account" />
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
                Department
                <select
                  value={departmentId}
                  onChange={(event) =>
                    handleDepartmentChange(event.target.value)
                  }
                  className="min-h-11 rounded-lg border border-[#cfd7e3] bg-white px-3 text-sm font-medium outline-none focus:border-cyan-500"
                >
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
                Account ID
                <input
                  value={accountId}
                  onChange={(event) => setAccountId(event.target.value)}
                  className="min-h-11 rounded-lg border border-[#cfd7e3] bg-white px-3 text-sm outline-none focus:border-cyan-500"
                />
              </label>
              <a
                href={connectHref}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#121827] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20293a]"
              >
                Connect TikTok Sandbox
              </a>
            </div>

            {isConnected ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold text-emerald-900">
                    Connected TikTok Account
                  </h3>
                  <StatusBadge tone="success">Connected</StatusBadge>
                </div>
                <dl className="mt-4 grid gap-3 text-sm">
                  <InfoRow
                    label="Nickname"
                    value={selectedDepartment.nickname}
                  />
                  <InfoRow label="open_id" value={mockOpenId} />
                  <InfoRow
                    label="Scopes"
                    value="user.info.basic, video.upload"
                  />
                  <InfoRow label="Product" value="Login Kit" />
                </dl>
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Click the sandbox connect button to show the TikTok Login Kit
                connected state for app review.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
            <StepLabel number="2" title="Prepare Approved Content" />
            <div className="mt-5 grid gap-4">
              <TextInput label="Title" value={title} onChange={setTitle} />
              <TextArea label="Caption" value={caption} onChange={setCaption} />
              <TextInput
                label="Hashtags"
                value={hashtags}
                onChange={setHashtags}
              />
              <TextInput
                label="Sample media URL"
                value={mediaUrl}
                onChange={setMediaUrl}
              />
              <div className="grid gap-3 rounded-lg border border-[#e7edf6] bg-[#fbfcfe] p-4 text-sm sm:grid-cols-3">
                <InfoBlock label="Media Type" value="VIDEO" />
                <InfoBlock label="Approval status" value="Approved" />
                <InfoBlock label="Approved by" value="pho_phong" />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111827]">
              TikTok Mock Preview
            </h2>
            <div className="mt-5 flex justify-center">
              <div className="h-[620px] w-full max-w-[330px] rounded-[2rem] border-[10px] border-[#111827] bg-[#0d1117] p-4 shadow-lg">
                <div className="h-full rounded-[1.4rem] bg-[#171c24] p-4 text-white">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>{selectedDepartment.nickname}</span>
                    <span>Draft Preview</span>
                  </div>
                  <div className="mt-6 flex h-[370px] items-center justify-center rounded-xl border border-white/10 bg-[#232b36] text-center">
                    <div>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-lg font-bold text-[#101722]">
                        TP
                      </div>
                      <p className="mt-4 px-4 text-sm leading-6 text-white/75">
                        {mediaUrl || "Sample media placeholder"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      {caption}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-cyan-300">
                      {hashtags}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
            <StepLabel number="3" title="Upload to TikTok Draft" />
            <div className="mt-5 grid gap-3 rounded-lg border border-[#e7edf6] bg-[#fbfcfe] p-4 text-sm">
              <InfoRow label="Product" value="Content Posting API" />
              <InfoRow label="Scope used" value="video.upload" />
              <InfoRow label="Post mode" value="MEDIA_UPLOAD" />
              <InfoRow
                label="Direct Post"
                value="Disabled in this version"
                valueClassName="text-rose-700"
              />
            </div>
            <button
              type="button"
              onClick={uploadToDraft}
              disabled={isPublishing}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#121827] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20293a] disabled:cursor-not-allowed disabled:bg-[#8792a2]"
            >
              {isPublishing ? "Uploading..." : "Upload to TikTok Draft"}
            </button>

            {publishResult ? (
              <div
                className={`mt-5 rounded-xl border p-4 ${
                  publishResult.ok
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                {publishResult.ok ? (
                  <dl className="grid gap-3 text-sm">
                    <InfoRow label="Status" value={publishResult.status} />
                    <InfoRow label="publishId" value={publishResult.publishId} />
                    <InfoRow label="Mode" value={publishResult.mode} />
                    <InfoRow label="Product" value={publishResult.product} />
                    <InfoRow
                      label="Scope used"
                      value={publishResult.scopeUsed}
                    />
                  </dl>
                ) : (
                  <p className="text-sm font-semibold text-rose-700">
                    {publishResult.errorCode}:{" "}
                    {publishResult.message || "Publish request failed."}
                  </p>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function StepLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#121827] text-sm font-bold text-white">
        {number}
      </span>
      <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = "text-[#1d2433]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <dt className="text-[#6d7c91]">{label}</dt>
      <dd className={`font-semibold ${valueClassName}`}>{value}</dd>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-[#6d7c91]">{label}</p>
      <p className="mt-1 font-semibold text-[#1d2433]">{value}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-[#cfd7e3] bg-white px-3 text-sm font-normal outline-none focus:border-cyan-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
      {label}
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-[#cfd7e3] bg-white px-3 py-3 text-sm font-normal leading-6 outline-none focus:border-cyan-500"
      />
    </label>
  );
}
