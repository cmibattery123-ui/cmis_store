import { db } from "@/lib/db";
import SpecificationTableClient from "./SpecificationTableClient";

const DEFAULT_SPECS = [
  { id: "cmip-12-2.5", model: "CMIP 12-2.5", volts: "12V", capacity: "2.5Ah", length: "8.0", breadth: "7.0", height: "10.5", weight: "0.48", sortOrder: 1 },
  { id: "cmip-12-5", model: "CMIP 12-5 (Z4 / Z5)", volts: "12V", capacity: "5Ah", length: "11.3", breadth: "7.0", height: "10.5", weight: "0.85", sortOrder: 2 },
  { id: "cmip-12-7", model: "CMIP 12-7 (6LB / 7LB)", volts: "12V", capacity: "7Ah", length: "15.0", breadth: "6.5", height: "9.3", weight: "0.95", sortOrder: 3 },
  { id: "cmip-12-9", model: "CMIP 12-9 (9LB)", volts: "12V", capacity: "9Ah", length: "13.5", breadth: "7.5", height: "13.9", weight: "1.15", sortOrder: 4 },
  { id: "cmip-12-12", model: "CMIP 12-12", volts: "12V", capacity: "12Ah", length: "15.1", breadth: "9.8", height: "9.5", weight: "1.40", sortOrder: 5 },
  { id: "cmip-life-100", model: "CMIP LiFe 100Ah", volts: "12V", capacity: "100Ah", length: "32.6", breadth: "17.5", height: "22.0", weight: "13.0", sortOrder: 6 },
  { id: "cmip-life-200", model: "CMIP LiFe 200Ah", volts: "12V", capacity: "200Ah", length: "52.0", breadth: "24.0", height: "22.0", weight: "24.0", sortOrder: 7 },
  { id: "cmip-inv-150", model: "CMIP SMART INVERTER", volts: "12V/24V", capacity: "150Ah", length: "50.5", breadth: "19.0", height: "41.0", weight: "52.0", sortOrder: 8 },
];

export default async function SpecificationTable() {
  let specs: any[] = [];
  try {
    specs = await db.technicalSpec.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // Graceful fallback for static prerendering builds
  }

  return <SpecificationTableClient initialSpecs={specs.length > 0 ? specs : DEFAULT_SPECS} />;
}
