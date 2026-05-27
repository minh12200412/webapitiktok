export type MediaMetadata = {
  key: string;
  storageUrl: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

const mediaMetadata = new Map<string, MediaMetadata>();

export function saveMediaMetadata(metadata: MediaMetadata) {
  mediaMetadata.set(metadata.key, metadata);
}

export function getMediaMetadata(key: string): MediaMetadata | null {
  return mediaMetadata.get(key) || null;
}

export function buildVerifiedMediaUrl(request: Request, key: string): string {
  const appBaseUrl =
    process.env.APP_BASE_URL?.replace(/\/+$/, "") ||
    new URL(request.url).origin;

  return `${appBaseUrl}/api/media/file/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function redactStorageUrl(value: string): string {
  try {
    const url = new URL(value);
    return `${url.origin}/...`;
  } catch {
    return "[redacted]";
  }
}
