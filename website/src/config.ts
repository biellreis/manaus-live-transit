export const APP_URL = "https://manaus-live-transit.vercel.app";
export const installUrl = (platform: string) =>
  `${APP_URL}/?install=${platform === "android" ? "android" : "ios"}`;
