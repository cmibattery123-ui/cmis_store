"use server";

import { db } from "@/lib/db";

export type WarrantyCheckResult = {
  success: boolean;
  message?: string;
  data?: {
    serialNumber: string;
    model: string;
    capacity: string;
    warrantyExpiry: Date;
    status: string;
    customerName: string | null;
    purchaseDate: Date;
  };
};

export async function checkWarrantyAction(serialNumber: string): Promise<WarrantyCheckResult> {
  if (!serialNumber || typeof serialNumber !== "string") {
    return { success: false, message: "Please provide a valid serial number." };
  }

  const cleanedSerial = serialNumber.trim().toUpperCase();

  try {
    const warranty = await db.batteryWarranty.findUnique({
      where: { serialNumber: cleanedSerial },
    });

    if (!warranty) {
      return {
        success: false,
        message: "No warranty record found for this serial number. Please check the number and try again.",
      };
    }

    // Determine status dynamically based on current time if it's set to Active but date has passed
    let status = warranty.status;
    const now = new Date();
    if (status === "Active" && new Date(warranty.warrantyExpiry) < now) {
      status = "Expired";
    }

    return {
      success: true,
      data: {
        serialNumber: warranty.serialNumber,
        model: warranty.model,
        capacity: warranty.capacity,
        warrantyExpiry: warranty.warrantyExpiry,
        status: status,
        customerName: warranty.customerName,
        purchaseDate: warranty.purchaseDate,
      },
    };
  } catch (error) {
    console.error("Error checking warranty:", error);
    return {
      success: false,
      message: "An internal server error occurred while retrieving warranty status. Please try again later.",
    };
  }
}
