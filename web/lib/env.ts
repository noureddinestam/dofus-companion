const read = (key: string): string | undefined => {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
};

const readList = (key: string, fallback: string[]): string[] => {
  const raw = read(key);
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

export const env = {
  GITHUB_TOKEN: read("GITHUB_TOKEN"),
  VIRUSTOTAL_API_KEY: read("VIRUSTOTAL_API_KEY"),
  NEXT_PUBLIC_SITE_URL: read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  VERCEL_GIT_COMMIT_SHA: read("VERCEL_GIT_COMMIT_SHA"),
  VERCEL_ENV: read("VERCEL_ENV"),
  RESEND_API_KEY: read("RESEND_API_KEY"),
  FEEDBACK_TO_EMAIL: readList("FEEDBACK_TO_EMAIL", [
    "contact@dofuscompanion.com",
  ]),
  FEEDBACK_FROM_EMAIL:
    read("FEEDBACK_FROM_EMAIL") ??
    "Dofus Companion <noreply@dofuscompanion.com>",
} as const;
