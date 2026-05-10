const DEFAULT_API_BASE_URL = "http://localhost:3001/api/v1";

export const getApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

  if (!configuredUrl && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL or API_URL is required in production.");
  }

  return (configuredUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
};
