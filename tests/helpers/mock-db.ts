import { vi } from "vitest";

export interface MockStore {
  users: any[];
  dealers: any[];
  products: any[];
  inventories: any[];
  orders: any[];
  orderItems: any[];
  payments: any[];
  quotations: any[];
  quotationItems: any[];
  carts: any[];
  cartItems: any[];
  notifications: any[];
  systemSettings: any[];
  addresses: any[];
}

export function createInitialStore(): MockStore {
  return {
    users: [],
    dealers: [],
    products: [],
    inventories: [],
    orders: [],
    orderItems: [],
    payments: [],
    quotations: [],
    quotationItems: [],
    carts: [],
    cartItems: [],
    notifications: [],
    systemSettings: [],
    addresses: [],
  };
}

let activeStore: MockStore = createInitialStore();

export function getMockStore(): MockStore {
  return activeStore;
}

export function resetMockStore(): void {
  activeStore = createInitialStore();
}

function matchFilter(record: any, where: any): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  if (where.OR && Array.isArray(where.OR)) {
    return where.OR.some((condition: any) => matchFilter(record, condition));
  }
  if (where.AND && Array.isArray(where.AND)) {
    return where.AND.every((condition: any) => matchFilter(record, condition));
  }

  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" || key === "AND") continue;
    if (val === undefined) continue;

    const recordVal = record[key];

    if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      if ("in" in val && Array.isArray(val.in)) {
        if (!val.in.includes(recordVal)) return false;
      } else if ("equals" in val) {
        if (recordVal !== val.equals) return false;
      } else if ("not" in val) {
        if (recordVal === val.not) return false;
      } else if (key === "user" && record.user) {
        if (!matchFilter(record.user, val)) return false;
      } else if (key === "payment" && record.payment) {
        if (!matchFilter(record.payment, val)) return false;
      }
    } else {
      if (recordVal !== val) return false;
    }
  }

  return true;
}

