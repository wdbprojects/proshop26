"use client";

import { Button } from "@/components/ui/button";
import { useHomeCatalog } from "@/hooks/use-home-catalog";
import HomeCatalog from "@/modules/components/home/home-catalog";
import HomeHero from "@/modules/components/home/home-hero";
import TrustStrip from "@/modules/components/home/trust-strip";
import { useCart } from "@/store/cart";

const HomePage = () => {
  const {
    products,
    categories,
    categoryChipsLoading,
    categoryFilter,
    error,
    loadingCategories,
    loadingProducts,
    setCategory,
  } = useHomeCatalog();

  return (
    <div className="space-y-12 p-4">
      {/* HERO */}
      <HomeHero categories={categories} loadingCategories={loadingCategories} />
      {/* TESTING AREA */}
      {/* <div></div> */}
      {/* TRUST STRIP */}
      <TrustStrip />
      {/* CATALOG */}
      <HomeCatalog
        categoryFilter={categoryFilter}
        categoryChipsLoading={categoryChipsLoading}
        categories={categories}
        setCategory={setCategory}
        error={error}
        products={products}
        loadingProducts={loadingProducts}
      />
    </div>
  );
};

export default HomePage;
