export const BUILD_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "";
export const BUILD_COMMIT = typeof __APP_COMMIT__ !== "undefined" ? __APP_COMMIT__ : "";
export const BUILD_COMMIT_FULL = typeof __APP_COMMIT_FULL__ !== "undefined" ? __APP_COMMIT_FULL__ : "";
export const COMMIT_URL = BUILD_COMMIT_FULL ? `https://github.com/sergioSHKLR/signum/commit/${BUILD_COMMIT_FULL}` : "";
