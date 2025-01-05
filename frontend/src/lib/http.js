import { useAuthStore } from "../stores/auth";

export const fetchWithAuth = async (url, options = {}) => {
  const auth = useAuthStore();

  const headers = {
    ...options.headers,
    ...(auth.token && { Authorization: `Bearer ${auth.token}` }),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
