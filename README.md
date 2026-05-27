# TanPhatETek TikTok Publisher

Public Next.js web app for TikTok Developer App Review and internal TikTok publisher management for Tan Phat ETEK.

The phase 1 app runs in mock/sandbox mode. It demonstrates Login Kit OAuth, department account mapping, approved content preparation, Content Posting API upload to TikTok draft/inbox flow, Direct Post, scheduled publishing, TikTok reporting, and executive summaries. It does not store live tokens and does not call live TikTok APIs by default.

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3008
```

Useful local routes:

```text
http://localhost:3008/
http://localhost:3008/privacy
http://localhost:3008/terms
http://localhost:3008/tiktok-publisher-demo
http://localhost:3008/admin/tiktok-accounts
http://localhost:3008/api/health
```

## Environment

Create a local `.env` from `.env.example` when needed. Do not commit `.env`.

```bash
APP_BASE_URL=http://localhost:3008
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=http://localhost:3008/api/tiktok/oauth/callback
TIKTOK_SCOPES=user.info.basic,user.info.profile,user.info.stats,video.upload,video.publish,video.list
TIKTOK_LIVE_OAUTH=false
DATABASE_URL=
TOKEN_ENCRYPTION_KEY=
TOKEN_ENCRYPTION_KEY=
```

If `TIKTOK_CLIENT_KEY` or `TIKTOK_REDIRECT_URI` is missing, `/api/tiktok/oauth/start` redirects back to the demo page with a mock connected account.

## Live TikTok OAuth

For live OAuth on Vercel, set these environment variables:

```text
APP_BASE_URL=https://webapitiktok.vercel.app
TIKTOK_CLIENT_KEY=<from TikTok Developer Portal>
TIKTOK_CLIENT_SECRET=<from TikTok Developer Portal>
TIKTOK_REDIRECT_URI=https://webapitiktok.vercel.app/api/tiktok/oauth/callback
TIKTOK_SCOPES=user.info.basic,user.info.profile,user.info.stats,video.upload,video.publish,video.list
TIKTOK_LIVE_OAUTH=true
DATABASE_URL=<Supabase or Vercel Postgres connection string>
TOKEN_ENCRYPTION_KEY=<strong random key>
```

Flow per department:

1. Open `/admin/tiktok-accounts`.
2. Click `Connect` for the target department/account ID.
3. TikTok redirects to `/api/tiktok/oauth/callback` with `code` and `state`.
4. The backend exchanges the code for `access_token`, `refresh_token`, `open_id`, scope, and expiry metadata.
5. Tokens are encrypted server-side and stored by `accountId` and `departmentId`.
6. Admin UI shows Connected when token metadata exists, but never displays tokens.

If `DATABASE_URL` is not configured, the app uses an in-memory token store for local development only and shows: `Live tokens are not persisted without DB`. This is not suitable for production because Vercel serverless instances do not guarantee memory persistence.

The PostgreSQL/Supabase token table is created automatically if the DB user has permission:

```sql
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
);
```

## Live Publish Test

Use this only after TikTok OAuth has connected an account and the token store contains account metadata.

Checklist:

1. Connect the TikTok account first from `/admin/tiktok-accounts`.
2. Confirm `/api/tiktok/tokens/accounts` includes the target `accountId`, for example `tiktok_kdtm_main`.
3. Use a public HTTPS video URL. The Content Posting API pull-from-URL flow cannot read local files.
4. Test `MEDIA_UPLOAD` first. This sends the video to TikTok inbox/draft flow with `video.upload`.
5. Then test `DIRECT_POST` with `SELF_ONLY`. While the app is in sandbox or under review, public posting may be limited by TikTok.
6. Do not expose access tokens, refresh tokens, or client secrets in UI, logs, or browser responses.

The demo page has a `Mock / Live` toggle. In Live mode it calls:

```text
POST /api/tiktok/publish/live
```

Opening the endpoint in a browser returns a helper response:

```text
GET /api/tiktok/publish/live
```

Live publish payload example:

```json
{
  "departmentId": "kdtm",
  "accountId": "tiktok_kdtm_main",
  "approval": {
    "status": "approved",
    "approvedBy": "pho_phong"
  },
  "post": {
    "mediaType": "VIDEO",
    "postMode": "MEDIA_UPLOAD",
    "title": "KOISU WA-4018T4 High Pressure Washer",
    "caption": "Approved marketing content for garage and car care businesses.",
    "hashtags": ["#tanphatetek", "#koisu", "#garage"],
    "privacyLevel": "SELF_ONLY",
    "disableComment": false,
    "disableDuet": false,
    "disableStitch": false,
    "isAigc": true
  },
  "assets": [
    {
      "type": "video",
      "sourceType": "url",
      "url": "https://webapitiktok.vercel.app/sample/koisu-wa4018t4-demo.mp4"
    }
  ]
}
```

Do not commit large videos. For a small test asset, place a compact MP4 file at:

```text
public/sample/koisu-wa4018t4-demo.mp4
```

After deploy, the public URL will be:

```text
https://webapitiktok.vercel.app/sample/koisu-wa4018t4-demo.mp4
```

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial TikTok publisher web"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Vercel Free Deploy

1. Push this repository to GitHub.
2. Import the GitHub repository into Vercel.
3. Set environment variables in Vercel Project Settings.
4. Deploy with the default Next.js framework settings.

Recommended production environment values:

```text
APP_BASE_URL=https://<vercel-domain>
TIKTOK_REDIRECT_URI=https://<vercel-domain>/api/tiktok/oauth/callback
TIKTOK_SCOPES=user.info.basic,user.info.profile,user.info.stats,video.upload,video.publish,video.list
TIKTOK_LIVE_OAUTH=false
```

Set `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` only in Vercel environment variables. Do not expose them through `NEXT_PUBLIC_` variables.

## TikTok Developer App Config

Use these URLs after Vercel deploy:

```text
Website URL: https://<vercel-domain>
Privacy URL: https://<vercel-domain>/privacy
Terms URL: https://<vercel-domain>/terms
Redirect URI: https://<vercel-domain>/api/tiktok/oauth/callback
```

Products and scopes:

```text
Products:
- Login Kit
- Content Posting API

