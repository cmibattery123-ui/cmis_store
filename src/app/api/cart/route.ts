import { auth, getDbUserFromSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { LEGACY_PRODUCT_ID_MAP } from "@/lib/default-data";

export const dynamic = "force-dynamic";

async function resolveDbProductIds(clientProductIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!clientProductIds || clientProductIds.length === 0) return map;

  const allCandidates: string[] = [];
  const clientToCandidates = new Map<string, string[]>();

  for (const cid of clientProductIds) {
    if (!cid) continue;
    const legacy = LEGACY_PRODUCT_ID_MAP[cid];
    const candidates = legacy
      ? [cid, legacy.id, legacy.sku, legacy.slug]
      : [cid];
    clientToCandidates.set(cid, candidates);
    allCandidates.push(...candidates);
  }

  if (allCandidates.length === 0) return map;

  const products = await db.product.findMany({
    where: {
      OR: [
        { id: { in: allCandidates } },
        { sku: { in: allCandidates } },
        { slug: { in: allCandidates } },
      ],
    },
    select: { id: true, sku: true, slug: true },
  });

  for (const [cid, candidates] of clientToCandidates.entries()) {
    const matched = products.find((p) =>
      candidates.includes(p.id) ||
      (p.sku && candidates.includes(p.sku)) ||
      (p.slug && candidates.includes(p.slug))
    );
    if (matched) {
      map.set(cid, matched.id);
    }
  }

  return map;
}

async function resolveDbProductId(clientProductId: string): Promise<string | null> {
  if (!clientProductId) return null;
  const map = await resolveDbProductIds([clientProductId]);
  return map.get(clientProductId) || null;
}

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) {
      return apiSuccess({ items: [] });
    }

    const userId = dbUser.id;

    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      try {
        cart = await db.cart.create({
          data: { userId },
          include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } }
        });
      } catch {
        return apiSuccess({ items: [] });
      }
    }

    const formattedItems = (cart?.items || [])
      .filter((item) => item?.product)
      .map(item => ({
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        price: Number(item.product.price || 0),
        dealerPrice: Number(item.product.dealerPrice || item.product.price || 0),
        image: item.product.images?.[0]?.url || "/assets/batt1-removebg-preview.png",
        quantity: item.quantity || 1,
        taxRate: Number(item.product.taxRate || 18),
      }));

    return apiSuccess({ items: formattedItems });
  } catch (error) {
    console.error("[cart_get]", error);
    return apiSuccess({ items: [] });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) {
      return apiError("Unauthorized", 401);
    }

    const userId = dbUser.id;
    const body = await request.json();
    const { action, item, items, productId, quantity } = body;

    const cart = await db.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    if (action === "sync") {
      // Merge local cart to DB in a single batch
      if (Array.isArray(items) && items.length > 0) {
        const productIds = items
          .map((i: any) => i?.productId)
          .filter((id): id is string => Boolean(id));
        const resolvedMap = await resolveDbProductIds(productIds);

        const upsertOps: Array<ReturnType<typeof db.cartItem.upsert>> = [];
        for (const localItem of items) {
          const resolvedId = resolvedMap.get(localItem.productId);
          if (!resolvedId) continue;

          const qty = Math.max(1, localItem.quantity || 1);
          upsertOps.push(
            db.cartItem.upsert({
              where: { cartId_productId: { cartId: cart.id, productId: resolvedId } },
              update: { quantity: qty },
              create: {
                cartId: cart.id,
                productId: resolvedId,
                quantity: qty,
              },
            })
          );
        }

        if (upsertOps.length > 0) {
          await db.$transaction(upsertOps);
        }
      }
    } else if (action === "add" && item) {
      const resolvedId = (await resolveDbProductId(item.productId)) || item.productId;
      if (resolvedId) {
        await db.cartItem.upsert({
          where: { cartId_productId: { cartId: cart.id, productId: resolvedId } },
          update: { quantity: { increment: item.quantity || 1 } },
          create: {
            cartId: cart.id,
            productId: resolvedId,
            quantity: item.quantity || 1,
          },
        });
      }
    } else if (action === "update" && productId) {
      const resolvedId = (await resolveDbProductId(productId)) || productId;
      if (quantity <= 0) {
        await db.cartItem.deleteMany({
          where: { cartId: cart.id, productId: { in: [productId, resolvedId] } }
        });
      } else {
        await db.cartItem.upsert({
          where: { cartId_productId: { cartId: cart.id, productId: resolvedId } },
          update: { quantity },
          create: { cartId: cart.id, productId: resolvedId, quantity },
        });
      }
    } else if (action === "remove" && productId) {
      const resolvedId = (await resolveDbProductId(productId)) || productId;
      await db.cartItem.deleteMany({
        where: { cartId: cart.id, productId: { in: [productId, resolvedId] } }
      });
    } else if (action === "clear") {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("[cart_post]", error);
    return apiError("Failed to update cart", 500);
  }
}
