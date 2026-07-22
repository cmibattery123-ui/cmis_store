"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  dealerPrice: number;
  image?: string;
  quantity: number;
  taxRate: number;
  isDealer?: boolean;
}

interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "SET_ITEMS"; items: CartItem[] }
  | { type: "SET_HYDRATED" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.item.productId
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "SET_ITEMS":
      return { ...state, items: action.items };
    case "SET_HYDRATED":
      return { ...state, isHydrated: true };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQty: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  taxTotal: number;
  shippingAmount: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "pb_cart";
const SYNCED_KEY = "pb_cart_synced";

export function CartProvider({ children, isDealer = false }: { children: ReactNode; isDealer?: boolean }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isHydrated: false });
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Hydrate from localStorage on mount or fetch from DB if logged in
  useEffect(() => {
    let localItems: CartItem[] = [];
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        localItems = JSON.parse(saved) as CartItem[];
        dispatch({ type: "SET_ITEMS", items: localItems });
      }
    } catch {}

    const initCart = async () => {
      if (isAuthenticated) {
        const hasSynced = localStorage.getItem(SYNCED_KEY);
        
        // If they have local items and haven't synced them to DB yet
        if (localItems.length > 0 && !hasSynced) {
          try {
            const res = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "sync", items: localItems }),
            });
            if (res.ok) {
              const data = await res.json();
              dispatch({ type: "SET_ITEMS", items: data.data.items });
              localStorage.setItem(SYNCED_KEY, "true"); // Mark as synced
            }
          } catch (e) {
             console.error("Failed to sync cart", e);
          }
        } else {
           // Just fetch from DB
           try {
             const res = await fetch("/api/cart");
             if (res.ok) {
                const data = await res.json();
                dispatch({ type: "SET_ITEMS", items: data.data.items });
             }
           } catch (e) {
             console.error("Failed to fetch cart", e);
           }
        }
      }
      dispatch({ type: "SET_HYDRATED" });
    };

    if (status !== "loading") {
       initCart();
    }
  }, [status, isAuthenticated]);

  // Persist to localStorage on change if guest
  useEffect(() => {
    if (state.isHydrated && !isAuthenticated) {
      localStorage.setItem(CART_KEY, JSON.stringify(state.items));
    }
  }, [state.items, state.isHydrated, isAuthenticated]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);

  const subtotal = state.items.reduce((s, i) => {
    const unitPrice = isDealer ? i.dealerPrice : i.price;
    return s + unitPrice * i.quantity;
  }, 0);

  const taxTotal = state.items.reduce((s, i) => {
    const unitPrice = isDealer ? i.dealerPrice : i.price;
    return s + (unitPrice * i.taxRate / 100) * i.quantity;
  }, 0);

  const shippingAmount = subtotal + taxTotal >= 5000 ? 0 : 150;
  const grandTotal = subtotal + taxTotal + shippingAmount;

  // Sync wrappers
  const addItem = async (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", item });
    if (isAuthenticated) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", item }),
      });
    }
  };

  const removeItem = async (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
    if (isAuthenticated) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", productId }),
      });
    }
  };

  const updateQty = async (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QTY", productId, quantity });
    if (isAuthenticated) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", productId, quantity }),
      });
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR" });
    if (isAuthenticated) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
    } else {
      localStorage.removeItem(CART_KEY);
    }
  };

  const value: CartContextValue = {
    items: state.items,
    isHydrated: state.isHydrated,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    totalItems,
    subtotal,
    taxTotal,
    shippingAmount,
    grandTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
