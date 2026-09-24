// Central API Base URL and Asset URL resolution
export const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:8000";
})();

export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.includes("sample_package_synthetic.jpg") || url.includes("regression_annotated.jpg")) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
