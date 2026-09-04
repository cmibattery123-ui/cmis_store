"use client";

import React, { useState } from "react";
import { ShoppingCart, Loader2, Zap, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  inStock: boolean;
  product: any;
  showBuyNow?: boolean;
}

export default function AddToCartButton({ inStock, product, showBuyNow = true }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const { addItem, items } = useCart();
  const router = useRouter();

  React.useEffect(() => {
    // Prefetch checkout page for instant transitions
    router.prefetch("/checkout");
  }, [router]);

  const handleAddToCart = () => {
    if (!inStock || isAdding) return;
    
    setIsAdding(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        dealerPrice: Number(product.dealerPrice || product.price),
        image: product.images?.[0]?.url,
        quantity: 1,
        taxRate: Number(product.taxRate || 18),
      });
      
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Add to cart failed", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!inStock || isBuyingNow) return;

    setIsBuyingNow(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        dealerPrice: Number(product.dealerPrice || product.price),
        image: product.images?.[0]?.url,
        quantity: 1,
        taxRate: Number(product.taxRate || 18),
      });

      router.push("/checkout");
    } catch (error) {
      console.error("Buy now failed", error);
      toast.error("Failed to proceed to checkout.");
      setIsBuyingNow(false);
    }
  };

  const inCart = items.some((i) => i.productId === product.id);

  if (!inStock) {
    return (
      <a
        href="/contact"
        className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 dark:bg-yellow-400 dark:hover:bg-yellow-300 text-black font-semibold text-sm py-3.5 px-6 rounded-full transition-all text-center w-full shadow-sm active:scale-[0.98]"
      >
        Inquire Availability
      </a>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1">
      <button
        disabled={isAdding}
        onClick={handleAddToCart}
        className={`flex-1 flex items-center justify-center gap-2 font-semibold text-sm py-3.5 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] cursor-pointer ${
          inCart
            ? "bg-[#E8E8ED] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white hover:bg-[#D2D2D7] dark:hover:bg-[#3A3A3C]"
            : "bg-[#1D1D1F] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-[#E8E8ED]"
        }`}
      >
        {isAdding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        <span>{inCart ? "Add Another" : "Add to Cart"}</span>
      </button>

      {showBuyNow && (
        <button
          disabled={isBuyingNow}
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-black hover:bg-yellow-300 font-semibold text-sm py-3.5 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {isBuyingNow ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 fill-current" />
          )}
          <span>Buy Now</span>
        </button>
      )}
    </div>
  );
}
