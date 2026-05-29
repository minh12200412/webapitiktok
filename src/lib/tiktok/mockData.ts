export type Department = {
  id: string;
  name: string;
  accountId: string;
  nickname: string;
};

export type MockTikTokAccount = {
  departmentId: string;
  department: string;
  accountId: string;
  nickname: string;
  status: "Connected" | "Disconnected" | "Token expired";
  scopes: string[];
  lastConnected: string;
  directPostEnabled: boolean;
};

export type MockScheduledPost = {
  scheduleId: string;
  department: string;
  scheduledAt: string;
  status: "SCHEDULED" | "READY";
};

export const tiktokScopes = [
  "user.info.basic",
  "user.info.profile",
  "user.info.stats",
  "video.upload",
  "video.publish",
  "video.list",
];

export type MockTikTokProfile = {
  open_id: string;
  username: string;
  display_name: string;
  bio_description: string;
  profile_deep_link: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
};

export type MockTikTokVideo = {
  id: string;
  title: string;
  create_time: number;
  duration: number;
  share_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
};

export const mockTikTokProfile: MockTikTokProfile = {
  open_id: "open_****_kdtm",
  username: "autoparts_workspace",
  display_name: "Auto Parts Brand",
  bio_description:
    "Authorized TikTok account for an automotive parts content workspace.",
  profile_deep_link: "https://www.tiktok.com/@autoparts_workspace",
  is_verified: false,
  follower_count: 12500,
  following_count: 120,
  likes_count: 246000,
  video_count: 86,
};

export const mockTikTokVideos: MockTikTokVideo[] = [
  {
    id: "video_001",
    title: "KOISU high pressure washer demo",
    create_time: 1718000000,
    duration: 35,
    share_url: "https://www.tiktok.com/@tanphatetek_kdtm/video/001",
    view_count: 152000,
    like_count: 6800,
    comment_count: 214,
    share_count: 530,
  },
  {
    id: "video_002",
    title: "Garage equipment setup overview",
    create_time: 1717900000,
    duration: 42,
    share_url: "https://www.tiktok.com/@tanphatetek_kdtm/video/002",
    view_count: 98000,
    like_count: 4200,
    comment_count: 168,
    share_count: 310,
  },
  {
    id: "video_003",
    title: "Wheel balancing machine product highlight",
    create_time: 1717800000,
    duration: 28,
    share_url: "https://www.tiktok.com/@tanphatetek_kdtm/video/003",
    view_count: 76000,
    like_count: 3100,
    comment_count: 94,
    share_count: 205,
  },
];

export const mockExecutiveSummary = {
  totalVideosAnalyzed: 3,
  totalViews: 326000,
  totalLikes: 14100,
  totalComments: 476,
  totalShares: 1045,
  topVideo: "KOISU high pressure washer demo",
  insights: [
    "Product demonstration videos generate the highest view and engagement volume.",
    "Garage setup content performs well with professional B2B audiences.",
    "Short technical highlight videos are useful for consistent posting cadence.",
  ],
  recommendations: [
    "Post more product demonstration videos for KOISU and garage equipment.",
    "Use direct post scheduling for morning and evening publishing windows.",
    "Create weekly team and executive reports by workspace and TikTok account.",
  ],
};

export const departments: Department[] = [
  {
    id: "kdtm",
    name: "Workspace A - Auto Parts Brand",
    accountId: "tiktok_kdtm_main",
    nickname: "Auto Parts Brand",
  },
  {
    id: "kd1",
    name: "Workspace B - Garage Equipment",
    accountId: "tiktok_kd1_main",
    nickname: "Garage Equipment",
  },
  {
    id: "kd2",
    name: "Workspace C - Service Campaigns",
    accountId: "tiktok_kd2_main",
    nickname: "Service Campaigns",
  },
  {
    id: "koisu",
    name: "Workspace D - Product Launch",
    accountId: "tiktok_koisu_main",
    nickname: "Product Launch",
  },
  {
    id: "tanphat",
    name: "Workspace E - Creator Studio",
    accountId: "tiktok_tanphat_main",
    nickname: "Creator Studio",
  },
];

export const mockAccounts: MockTikTokAccount[] = [
  {
    departmentId: "kdtm",
    department: "Workspace A - Auto Parts Brand",
    accountId: "tiktok_kdtm_main",
    nickname: "Auto Parts Brand",
    status: "Connected",
    scopes: tiktokScopes,
    lastConnected: "2026-05-12 09:20",
    directPostEnabled: true,
  },
  {
    departmentId: "kd1",
    department: "Workspace B - Garage Equipment",
    accountId: "tiktok_kd1_main",
    nickname: "-",
    status: "Disconnected",
    scopes: tiktokScopes,
    lastConnected: "-",
    directPostEnabled: true,
  },
  {
    departmentId: "kd2",
    department: "Workspace C - Service Campaigns",
    accountId: "tiktok_kd2_main",
    nickname: "-",
    status: "Disconnected",
    scopes: tiktokScopes,
    lastConnected: "-",
    directPostEnabled: true,
  },
  {
    departmentId: "koisu",
    department: "Workspace D - Product Launch",
    accountId: "tiktok_koisu_main",
    nickname: "Product Launch",
    status: "Connected",
    scopes: tiktokScopes,
    lastConnected: "2026-05-14 15:45",
    directPostEnabled: true,
  },
  {
    departmentId: "tanphat",
    department: "Workspace E - Creator Studio",
    accountId: "tiktok_tanphat_main",
    nickname: "Creator Studio",
    status: "Token expired",
    scopes: tiktokScopes,
    lastConnected: "2026-04-28 11:05",
    directPostEnabled: true,
  },
];

export const mockScheduledPosts: MockScheduledPost[] = [
  {
    scheduleId: "mock_schedule_kdtm_001",
    department: "Workspace A - Auto Parts Brand",
    scheduledAt: "2026-05-30 09:00 Asia/Ho_Chi_Minh",
    status: "SCHEDULED",
  },
  {
    scheduleId: "mock_schedule_koisu_002",
    department: "Workspace D - Product Launch",
    scheduledAt: "2026-06-02 14:30 Asia/Ho_Chi_Minh",
    status: "SCHEDULED",
  },
];

export function getDepartmentById(departmentId: string): Department | undefined {
  return departments.find((department) => department.id === departmentId);
}
