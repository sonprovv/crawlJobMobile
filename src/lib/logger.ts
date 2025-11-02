export interface PostViewLog {
  url: string;
  user?: string;
  time?: string; // original post time
  viewedAt: string; // when user clicked
  userAgent?: string;
}

const STORAGE_KEY = 'post_view_logs';

export function logPostView(entry: Omit<PostViewLog, 'viewedAt' | 'userAgent'>) {
  try {
    const logsJson = localStorage.getItem(STORAGE_KEY);
    const logs: PostViewLog[] = logsJson ? JSON.parse(logsJson) : [];

    const newEntry: PostViewLog = {
      ...entry,
      viewedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    logs.unshift(newEntry);
    // keep last 500 entries
    if (logs.length > 500) logs.length = 500;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    // also print to console for quick debugging
    // eslint-disable-next-line no-console
    console.log('[PostViewLog]', newEntry);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to log post view', err);
  }
}

export function getPostViewLogs(): PostViewLog[] {
  try {
    const logsJson = localStorage.getItem(STORAGE_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch {
    return [];
  }
}

export function clearPostViewLogs() {
  localStorage.removeItem(STORAGE_KEY);
}
