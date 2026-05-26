export type MockPublishPayload = {
  departmentId: string;
  accountId: string;
  approval: {
    status: string;
    approvedBy?: string;
  };
  post: {
    mediaType: "VIDEO" | "PHOTO";
    postMode: "MEDIA_UPLOAD" | "DIRECT_POST";
    title?: string;
    caption?: string;
    hashtags?: string;
    privacyLevel?:
      | "SELF_ONLY"
      | "PUBLIC_TO_EVERYONE"
      | "MUTUAL_FOLLOW_FRIENDS"
      | "FOLLOWER_OF_CREATOR";
    disableComment?: boolean;
    disableDuet?: boolean;
    disableStitch?: boolean;
    isAigc?: boolean;
    userConsent?: boolean;
    scheduleMode?: "now" | "later";
    scheduledAt?: string;
  };
};

export type MockPublishResult =
  | {
      ok: true;
      publishId: string;
      status: "SEND_TO_USER_INBOX" | "PUBLISH_COMPLETE";
      mode: "MEDIA_UPLOAD" | "DIRECT_POST";
      product: "Content Posting API";
      scopeUsed: "video.upload" | "video.publish";
      departmentId: string;
      accountId: string;
    }
  | {
      ok: true;
      scheduled: true;
      scheduleId: string;
      scheduledAt: string;
      status: "SCHEDULED";
      mode: "DIRECT_POST";
      product: "Content Posting API";
      scopeUsed: "video.publish";
      departmentId: string;
      accountId: string;
    };

export function publishMock(payload: MockPublishPayload): MockPublishResult {
  if (payload.post.postMode === "DIRECT_POST") {
    if (payload.post.scheduleMode === "later" && payload.post.scheduledAt) {
      return {
        ok: true,
        scheduled: true,
        scheduleId: `mock_schedule_${Date.now()}`,
        scheduledAt: payload.post.scheduledAt,
        status: "SCHEDULED",
        mode: "DIRECT_POST",
        product: "Content Posting API",
        scopeUsed: "video.publish",
        departmentId: payload.departmentId,
        accountId: payload.accountId,
      };
    }

    return {
      ok: true,
      publishId: `mock_publish_${Date.now()}`,
      status: "PUBLISH_COMPLETE",
      mode: "DIRECT_POST",
      product: "Content Posting API",
      scopeUsed: "video.publish",
      departmentId: payload.departmentId,
      accountId: payload.accountId,
    };
  }

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
