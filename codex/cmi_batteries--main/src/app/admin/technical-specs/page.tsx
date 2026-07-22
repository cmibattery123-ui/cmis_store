import { db } from "@/lib/db";
import TechnicalSpecsClient from "./TechnicalSpecsClient";

export const metadata = {
  title: "Technical Specs | Admin",
};

export default async function TechnicalSpecsPage() {
  const specs = await db.technicalSpec.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <TechnicalSpecsClient initialSpecs={specs} />;
}