export function createMockPrismaClient() {
  const client: any = {
    user: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        const user = activeStore.users.find((u) => matchFilter(u, where));
        if (!user) return null;
        const res = { ...user };
        if (include?.dealer) {
          res.dealer = activeStore.dealers.find((d) => d.userId === user.id) || null;
        }
        return res;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        return activeStore.users.find((u) => matchFilter(u, where)) || null;
      }),
      findMany: vi.fn(async ({ where }: any = {}) => {
        return activeStore.users.filter((u) => matchFilter(u, where));
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const user = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          ...data,
        };
        activeStore.users.push(user);
        return { ...user };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = activeStore.users.findIndex((u) => matchFilter(u, where));
        if (idx === -1) throw new Error("User not found");
        activeStore.users[idx] = {
          ...activeStore.users[idx],
          ...data,
          updatedAt: new Date(),
        };
        return { ...activeStore.users[idx] };
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const existing = activeStore.users.find((u) => matchFilter(u, where));
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return { ...existing };
        } else {
          const id = create.id || `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const user = { id, createdAt: new Date(), updatedAt: new Date(), isActive: true, ...create };
          activeStore.users.push(user);
          return { ...user };
        }
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        return activeStore.users.filter((u) => matchFilter(u, where)).length;
      }),
    },

    dealer: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        const dealer = activeStore.dealers.find((d) => matchFilter(d, where));
        if (!dealer) return null;
        const res = { ...dealer };
        if (include?.user) {
          res.user = activeStore.users.find((u) => u.id === dealer.userId) || null;
        }
        return res;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        return activeStore.dealers.find((d) => matchFilter(d, where)) || null;
      }),
      findMany: vi.fn(async ({ where, include }: any = {}) => {
        return activeStore.dealers
          .filter((d) => matchFilter(d, where))
          .map((d) => {
            const res = { ...d };
            if (include?.user) {
              res.user = activeStore.users.find((u) => u.id === d.userId) || null;
            }
            return res;
          });
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `dealer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dealer = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "PENDING",
          ...data,
        };
        activeStore.dealers.push(dealer);
        return { ...dealer };
      }),
      update: vi.fn(async ({ where, data, include }: any) => {
        const idx = activeStore.dealers.findIndex((d) => matchFilter(d, where));
        if (idx === -1) throw new Error("Dealer not found");
        activeStore.dealers[idx] = {
          ...activeStore.dealers[idx],
          ...data,
          updatedAt: new Date(),
        };
        const res = { ...activeStore.dealers[idx] };
        if (include?.user) {
          res.user = activeStore.users.find((u) => u.id === res.userId) || null;
        }
        return res;
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        return activeStore.dealers.filter((d) => matchFilter(d, where)).length;
      }),
    },

    product: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        const product = activeStore.products.find((p) => matchFilter(p, where));
        if (!product) return null;
        const res = { ...product };
        if (include?.inventory) {
          res.inventory = activeStore.inventories.find((i) => i.productId === product.id) || null;
        }
        return res;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        return activeStore.products.find((p) => matchFilter(p, where)) || null;
      }),
      findMany: vi.fn(async ({ where, include, orderBy, skip, take }: any = {}) => {
        let results = activeStore.products.filter((p) => matchFilter(p, where));
        if (skip) results = results.slice(skip);
        if (take) results = results.slice(0, take);
        return results.map((p) => {
          const res = { ...p };
          if (include?.inventory) {
            res.inventory = activeStore.inventories.find((i) => i.productId === p.id) || null;
          }
          return res;
        });
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const { inventory, specs, images, ...rest } = data;
        const product = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          ...rest,
        };
        activeStore.products.push(product);
        if (inventory?.create) {
          activeStore.inventories.push({
            id: `inv_${id}`,
            productId: id,
            quantity: inventory.create.quantity ?? 0,
            lowStockThreshold: inventory.create.lowStockThreshold ?? 10,
          });
        }
        return { ...product };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = activeStore.products.findIndex((p) => matchFilter(p, where));
        if (idx === -1) throw new Error("Product not found");
        const { specs, images, inventory, ...rest } = data;
        activeStore.products[idx] = {
          ...activeStore.products[idx],
          ...rest,
          updatedAt: new Date(),
        };
        return { ...activeStore.products[idx] };
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = activeStore.products.findIndex((p) => matchFilter(p, where));
        if (idx === -1) throw new Error("Product not found");
        const removed = activeStore.products.splice(idx, 1)[0];
        return removed;
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        return activeStore.products.filter((p) => matchFilter(p, where)).length;
      }),
    },

    order: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        const order = activeStore.orders.find((o) => matchFilter(o, where));
        if (!order) return null;
        const res = { ...order };
        if (include?.payment) {
          res.payment = activeStore.payments.find((p) => p.orderId === order.id) || null;
        }
        if (include?.items) {
          res.items = activeStore.orderItems.filter((i) => i.orderId === order.id);
        }
        if (include?.user) {
          res.user = activeStore.users.find((u) => u.id === order.userId) || null;
        }
        if (include?.shippingAddress) {
          res.shippingAddress = activeStore.addresses.find((a) => a.id === order.shippingAddressId) || null;
        }
        return res;
      }),
      findFirst: vi.fn(async ({ where, include }: any) => {
        const order = activeStore.orders.find((o) => matchFilter(o, where));
        if (!order) return null;
        const res = { ...order };
        if (include?.payment) {
          res.payment = activeStore.payments.find((p) => p.orderId === order.id) || null;
        }
        return res;
      }),
      findMany: vi.fn(async ({ where, include, orderBy, skip, take }: any = {}) => {
        let results = activeStore.orders.filter((o) => matchFilter(o, where));
        if (skip) results = results.slice(skip);
        if (take) results = results.slice(0, take);
        return results.map((order) => {
          const res = { ...order };
          if (include?.payment) {
            res.payment = activeStore.payments.find((p) => p.orderId === order.id) || null;
          }
          if (include?.items) {
            res.items = activeStore.orderItems.filter((i) => i.orderId === order.id);
          }
          if (include?.user) {
            res.user = activeStore.users.find((u) => u.id === order.userId) || null;
          }
          if (include?.shippingAddress) {
            res.shippingAddress = activeStore.addresses.find((a) => a.id === order.shippingAddressId) || null;
          }
          return res;
        });
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const { items, payment, ...rest } = data;
        const order = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...rest,
        };
        activeStore.orders.push(order);

        if (items?.create && Array.isArray(items.create)) {
          for (const item of items.create) {
            const itemId = `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            activeStore.orderItems.push({
              id: itemId,
              orderId: id,
              ...item,
            });
          }
        }

        if (payment?.create) {
          const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const payRecord = {
            id: paymentId,
            orderId: id,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...payment.create,
          };
          activeStore.payments.push(payRecord);
        }

        return { ...order };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = activeStore.orders.findIndex((o) => matchFilter(o, where));
        if (idx === -1) throw new Error("Order not found");
        activeStore.orders[idx] = {
          ...activeStore.orders[idx],
          ...data,
          updatedAt: new Date(),
        };
        return { ...activeStore.orders[idx] };
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        for (let i = 0; i < activeStore.orders.length; i++) {
          if (matchFilter(activeStore.orders[i], where)) {
            activeStore.orders[i] = {
              ...activeStore.orders[i],
              ...data,
              updatedAt: new Date(),
            };
            count++;
          }
        }
        return { count };
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        return activeStore.orders.filter((o) => matchFilter(o, where)).length;
      }),
    },

    payment: {
      findUnique: vi.fn(async ({ where }: any) => {
        return activeStore.payments.find((p) => matchFilter(p, where)) || null;
      }),
      findFirst: vi.fn(async ({ where, include }: any) => {
        const payment = activeStore.payments.find((p) => matchFilter(p, where));
        if (!payment) return null;
        const res = { ...payment };
        if (include?.order) {
          res.order = activeStore.orders.find((o) => o.id === payment.orderId) || null;
        }
        return res;
      }),
      findMany: vi.fn(async ({ where }: any = {}) => {
        return activeStore.payments.filter((p) => matchFilter(p, where));
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const payment = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
        activeStore.payments.push(payment);
        return { ...payment };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = activeStore.payments.findIndex((p) => matchFilter(p, where));
        if (idx === -1) throw new Error("Payment not found");
        activeStore.payments[idx] = {
          ...activeStore.payments[idx],
          ...data,
          updatedAt: new Date(),
        };
        return { ...activeStore.payments[idx] };
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const existing = activeStore.payments.find((p) => matchFilter(p, where));
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return { ...existing };
        } else {
          const id = create.id || `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const payRecord = { id, createdAt: new Date(), updatedAt: new Date(), ...create };
          activeStore.payments.push(payRecord);
          return { ...payRecord };
        }
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        return activeStore.payments.filter((p) => matchFilter(p, where)).length;
      }),
    },

    quotation: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        const quote = activeStore.quotations.find((q) => matchFilter(q, where));
        if (!quote) return null;
        const res = { ...quote };
        if (include?.items) {
          res.items = activeStore.quotationItems.filter((i) => i.quotationId === quote.id);
        }
        return res;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        return activeStore.quotations.find((q) => matchFilter(q, where)) || null;
      }),
      findMany: vi.fn(async ({ where, include, orderBy, skip, take }: any = {}) => {
        let results = activeStore.quotations.filter((q) => matchFilter(q, where));
        if (skip) results = results.slice(skip);
        if (take) results = results.slice(0, take);
        return results.map((q) => {
          const res = { ...q };
          if (include?.items) {
            res.items = activeStore.quotationItems.filter((i) => i.quotationId === q.id).map((item) => {
              const itemRes = { ...item };
              if (include.items.include?.product) {
                itemRes.product = activeStore.products.find((p) => p.id === item.productId) || null;
              }
              return itemRes;
            });
          }
          return res;
        });
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `quote_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const { items, ...rest } = data;
        const quotation = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...rest,
        };
        activeStore.quotations.push(quotation);

        if (items?.create && Array.isArray(items.create)) {
          for (const item of items.create) {
            const itemId = `qitem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            activeStore.quotationItems.push({
              id: itemId,
              quotationId: id,
              ...item,
            });
          }
        }

        return { ...quotation };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = activeStore.quotations.findIndex((q) => matchFilter(q, where));
        if (idx === -1) throw new Error("Quotation not found");
        activeStore.quotations[idx] = {
          ...activeStore.quotations[idx],
          ...data,
          updatedAt: new Date(),
        };
        return { ...activeStore.quotations[idx] };
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        return activeStore.quotations.filter((q) => matchFilter(q, where)).length;
      }),
    },

    cart: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        const cart = activeStore.carts.find((c) => matchFilter(c, where));
        if (!cart) return null;
        const res = { ...cart };
        if (include?.items) {
          res.items = activeStore.cartItems.filter((i) => i.cartId === cart.id).map((item) => {
            const itemRes = { ...item };
            if (include.items.include?.product) {
              const prod = activeStore.products.find((p) => p.id === item.productId);
              itemRes.product = prod ? { ...prod, images: [] } : null;
            }
            return itemRes;
          });
        }
        return res;
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cart = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
        activeStore.carts.push(cart);
        return { ...cart, items: [] };
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const existing = activeStore.carts.find((c) => matchFilter(c, where));
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return { ...existing };
        } else {
          const id = create.id || `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const cart = { id, createdAt: new Date(), updatedAt: new Date(), ...create };
          activeStore.carts.push(cart);
          return { ...cart, items: [] };
        }
      }),
    },

    cartItem: {
      findMany: vi.fn(async ({ where }: any = {}) => {
        return activeStore.cartItems.filter((i) => matchFilter(i, where));
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `citem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const item = { id, ...data };
        activeStore.cartItems.push(item);
        return { ...item };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = activeStore.cartItems.findIndex((i) => matchFilter(i, where));
        if (idx === -1) throw new Error("CartItem not found");
        const current = activeStore.cartItems[idx];
        const newQty = data.quantity?.increment !== undefined ? current.quantity + data.quantity.increment : data.quantity;
        activeStore.cartItems[idx] = { ...current, ...data, quantity: newQty !== undefined ? newQty : current.quantity };
        return { ...activeStore.cartItems[idx] };
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const filter = where.cartId_productId || where;
        const existing = activeStore.cartItems.find((i) =>
          (filter.cartId ? i.cartId === filter.cartId : true) &&
          (filter.productId ? i.productId === filter.productId : true)
        );

        if (existing) {
          const qty = update.quantity?.increment !== undefined
            ? existing.quantity + update.quantity.increment
            : (update.quantity ?? existing.quantity);
          existing.quantity = qty;
          return { ...existing };
        } else {
          const id = `citem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const newItem = {
            id,
            cartId: create.cartId || filter.cartId,
            productId: create.productId || filter.productId,
            quantity: create.quantity?.increment ?? create.quantity ?? 1,
          };
          activeStore.cartItems.push(newItem);
          return { ...newItem };
        }
      }),
      delete: vi.fn(async ({ where }: any) => {
        const filter = where.cartId_productId || where;
        const idx = activeStore.cartItems.findIndex((i) => matchFilter(i, filter));
        if (idx === -1) throw new Error("CartItem not found");
        return activeStore.cartItems.splice(idx, 1)[0];
      }),
      deleteMany: vi.fn(async ({ where }: any) => {
        let count = 0;
        const filter = where.cartId_productId || where;
        activeStore.cartItems = activeStore.cartItems.filter((i) => {
          if (matchFilter(i, filter)) {
            count++;
            return false;
          }
          return true;
        });
        return { count };
      }),
    },

    notification: {
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const notif = { id, createdAt: new Date(), isRead: false, ...data };
        activeStore.notifications.push(notif);
        return { ...notif };
      }),
      findMany: vi.fn(async ({ where }: any = {}) => {
        return activeStore.notifications.filter((n) => matchFilter(n, where));
      }),
    },

    systemSetting: {
      findUnique: vi.fn(async ({ where }: any) => {
        return activeStore.systemSettings.find((s) => matchFilter(s, where)) || null;
      }),
      findMany: vi.fn(async ({ where }: any = {}) => {
        return activeStore.systemSettings.filter((s) => matchFilter(s, where));
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `setting_${Date.now()}`;
        const setting = { id, ...data };
        activeStore.systemSettings.push(setting);
        return { ...setting };
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const existing = activeStore.systemSettings.find((s) => matchFilter(s, where));
        if (existing) {
          Object.assign(existing, update);
          return { ...existing };
        } else {
          const setting = { id: `setting_${Date.now()}`, ...create };
          activeStore.systemSettings.push(setting);
          return { ...setting };
        }
      }),
    },

    address: {
      findMany: vi.fn(async ({ where }: any = {}) => {
        return activeStore.addresses.filter((a) => matchFilter(a, where));
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = data.id || `addr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const address = { id, ...data };
        activeStore.addresses.push(address);
        return { ...address };
      }),
    },

    $transaction: vi.fn(async (arg: any) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      } else if (typeof arg === "function") {
        return arg(client);
      }
      return arg;
    }),
  };

  return client;
}

export const mockPrisma = createMockPrismaClient();

