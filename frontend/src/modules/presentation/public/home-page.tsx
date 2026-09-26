"use client";

import { useHomeCatalog } from "@/hooks/use-home-catalog";
import FeaturedProducts from "@/modules/components/home/featured-products";
import HomeHero from "@/modules/components/home/home-hero";
import TrustStrip from "@/modules/components/home/trust-strip";

const HomePage = () => {
  const { products, categories, loadingCategories, loadingProducts, error } =
    useHomeCatalog();

  return (
    <div className="space-y-12 p-4">
      {/* HERO */}
      <HomeHero categories={categories} loadingCategories={loadingCategories} />
      {/* TRUST STRIP */}
      <TrustStrip />
      {/* CATALOG */}
      <FeaturedProducts
        products={products}
        loadingProducts={loadingProducts}
        error={error}
      />
    </div>
  );
};

export default HomePage;
