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
  "video.upload",
  "video.publish",
];

export const departments: Department[] = [
  {
    id: "kdtm",
    name: "KDTM",
    accountId: "tiktok_kdtm_main",
    nickname: "TikTok KDTM",
  },
  {
    id: "kd1",
    name: "KD1",
    accountId: "tiktok_kd1_main",
    nickname: "TikTok KD1",
  },
  {
    id: "kd2",
    name: "KD2",
    accountId: "tiktok_kd2_main",
    nickname: "TikTok KD2",
  },
  {
    id: "koisu",
    name: "KOISU",
    accountId: "tiktok_koisu_main",
    nickname: "TikTok KOISU",
  },
  {
    id: "tanphat",
    name: "Tan Phat ETEK",
    accountId: "tiktok_tanphat_main",
    nickname: "TikTok Tan Phat ETEK",
  },
];

export const mockAccounts: MockTikTokAccount[] = [
  {
    departmentId: "kdtm",
    department: "KDTM",
    accountId: "tiktok_kdtm_main",
    nickname: "TikTok KDTM",
    status: "Connected",
    scopes: tiktokScopes,
    lastConnected: "2026-05-12 09:20",
    directPostEnabled: true,
  },
  {
    departmentId: "kd1",
    department: "KD1",
    accountId: "tiktok_kd1_main",
    nickname: "-",
    status: "Disconnected",
    scopes: tiktokScopes,
    lastConnected: "-",
    directPostEnabled: true,
  },
  {
    departmentId: "kd2",
    department: "KD2",
    accountId: "tiktok_kd2_main",
    nickname: "-",
    status: "Disconnected",
    scopes: tiktokScopes,
    lastConnected: "-",
    directPostEnabled: true,
  },
  {
    departmentId: "koisu",
    department: "KOISU",
    accountId: "tiktok_koisu_main",
    nickname: "TikTok KOISU",
    status: "Connected",
    scopes: tiktokScopes,
    lastConnected: "2026-05-14 15:45",
    directPostEnabled: true,
  },
  {
    departmentId: "tanphat",
    department: "Tan Phat ETEK",
    accountId: "tiktok_tanphat_main",
    nickname: "TikTok Tan Phat ETEK",
    status: "Token expired",
    scopes: tiktokScopes,
    lastConnected: "2026-04-28 11:05",
    directPostEnabled: true,
  },
];

export const mockScheduledPosts: MockScheduledPost[] = [
  {
    scheduleId: "mock_schedule_kdtm_001",
    department: "KDTM",
    scheduledAt: "2026-05-30 09:00 Asia/Ho_Chi_Minh",
    status: "SCHEDULED",
  },
  {
    scheduleId: "mock_schedule_koisu_002",
    department: "KOISU",
    scheduledAt: "2026-06-02 14:30 Asia/Ho_Chi_Minh",
    status: "SCHEDULED",
  },
];

export function getDepartmentById(departmentId: string): Department | undefined {
  return departments.find((department) => department.id === departmentId);
}
