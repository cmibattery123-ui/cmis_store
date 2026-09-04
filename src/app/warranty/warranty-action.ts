"use server";

import { db } from "@/lib/db";
import { actionSuccess, actionError, type ActionResult } from "@/lib/utils/api";

export type WarrantyData = {
  serialNumber: string;
  model: string;
  capacity: string;
  warrantyExpiry: Date;
  status: string;
  customerName: string | null;
  purchaseDate: Date;
};

export type WarrantyCheckResult = ActionResult<WarrantyData>;

export async function checkWarrantyAction(serialNumber: string): Promise<WarrantyCheckResult> {
  if (!serialNumber || typeof serialNumber !== "string") {
    return actionError("Please provide a valid serial number.");
  }

  const cleanedSerial = serialNumber.trim().toUpperCase();

  try {
    const warranty = await db.batteryWarranty.findUnique({
      where: { serialNumber: cleanedSerial },
    });

    if (!warranty) {
      return actionError("No warranty record found for this serial number. Please check the number and try again.");
    }

    // Determine status dynamically based on current time if it's set to Active but date has passed
    let status = warranty.status;
    const now = new Date();
    if (status === "Active" && new Date(warranty.warrantyExpiry) < now) {
      status = "Expired";
    }

    return actionSuccess({
      serialNumber: warranty.serialNumber,
      model: warranty.model,
      capacity: warranty.capacity,
      warrantyExpiry: warranty.warrantyExpiry,
      status: status,
      customerName: warranty.customerName,
      purchaseDate: warranty.purchaseDate,
    });
  } catch (error) {
    console.error("Error checking warranty:", error);
    return actionError("An internal server error occurred while retrieving warranty status. Please try again later.");
  }
}
