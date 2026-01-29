"use client";

import { useShop } from "@/context/ShopContext";
import ProductGrid from "@/components/ProductGrid";

export default function ProductsPage() {
  const { products } = useShop();

  return (
    <div className="min-h-screen bg-white pb-20">
      <ProductGrid products={products} />
    </div>
  );
}
