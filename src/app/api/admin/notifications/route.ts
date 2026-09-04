import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { createNotificationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notification.count(),
    ]);

    return apiSuccess({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[admin_notifications_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validated = createNotificationSchema.safeParse(body);
    if (!validated.success) {
      return apiError("Title and message are required", 400);
    }

    const { title, message, userId, type } = validated.data;

    if (userId) {
      const notification = await db.notification.create({
        data: {
          title,
          message,
          userId,
          type: type || "INFO",
        },
      });
      return apiSuccess(notification);
    }

    // Broadcast to all active users
    const users = await db.user.findMany({ where: { isActive: true }, select: { id: true } });
    if (users.length > 0) {
      await db.notification.createMany({
        data: users.map((u) => ({
          title,
          message,
          userId: u.id,
          type: type || "INFO",
        })),
      });
    }

    return apiSuccess({ success: true, count: users.length });
  } catch (error) {
    console.error("[admin_notifications_post]", error);
    return apiError("Internal server error", 500);
  }
}
