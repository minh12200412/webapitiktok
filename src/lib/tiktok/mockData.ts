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
};

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
    scopes: ["user.info.basic", "video.upload"],
    lastConnected: "2026-05-12 09:20",
  },
  {
    departmentId: "kd1",
    department: "KD1",
    accountId: "tiktok_kd1_main",
    nickname: "-",
    status: "Disconnected",
    scopes: [],
    lastConnected: "-",
  },
  {
    departmentId: "kd2",
    department: "KD2",
    accountId: "tiktok_kd2_main",
    nickname: "-",
    status: "Disconnected",
    scopes: [],
    lastConnected: "-",
  },
  {
    departmentId: "koisu",
    department: "KOISU",
    accountId: "tiktok_koisu_main",
    nickname: "TikTok KOISU",
    status: "Connected",
    scopes: ["user.info.basic", "video.upload"],
    lastConnected: "2026-05-14 15:45",
  },
  {
    departmentId: "tanphat",
    department: "Tan Phat ETEK",
    accountId: "tiktok_tanphat_main",
    nickname: "TikTok Tan Phat ETEK",
    status: "Token expired",
    scopes: ["user.info.basic", "video.upload"],
    lastConnected: "2026-04-28 11:05",
  },
];

export function getDepartmentById(departmentId: string): Department | undefined {
  return departments.find((department) => department.id === departmentId);
}
