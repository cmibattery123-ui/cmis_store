"use client";

import React, { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface AddToCartButtonProps {
  inStock: boolean;
  product: any;
}

export default function AddToCartButton({ inStock, product }: AddToCartButtonProps) {
  const { data: session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, items } = useCart();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add items to your cart");
      router.push("/auth/login");
      return;
    }

    if (!inStock || isAdding) return;
    
    setIsAdding(true);
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        dealerPrice: Number(product.dealerPrice),
        image: product.images?.[0]?.url,
        quantity: 1,
        taxRate: Number(product.taxRate || 18),
      });
      
      toast.success("Added to cart");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const inCart = items.find((i) => i.productId === product.id);

  if (inCart) {
    return (
      <button
        onClick={() => router.push("/cart")}
        className="flex-1 flex items-center justify-center gap-2 bg-white text-black border-2 border-primary font-heading font-bold py-4 rounded-xl hover:bg-primary/10 transition-colors"
      >
        <ShoppingCart className="w-5 h-5 text-primary" />
        View in Cart
      </button>
    );
  }

  return (
    <button
      disabled={!inStock || isAdding}
      onClick={handleAddToCart}
      className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isAdding ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
      {inStock ? "Add to Cart" : "Out of Stock"}
    </button>
  );
}
