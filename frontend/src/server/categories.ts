export const getCategories = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`,
    {
      method: "GET",
    },
  );
  return res.json();
};
