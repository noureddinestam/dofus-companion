const read = (key: string): string | undefined => {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
};

export const env = {
  GITHUB_TOKEN: read("GITHUB_TOKEN"),
  VIRUSTOTAL_API_KEY: read("VIRUSTOTAL_API_KEY"),
  NEXT_PUBLIC_SITE_URL: read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  VERCEL_GIT_COMMIT_SHA: read("VERCEL_GIT_COMMIT_SHA"),
  VERCEL_ENV: read("VERCEL_ENV"),
} as const;
