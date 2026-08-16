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

  const addToCart = useCart((state) => {
    return state.addItem;
  });
  const clear = useCart((state) => {
    return state.clearCart;
  });

  return (
    <div className="space-y-12 p-4">
      {/* HERO */}
      <HomeHero categories={categories} loadingCategories={loadingCategories} />
      {/* TESTING AREA */}
      <div>
        <h2 className="text=xl mb-2 font-semibold">Testing Area</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              return addToCart("ba5323ff-ccd1-4295-8bcb-1a5519d7590b", 2);
            }}
          >
            Add Product To Cart
          </Button>
          <Button variant="destructive" onClick={clear}>
            Clear Cart
          </Button>
        </div>
      </div>
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
