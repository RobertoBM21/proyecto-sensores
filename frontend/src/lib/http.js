import { useAuthStore } from "../stores/auth";

export const fetchWithAuth = async (url, options = {}) => {
  const auth = useAuthStore();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${auth.token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
