import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = session.user.id;
    
    // Verify user exists to prevent foreign key constraint violations if session is stale
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError("User not found or session stale", 401);
    }

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
      cart = await db.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } }
      });
    }

    const formattedItems = cart.items.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      price: Number(item.product.price),
      dealerPrice: Number(item.product.dealerPrice),
      image: item.product.images[0]?.url,
      quantity: item.quantity,
      taxRate: Number(item.product.taxRate),
    }));

    return apiSuccess({ items: formattedItems });
  } catch (error) {
    console.error("[cart_get]", error);
    return apiError("Failed to fetch cart", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = session.user.id;
    
    // Verify user exists to prevent foreign key constraint violations if session is stale
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError("User not found or session stale", 401);
    }

    const body = await request.json();
    const { action, item, items, productId, quantity } = body;

    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    if (action === "sync") {
      // Merge local cart to DB
      if (Array.isArray(items)) {
        for (const localItem of items) {
          const existing = await db.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId: localItem.productId } }
          });
          
          if (existing) {
            await db.cartItem.update({
              where: { id: existing.id },
              data: { quantity: Math.max(existing.quantity, localItem.quantity) }
            });
          } else {
            await db.cartItem.create({
              data: {
                cartId: cart.id,
                productId: localItem.productId,
                quantity: localItem.quantity,
              }
            });
          }
        }
      }
    } else if (action === "add") {
      const existing = await db.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: item.productId } }
      });
      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity }
        });
      } else {
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          }
        });
      }
    } else if (action === "update") {
      if (quantity <= 0) {
        await db.cartItem.delete({
          where: { cartId_productId: { cartId: cart.id, productId } }
        });
      } else {
        await db.cartItem.update({
          where: { cartId_productId: { cartId: cart.id, productId } },
          data: { quantity }
        });
      }
    } else if (action === "remove") {
      await db.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } }
      });
    } else if (action === "clear") {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // Return full updated cart
    const updatedCart = await db.cart.findUnique({
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

    const formattedItems = updatedCart?.items.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      price: Number(item.product.price),
      dealerPrice: Number(item.product.dealerPrice),
      image: item.product.images[0]?.url,
      quantity: item.quantity,
      taxRate: Number(item.product.taxRate),
    })) || [];

    return apiSuccess({ items: formattedItems });
  } catch (error) {
    console.error("[cart_post]", error);
    return apiError("Failed to update cart", 500);
  }
}
