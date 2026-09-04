"use client";

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { normalizeProductId } from "@/lib/default-data";
import { apiUrl } from "@/lib/api";

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

export function CartProvider({ children, isDealer: propIsDealer }: { children: ReactNode; isDealer?: boolean }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isHydrated: false });
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isDealer = propIsDealer ?? ((session?.user as any)?.role === "DEALER");

  // Ref to track if we already synced for this authenticated user ID
  const syncedUserIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});

  // 1. Initial hydration from localStorage immediately on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const localItems = JSON.parse(saved) as CartItem[];
        if (Array.isArray(localItems) && localItems.length > 0) {
          const migratedItems = localItems.map((item) => ({
            ...item,
            productId: normalizeProductId(item.productId),
          }));
          dispatch({ type: "SET_ITEMS", items: migratedItems });
        }
      }
    } catch (e) {
      console.warn("Failed to load local cart", e);
    }
    dispatch({ type: "SET_HYDRATED" });
  }, []);

  // 2. Persist to localStorage on every items state change
  useEffect(() => {
    if (state.isHydrated) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(state.items));
      } catch (e) {
        console.warn("Failed to persist cart to localStorage", e);
      }
    }
  }, [state.items, state.isHydrated]);

  // 3. One-time DB sync per authenticated session
  const itemsSnapshotRef = useRef(state.items);
  itemsSnapshotRef.current = state.items;

  useEffect(() => {
    const user = session?.user as { id?: string; email?: string } | undefined;
    const currentUserId = user?.id || user?.email;
    if (!state.isHydrated || !isAuthenticated || !currentUserId) return;
    if (syncedUserIdRef.current === currentUserId) return;

    syncedUserIdRef.current = currentUserId;
    let isCancelled = false;

    const syncWithDb = async () => {
      try {
        const currentItems = itemsSnapshotRef.current;
        if (currentItems.length > 0) {
          // Sync local items to server DB
          const res = await fetch(apiUrl("/api/cart"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "sync", items: currentItems }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.data?.items && !isCancelled) {
              dispatch({ type: "SET_ITEMS", items: json.data.items });
            }
          }
        } else {
          // Fetch from DB if local is empty
          const res = await fetch(apiUrl("/api/cart"));
          if (res.ok) {
            const json = await res.json();
            if (json.data?.items && json.data.items.length > 0 && !isCancelled) {
              dispatch({ type: "SET_ITEMS", items: json.data.items });
            }
          }
        }
      } catch (e) {
        console.warn("Cart DB sync error (continuing with local cart)", e);
      }
    };

    syncWithDb();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, state.isHydrated, session?.user]);

  const totalItems = state.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0);

  const subtotal = state.items.reduce((s, i) => {
    const unitPrice = isDealer ? Number(i.dealerPrice || i.price) : Number(i.price);
    return s + unitPrice * (Number(i.quantity) || 1);
  }, 0);

  const taxTotal = state.items.reduce((s, i) => {
    const unitPrice = isDealer ? Number(i.dealerPrice || i.price) : Number(i.price);
    const taxRate = Number(i.taxRate || 18);
    return s + ((unitPrice * taxRate) / 100) * (Number(i.quantity) || 1);
  }, 0);

  const shippingAmount = 0;
  const grandTotal = subtotal + taxTotal + shippingAmount;

  // Non-blocking background sync helper
  const syncActionInBackground = (body: Record<string, unknown>) => {
    if (!isAuthenticated) return;
    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = setTimeout(() => controller?.abort(), 3500);

      fetch(apiUrl("/api/cart"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller?.signal,
      })
        .catch(() => {})
        .finally(() => clearTimeout(timeoutId));
    } catch {}
  };

  // Actions
  const addItem = async (item: CartItem) => {
    const normalizedItem = {
      ...item,
      productId: normalizeProductId(item.productId),
    };
    dispatch({ type: "ADD_ITEM", item: normalizedItem });
    syncActionInBackground({ action: "add", item: normalizedItem });
  };

  const removeItem = async (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
    if (debounceTimerRef.current[productId]) {
      clearTimeout(debounceTimerRef.current[productId]);
      delete debounceTimerRef.current[productId];
    }
    syncActionInBackground({ action: "remove", productId });
  };

  const updateQty = async (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QTY", productId, quantity });
    if (debounceTimerRef.current[productId]) {
      clearTimeout(debounceTimerRef.current[productId]);
    }
    debounceTimerRef.current[productId] = setTimeout(() => {
      syncActionInBackground({ action: "update", productId, quantity });
    }, 350);
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR" });
    try {
      localStorage.removeItem(CART_KEY);
    } catch {}
    syncActionInBackground({ action: "clear" });
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