Scopes:
- user.info.basic
- user.info.profile
- user.info.stats
- video.upload
- video.publish
- video.list

Direct Post: enabled
Webhook: not used
Share Kit: not used
```

Phase 1 exclusions:

```text
Do not enable Webhook.
Do not enable Share Kit.
```

## Demo Video Checklist

1. Open the landing page.
2. Open `/tiktok-publisher-demo`.
3. Select a department and connect TikTok sandbox/mock.
4. Show connected TikTok account, masked open_id, and scopes.
5. Prepare approved content.
6. Upload to TikTok draft and show `video.upload`, `SEND_TO_USER_INBOX`, and `publishId`.
7. Switch to Direct Post, check consent, publish now, and show `video.publish` with `PUBLISH_COMPLETE`.
8. Switch to Schedule for later, choose a future time, and show `SCHEDULED` with `scheduleId`.
9. Fetch Profile & Stats Report and show `user.info.profile` + `user.info.stats`.
10. Fetch Recent Public Videos and show `video.list`.
11. Generate AI Executive Summary for leadership.
12. Open `/admin/tiktok-accounts`, show department account mapping, Direct Post Enabled, Reporting Access, Scheduled Posts, and Run now.

## API Routes

```text
GET  /api/health
GET  /api/tiktok/oauth/start?departmentId=kdtm&accountId=tiktok_kdtm_main
GET  /api/tiktok/oauth/callback
POST /api/tiktok/publish/mock
POST /api/tiktok/disconnect
POST /api/tiktok/schedules/run-now
GET  /api/tiktok/report/profile
GET  /api/tiktok/report/videos
GET  /api/tiktok/report/summary
GET  /api/tiktok/publish/live
POST /api/tiktok/publish/live
```

Approved publish payload:

```json
{
  "departmentId": "kdtm",
  "accountId": "tiktok_kdtm_main",
  "approval": { "status": "approved", "approvedBy": "pho_phong" },
  "post": {
    "mediaType": "VIDEO",
    "postMode": "MEDIA_UPLOAD",
    "title": "KOISU WA-4018T4 High Pressure Washer",
    "caption": "Approved marketing content for garage and car care businesses.",
    "hashtags": "#tanphatetek #koisu #garage #carcare",
    "privacyLevel": "SELF_ONLY",
    "disableComment": false,
    "disableDuet": false,
    "disableStitch": false,
    "isAigc": false,
    "userConsent": false,
    "scheduleMode": "now"
  }
}
```

Direct Post payload uses `"postMode": "DIRECT_POST"` and requires `"userConsent": true`. Scheduled Direct Post uses `"scheduleMode": "later"` and a future `"scheduledAt"` value.

## Security Notes

- Tokens are never displayed in the UI.
- Client secrets, access tokens, and refresh tokens must not be logged.
- Secrets belong in environment variables.
- Production token storage requires a database, encryption, and restricted access controls.
- Direct Post requires explicit user consent in the publishing UI.
- Scheduled post metadata is stored by the internal system before backend publishing.
- Reporting data is used for internal leadership review and content planning.
- Public video metadata and account statistics are read only after OAuth authorization.
- This phase uses mock/in-memory data only.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
