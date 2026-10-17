export const formatPrice = (cents: number, currency: string) => {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
};

/* ImageKit resizes on the fly with ?tr=w-<width>. A product photo in a grid only needs ~400px, not the full original. If images stop loading, remove the tr part first. */
export const imageUrl = (url: string, width: number) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tr=w-${width}`;
};
