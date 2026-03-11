const DEFAULT_API_BASE_URL = "http://localhost:3001/api/v1";

export const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || DEFAULT_API_BASE_URL).replace(
    /\/+$/,
    "",
  );

