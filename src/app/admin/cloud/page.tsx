"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Cloud, CreditCard, Save, RefreshCw } from "lucide-react";

export default function CloudSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingBilling, setFetchingBilling] = useState(false);
  const [formData, setFormData] = useState({
    awsAccessKeyId: "",
    awsSecretKey: "",
    awsRegion: "us-east-1",
    awsAccountId: "",
  });
  
  const [billing, setBilling] = useState<{ amountUsed: string, amountRemaining: string, error?: string }>({
    amountUsed: "0.00",
    amountRemaining: "100.00"
  });

  useEffect(() => {
    fetchSettings();
    fetchBilling();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/cloud-settings");
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch (error) {
      toast.error("Failed to load cloud settings");
    }
  };

  const fetchBilling = async () => {
    setFetchingBilling(true);
    try {
      const res = await fetch("/api/admin/cloud-settings/billing");
      if (res.ok) {
        const data = await res.json();
        setBilling(data);
        if (data.error) {
          toast.warning(data.error);
        }
      }
    } catch (error) {
      toast.error("Failed to load billing info");
    } finally {
      setFetchingBilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cloud-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Cloud settings updated successfully!");
        fetchBilling(); // Refresh billing after key update
      } else {
        toast.error("Failed to update cloud settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">AWS Cloud Settings</h3>
        <p className="text-muted-foreground">
          Manage your AWS credentials for cost tracking and programmatic access.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Billing Widget */}
        <Card className="border-blue-500/20 shadow-md">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                AWS Billing & Credits
              </CardTitle>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchBilling} 
                disabled={fetchingBilling}
                className="h-8 w-8"
              >
                <RefreshCw className={`w-4 h-4 ${fetchingBilling ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <CardDescription>
              Current month spending against your $100 AWS credits
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Amount Used</p>
                <p className="text-3xl font-bold text-rose-500">${billing.amountUsed}</p>
              </div>
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Credits Remaining</p>
                <p className="text-3xl font-bold text-emerald-500">${billing.amountRemaining}</p>
              </div>
            </div>
            {billing.error && (
              <p className="mt-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-3 rounded border border-amber-200 dark:border-amber-900">
                {billing.error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Credentials Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              AWS Credentials
            </CardTitle>
            <CardDescription>
              Update your AWS IAM keys. Ensure the user has `ce:GetCostAndUsage` permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="awsAccountId">AWS Account ID</Label>
                <Input
                  id="awsAccountId"
                  value={formData.awsAccountId}
                  onChange={(e) => setFormData({ ...formData, awsAccountId: e.target.value })}
                  placeholder="e.g. 123456789012"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awsAccessKeyId">Access Key ID</Label>
                <Input
                  id="awsAccessKeyId"
                  value={formData.awsAccessKeyId}
                  onChange={(e) => setFormData({ ...formData, awsAccessKeyId: e.target.value })}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awsSecretKey">Secret Access Key</Label>
                <Input
                  id="awsSecretKey"
                  type="password"
                  value={formData.awsSecretKey}
                  onChange={(e) => setFormData({ ...formData, awsSecretKey: e.target.value })}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the current secret key.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="awsRegion">Default Region</Label>
                <Input
                  id="awsRegion"
                  value={formData.awsRegion}
                  onChange={(e) => setFormData({ ...formData, awsRegion: e.target.value })}
                  placeholder="us-east-1"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Credentials"}
                {!loading && <Save className="ml-2 w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
