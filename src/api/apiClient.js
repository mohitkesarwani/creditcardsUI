let axiosLib;
try {
  axiosLib = (await import('axios')).default;
} catch {
  axiosLib = {
    create() {
      return {
        get: async () => ({}),
        post: async () => ({}),
      };
    },
  };
}

// Default to the local API during development. This can be overridden by
// providing `VITE_API_BASE_URL` in an `.env` file or environment variable.
// Using a relative URL here ensures the UI works with the local server and
// avoids unexpected CORS issues when the env variable isn't configured.
const baseURL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.VITE_API_BASE_URL ||
  'http://localhost:3000';
const apiClient = axiosLib.create({ baseURL });

export default apiClient;
