import { getMediaMetadata } from "@/lib/media/mediaStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const key = path.map(decodeURIComponent).join("/");
  const metadata = getMediaMetadata(key);

  if (!metadata) {
    return Response.json(
      {
        ok: false,
        errorCode: "MEDIA_FILE_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  const range = request.headers.get("range");
  const upstream = await fetch(metadata.storageUrl, {
    headers: range ? { Range: range } : undefined,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return Response.json(
      {
        ok: false,
        errorCode: "MEDIA_STORAGE_FETCH_FAILED",
      },
      { status: 502 },
    );
  }

  const headers = new Headers();
  const contentType =
    upstream.headers.get("content-type") || metadata.contentType;
  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");

  headers.set("Content-Type", contentType);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  } else if (!range) {
    headers.set("Content-Length", String(metadata.sizeBytes));
  }

  if (contentRange) {
    headers.set("Content-Range", contentRange);
  }

  return new Response(upstream.body, {
    status: upstream.status === 206 ? 206 : 200,
    headers,
  });
}
