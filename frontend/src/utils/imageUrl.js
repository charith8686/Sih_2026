export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.includes("sample_package_synthetic.jpg") || url.includes("regression_annotated.jpg")) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `http://127.0.0.1:8000${url.startsWith("/") ? "" : "/"}${url}`;
};
