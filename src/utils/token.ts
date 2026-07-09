// Token 和用户信息缓存工具

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export const token = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (val: string) => localStorage.setItem(TOKEN_KEY, val),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

export const cachedUser = {
  get: (): API.UserInfo | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set: (user: API.UserInfo) =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),
  remove: () => localStorage.removeItem(USER_KEY),
};
