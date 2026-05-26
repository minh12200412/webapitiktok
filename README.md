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
TOKEN_ENCRYPTION_KEY=
```

If `TIKTOK_CLIENT_KEY` or `TIKTOK_REDIRECT_URI` is missing, `/api/tiktok/oauth/start` redirects back to the demo page with a mock connected account.

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
