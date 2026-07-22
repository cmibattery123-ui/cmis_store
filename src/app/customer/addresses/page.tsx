import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import AddressesClient from "./AddressesClient";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <AddressesClient initialAddresses={addresses} />
    </div>
  );
}
