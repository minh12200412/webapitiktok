# TanPhatETek TikTok Publisher

Public Next.js web app for TikTok Developer App Review and internal TikTok publisher management for Tan Phat ETEK.

The phase 1 app runs in mock/sandbox mode. It demonstrates Login Kit OAuth, department account mapping, approved content preparation, and Content Posting API upload to TikTok draft/inbox flow. It does not store live tokens and does not perform live TikTok publishing by default.

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
TIKTOK_SCOPES=user.info.basic,video.upload
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
TIKTOK_SCOPES=user.info.basic,video.upload
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
Products: Login Kit + Content Posting API
Scopes: user.info.basic + video.upload
```

Phase 1 exclusions:

```text
Do not enable Webhook.
Do not enable Share Kit.
Do not enable Direct Post.
```

## Demo Video Checklist

1. Open the landing page.
2. Open `/tiktok-publisher-demo`.
3. Select a department and connect TikTok sandbox/mock.
4. Show connected TikTok account, masked open_id, and scopes.
5. Prepare approved content.
6. Upload to TikTok draft.
7. Show Content Posting API, `video.upload`, `SEND_TO_USER_INBOX`, and `publishId`.
8. Open `/admin/tiktok-accounts` and show department account mapping.

## API Routes

```text
GET  /api/health
GET  /api/tiktok/oauth/start?departmentId=kdtm&accountId=tiktok_kdtm_main
GET  /api/tiktok/oauth/callback
POST /api/tiktok/publish/mock
POST /api/tiktok/disconnect
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
    "hashtags": "#tanphatetek #koisu #garage #carcare"
  }
}
```

## Security Notes

- Tokens are never displayed in the UI.
- Client secrets, access tokens, and refresh tokens must not be logged.
- Secrets belong in environment variables.
- Production token storage requires a database, encryption, and restricted access controls.
- This phase uses mock/in-memory data only.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
