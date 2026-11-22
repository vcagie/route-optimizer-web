export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");

/** Must match MAX_LOCATIONS in the backend. */
export const MAX_STOPS = 25;

if (!API_BASE_URL) {
  console.warn(
    "VITE_API_BASE_URL is not set. The optimize feature will be disabled until you configure it in .env."
  );
}
