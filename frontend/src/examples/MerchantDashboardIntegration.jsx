// Example integration for MerchantDashboard.jsx
// This shows how to add the MerchantQRScanner to your existing merchant dashboard

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MerchantQRScanner from "@/components/MerchantQRScanner";
import { getMerchantRewardsStats } from "@/services/pointsService";
import { Camera, BarChart3, Store, Award } from "lucide-react";

const MerchantDashboard = () => {
  const [activeTab, setActiveTab] = useState("scanner");
  const [rewardsStats, setRewardsStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (activeTab === "rewards") {
      loadRewardsStats();
    }
  }, [activeTab]);

  const loadRewardsStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await getMerchantRewardsStats();
      setRewardsStats(stats);
    } catch (error) {
      console.error("Error loading rewards stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Merchant Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Scan customer QR codes and manage your rewards program
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner" className="flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span>QR Scanner</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Rewards Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span>Store Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* NEW: QR Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          <MerchantQRScanner />
        </TabsContent>

        {/* NEW: Rewards Stats Tab */}
        <TabsContent value="rewards" className="space-y-6">
          {loadingStats ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Points Distributed
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {rewardsStats?.totalPointsDistributed?.toLocaleString() ||
                        0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lifetime points awarded
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Transactions
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {rewardsStats?.totalTransactions?.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Points awards processed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Reward Rate
                    </CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {rewardsStats?.rewardRate || 1}x
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current multiplier
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              {rewardsStats?.recentTransactions &&
                rewardsStats.recentTransactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {rewardsStats.recentTransactions.map((tx, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-muted rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                @{tx.user_handle || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                +{tx.amount} pts
                              </p>
                              <p className="text-xs text-muted-foreground">
                                $
                                {parseFloat(tx.purchase_amount || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Top Customers */}
              {rewardsStats?.topCustomers &&
                rewardsStats.topCustomers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {rewardsStats.topCustomers.map((customer, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-muted rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  @{customer.user_handle || "Anonymous"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {customer.transaction_count} purchases
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-amber-600">
                                {customer.total_points} pts
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Total earned
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Your existing analytics content */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your analytics charts and reports go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Settings Tab */}
        <TabsContent value="store" className="space-y-6">
          {/* Your existing store settings */}
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your store configuration options go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantDashboard;
