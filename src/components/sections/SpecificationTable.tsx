import { db } from "@/lib/db";
import SpecificationTableClient from "./SpecificationTableClient";

export default async function SpecificationTable() {
  const specs = await db.technicalSpec.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <SpecificationTableClient initialSpecs={specs} />;
}
