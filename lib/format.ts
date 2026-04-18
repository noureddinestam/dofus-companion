const MB = 1024 * 1024;
const KB = 1024;

export function formatBytes(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} Mo`;
  if (bytes >= KB) return `${Math.round(bytes / KB)} Ko`;
  return `${bytes} o`;
}
