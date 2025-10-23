// Example integration for UserDashboard.jsx
// This shows how to add the PointsDashboard to your existing user dashboard

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PointsDashboard from "@/components/PointsDashboard";
import EnhancedUserQRCode from "@/components/EnhancedUserQRCode";
import { Coins, QrCode, Receipt, User } from "lucide-react";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your receipts, rewards, and profile
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Receipts</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center space-x-2">
            <Coins className="h-4 w-4" />
            <span>Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="qr-code" className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Your existing overview content */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Add quick stats cards here */}
          </div>
        </TabsContent>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="space-y-6">
          {/* Your existing receipts list */}
        </TabsContent>

        {/* NEW: Rewards Tab - Points Dashboard */}
        <TabsContent value="rewards" className="space-y-6">
          <PointsDashboard />
        </TabsContent>

        {/* NEW: Enhanced QR Code Tab */}
        <TabsContent value="qr-code" className="space-y-6">
          <div className="flex justify-center">
            <EnhancedUserQRCode />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
