/** Append thumbnail width param for faster loading. Use for cards and list views. */
export function thumbnailUrl(url: string, width = 480): string {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("/api/image/")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=${width}`;
}
