"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { departments, tiktokScopes } from "@/lib/tiktok/mockData";

type PostMode = "MEDIA_UPLOAD" | "DIRECT_POST";
type PrivacyLevel =
  | "SELF_ONLY"
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR";
type ScheduleMode = "now" | "later";

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
      ok: true;
      scheduled: true;
      scheduleId: string;
      scheduledAt: string;
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
  const [postMode, setPostMode] = useState<PostMode>("MEDIA_UPLOAD");
  const [privacyLevel, setPrivacyLevel] =
    useState<PrivacyLevel>("SELF_ONLY");
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);
  const [isAigc, setIsAigc] = useState(false);
  const [userConsent, setUserConsent] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResponse | null>(
    null,
  );
  const [clientError, setClientError] = useState<string | null>(null);

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
  const hasScheduledAt = scheduleMode === "now" || scheduledAt.length > 0;
  const canPublish =
    postMode === "MEDIA_UPLOAD" ||
    (userConsent && scheduleMode === "now") ||
    (userConsent && scheduleMode === "later" && hasScheduledAt);

  function handleDepartmentChange(value: string) {
    const nextDepartment =
      departments.find((department) => department.id === value) ||
      departments[0];

    setDepartmentId(nextDepartment.id);
    setAccountId(nextDepartment.accountId);
    setPublishResult(null);
    setClientError(null);
  }

  async function publishContent() {
    setClientError(null);
    setPublishResult(null);

    if (postMode === "DIRECT_POST" && !userConsent) {
      setClientError("Direct Post requires explicit user consent.");
      return;
    }

    if (
      scheduleMode === "later" &&
      (scheduledAt.length === 0 ||
        Number.isNaN(new Date(scheduledAt).getTime()) ||
        new Date(scheduledAt).getTime() <= Date.now())
    ) {
      setClientError("Scheduled time must be in the future.");
      return;
    }

    setIsPublishing(true);

    const payload = {
      departmentId,
      accountId,
      approval: { status: "approved", approvedBy: "pho_phong" },
      post: {
        mediaType: "VIDEO",
        postMode,
        title,
        caption,
        hashtags,
        privacyLevel,
        disableComment,
        disableDuet,
        disableStitch,
        isAigc,
        userConsent,
        scheduleMode,
        scheduledAt: scheduleMode === "later" ? scheduledAt : undefined,
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
            Login Kit, Draft Upload, Direct Post, and Schedule
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5f6f84]">
            Demo flow for authorized departments to connect TikTok, upload to
            draft/inbox with video.upload, direct publish with video.publish,
            and schedule approved content for later backend publishing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Direct Post Enabled</StatusBadge>
          <StatusBadge tone="info">Demo/Sandbox Mode</StatusBadge>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
            <StepLabel number="1" title="Connect TikTok Account" />
            <div className="mt-5 grid gap-4">
              <DepartmentFields
                departmentId={departmentId}
                accountId={accountId}
                onDepartmentChange={handleDepartmentChange}
                onAccountIdChange={setAccountId}
              />
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
                  <InfoRow label="Scopes" value={tiktokScopes.join(", ")} />
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
              <DepartmentFields
                departmentId={departmentId}
                accountId={accountId}
                onDepartmentChange={handleDepartmentChange}
                onAccountIdChange={setAccountId}
              />
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
                <InfoBlock label="Approval status" value="approved" />
                <InfoBlock label="Approved by" value="pho_phong" />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111827]">
              TikTok Phone Preview
            </h2>
            <div className="mt-5 flex justify-center">
              <div className="h-[620px] w-full max-w-[330px] rounded-[2rem] border-[10px] border-[#111827] bg-[#0d1117] p-4 shadow-lg">
                <div className="h-full rounded-[1.4rem] bg-[#171c24] p-4 text-white">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>{selectedDepartment.nickname}</span>
                    <span>{postMode === "DIRECT_POST" ? "Direct" : "Draft"}</span>
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
            <StepLabel number="3" title="Publishing Options" />
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
                Post Mode
                <select
                  value={postMode}
                  onChange={(event) => setPostMode(event.target.value as PostMode)}
                  className="min-h-11 rounded-lg border border-[#cfd7e3] bg-white px-3 text-sm font-medium outline-none focus:border-cyan-500"
                >
                  <option value="MEDIA_UPLOAD">
                    Upload to TikTok Draft / MEDIA_UPLOAD
                  </option>
                  <option value="DIRECT_POST">Direct Post / DIRECT_POST</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
                Privacy
                <select
                  value={privacyLevel}
                  onChange={(event) =>
                    setPrivacyLevel(event.target.value as PrivacyLevel)
                  }
                  className="min-h-11 rounded-lg border border-[#cfd7e3] bg-white px-3 text-sm font-medium outline-none focus:border-cyan-500"
                >
                  <option value="SELF_ONLY">SELF_ONLY</option>
                  <option value="PUBLIC_TO_EVERYONE">PUBLIC_TO_EVERYONE</option>
                  <option value="MUTUAL_FOLLOW_FRIENDS">
                    MUTUAL_FOLLOW_FRIENDS
                  </option>
                  <option value="FOLLOWER_OF_CREATOR">
                    FOLLOWER_OF_CREATOR
                  </option>
                </select>
              </label>
              <div className="grid gap-3 rounded-lg border border-[#e7edf6] bg-[#fbfcfe] p-4 text-sm sm:grid-cols-2">
                <CheckBox
                  label="disable_comment"
                  checked={disableComment}
                  onChange={setDisableComment}
                />
                <CheckBox
                  label="disable_duet"
                  checked={disableDuet}
                  onChange={setDisableDuet}
                />
                <CheckBox
                  label="disable_stitch"
                  checked={disableStitch}
                  onChange={setDisableStitch}
                />
                <CheckBox
                  label="is_aigc"
                  checked={isAigc}
                  onChange={setIsAigc}
                />
              </div>
              <CheckBox
                label="I confirm this content is approved and I authorize this app to publish it to the connected TikTok account."
                checked={userConsent}
                onChange={setUserConsent}
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
            <StepLabel number="4" title="Schedule" />
            <div className="mt-5 grid gap-4">
              <div className="grid gap-3 text-sm font-semibold text-[#1d2433] sm:grid-cols-2">
                <RadioOption
                  label="Publish now"
                  checked={scheduleMode === "now"}
                  onChange={() => setScheduleMode("now")}
                />
                <RadioOption
                  label="Schedule for later"
                  checked={scheduleMode === "later"}
                  onChange={() => setScheduleMode("later")}
                />
              </div>
              {scheduleMode === "later" ? (
                <div className="grid gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                  <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
                    Scheduled time
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) => setScheduledAt(event.target.value)}
                      className="min-h-11 rounded-lg border border-[#cfd7e3] bg-white px-3 text-sm font-normal outline-none focus:border-cyan-500"
                    />
                  </label>
                  <p className="text-sm font-semibold text-[#1d2433]">
                    Timezone: Asia/Ho_Chi_Minh
                  </p>
                  <p className="text-sm leading-6 text-[#42526a]">
                    The scheduled time is stored by TanPhatETek TikTok
                    Publisher. At the scheduled time, the backend calls TikTok
                    Direct Post API on behalf of the authorized account.
                  </p>
                  {scheduledAt.length === 0 ? (
                    <p className="text-sm font-semibold text-rose-700">
                      Scheduled time is required and must be in the future.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-3 rounded-lg border border-[#e7edf6] bg-[#fbfcfe] p-4 text-sm">
                <InfoRow label="Product" value="Content Posting API" />
                <InfoRow
                  label="Scope used"
                  value={postMode === "DIRECT_POST" ? "video.publish" : "video.upload"}
                />
                <InfoRow label="Post mode" value={postMode} />
                <InfoRow
                  label="Direct Post"
                  value="Enabled in Developer Portal"
                  valueClassName="text-emerald-700"
                />
              </div>

              {clientError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                  {clientError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={publishContent}
                disabled={isPublishing || !canPublish}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#121827] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20293a] disabled:cursor-not-allowed disabled:bg-[#8792a2]"
              >
                {isPublishing ? "Publishing..." : publishButtonLabel(postMode, scheduleMode)}
              </button>

              {publishResult ? (
                <PublishResultPanel result={publishResult} />
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function publishButtonLabel(postMode: PostMode, scheduleMode: ScheduleMode) {
  if (postMode === "MEDIA_UPLOAD") {
    return "Upload to TikTok Draft";
  }

  if (scheduleMode === "later") {
    return "Schedule Direct Post";
  }

  return "Direct Post to TikTok";
}

function PublishResultPanel({ result }: { result: PublishResponse }) {
  if (!result.ok) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-semibold text-rose-700">
          {result.errorCode}: {result.message || "Publish request failed."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <dl className="grid gap-3 text-sm">
        <InfoRow label="Status" value={result.status} />
        {"publishId" in result ? (
          <InfoRow label="publishId" value={result.publishId} />
        ) : null}
        {"scheduleId" in result ? (
          <>
            <InfoRow label="scheduleId" value={result.scheduleId} />
            <InfoRow label="scheduledAt" value={result.scheduledAt} />
          </>
        ) : null}
        <InfoRow label="Mode" value={result.mode} />
        <InfoRow label="Product" value={result.product} />
        <InfoRow label="Scope used" value={result.scopeUsed} />
      </dl>
    </div>
  );
}

function DepartmentFields({
  departmentId,
  accountId,
  onDepartmentChange,
  onAccountIdChange,
}: {
  departmentId: string;
  accountId: string;
  onDepartmentChange: (value: string) => void;
  onAccountIdChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-semibold text-[#1d2433]">
        Department
        <select
          value={departmentId}
          onChange={(event) => onDepartmentChange(event.target.value)}
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
          onChange={(event) => onAccountIdChange(event.target.value)}
          className="min-h-11 rounded-lg border border-[#cfd7e3] bg-white px-3 text-sm font-normal outline-none focus:border-cyan-500"
        />
      </label>
    </div>
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
      <dd className={`text-right font-semibold ${valueClassName}`}>{value}</dd>
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

function CheckBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm font-semibold text-[#1d2433]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-[#cfd7e3]"
      />
      <span>{label}</span>
    </label>
  );
}

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[#cfd7e3] bg-white px-3">
      <input type="radio" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
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
