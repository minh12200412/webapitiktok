export type MockPublishPayload = {
  departmentId: string;
  accountId: string;
  approval: {
    status: string;
    approvedBy?: string;
  };
  post: {
    mediaType: "VIDEO" | "PHOTO";
    postMode: "MEDIA_UPLOAD";
    title?: string;
    caption?: string;
    hashtags?: string;
  };
};

export type MockPublishResult = {
  ok: true;
  publishId: string;
  status: "SEND_TO_USER_INBOX";
  mode: "MEDIA_UPLOAD";
  product: "Content Posting API";
  scopeUsed: "video.upload";
  departmentId: string;
  accountId: string;
};

export function publishMock(payload: MockPublishPayload): MockPublishResult {
  return {
    ok: true,
    publishId: `mock_publish_${Date.now()}`,
    status: "SEND_TO_USER_INBOX",
    mode: "MEDIA_UPLOAD",
    product: "Content Posting API",
    scopeUsed: "video.upload",
    departmentId: payload.departmentId,
    accountId: payload.accountId,
  };
}
