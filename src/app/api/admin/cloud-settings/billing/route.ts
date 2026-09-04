import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = getDb();
    const settings = await db.cloudSettings.findUnique({
      where: { id: "DEFAULT" },
    });

    if (!settings?.awsAccessKeyId || !settings?.awsSecretKey) {
      return NextResponse.json({ 
        amountUsed: "0.00",
        amountRemaining: "100.00",
        error: "AWS Credentials not configured in Cloud Settings" 
      });
    }

    const client = new CostExplorerClient({
      region: settings.awsRegion || "us-east-1",
      credentials: {
        accessKeyId: settings.awsAccessKeyId,
        secretAccessKey: settings.awsSecretKey,
      }
    });

    // Get current month start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: startOfMonth.toISOString().split('T')[0],
        End: endOfMonth.toISOString().split('T')[0],
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
    });

    try {
      const response = await client.send(command);
      
      let totalUsed = 0;
      if (response.ResultsByTime && response.ResultsByTime.length > 0) {
        const costStr = response.ResultsByTime[0]?.Total?.UnblendedCost?.Amount || "0";
        totalUsed = parseFloat(costStr);
      }

      // Hardcoded 100 limit based on user's $100 credit. 
      // A more robust system would fetch exact credit balance if needed, but AWS doesn't expose credit balances easily via Cost Explorer API.
      const amountRemaining = Math.max(0, 100 - totalUsed);

      return NextResponse.json({
        amountUsed: totalUsed.toFixed(2),
        amountRemaining: amountRemaining.toFixed(2)
      });

    } catch (awsError: any) {
      console.error("AWS Cost Explorer error:", awsError);
      return NextResponse.json({
        amountUsed: "0.00",
        amountRemaining: "100.00",
        error: "Failed to fetch from AWS. Ensure your IAM user has 'ce:GetCostAndUsage' permissions."
      });
    }

  } catch (error: any) {
    console.error("GET Billing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing" },
      { status: 500 }
    );
  }
}
