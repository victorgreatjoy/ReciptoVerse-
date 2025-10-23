import React, { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { Progress } from "./ui/Progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table";
import { Coins, TrendingUp, Award, ArrowRight, Sparkles } from "lucide-react";
import {
  getPointsBalance,
  getPointsHistory,
  getPointsStats,
  getLoyaltyTiers,
  calculateTokenConversion,
  calculatePointsToNextTier,
} from "../services/pointsService";
import TokenMintModal from "./TokenMintModal";
import { showToast } from "../utils/toastUtils";

const PointsDashboard = () => {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [tiers, setTiers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMintModal, setShowMintModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tier colors and icons
  const tierStyles = {
    bronze: {
      color: "from-amber-700 to-amber-900",
      badge: "bg-amber-700",
      icon: "🥉",
    },
    silver: {
      color: "from-gray-400 to-gray-600",
      badge: "bg-gray-400",
      icon: "🥈",
    },
    gold: {
      color: "from-yellow-400 to-yellow-600",
      badge: "bg-yellow-500",
      icon: "🥇",
    },
    platinum: {
      color: "from-cyan-400 to-blue-600",
      badge: "bg-cyan-500",
      icon: "💎",
    },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, historyData, statsData, tiersData] =
        await Promise.all([
          getPointsBalance(),
          getPointsHistory(itemsPerPage, 0),
          getPointsStats(),
          getLoyaltyTiers(),
        ]);

      console.log("Balance data:", balanceData);
      console.log("Stats data:", statsData);
      console.log("Tiers data:", tiersData);

      setBalance(balanceData.data || balanceData);
      setHistory(
        historyData.data?.transactions || historyData.transactions || []
      );
      setStats(statsData.data || statsData);
      setTiers(tiersData.data || tiersData);
    } catch (error) {
      console.error("Error loading points data:", error);
      showToast.error("Failed to load points data");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    try {
      const offset = currentPage * itemsPerPage;
      const moreData = await getPointsHistory(itemsPerPage, offset);
      setHistory([...history, ...(moreData.transactions || [])]);
      setCurrentPage(currentPage + 1);
    } catch (error) {
      console.error("Error loading more history:", error);
      showToast.error("Failed to load more transactions");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateProgress = () => {
    if (!stats || !tiers) return 0;

    const currentTierData = tiers[stats.tier];
    if (!currentTierData) return 0;

    const tierOrder = ["bronze", "silver", "gold", "platinum"];
    const currentIndex = tierOrder.indexOf(stats.tier);

    if (currentIndex === tierOrder.length - 1) return 100; // Max tier
    if (currentIndex === -1) return 0; // Invalid tier

    const nextTier = tiers[tierOrder[currentIndex + 1]];
    if (!nextTier) return 100;

    const currentMin = currentTierData.minPoints;
    const nextMin = nextTier.minPoints;
    const progress =
      ((stats.totalEarned - currentMin) / (nextMin - currentMin)) * 100;

    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tierStyle = tierStyles[balance?.tier || "bronze"];
  const estimatedTokens = calculateTokenConversion(balance?.balance || 0);
  const progressPercent = calculateProgress();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rewards Dashboard</h1>
          <p className="text-muted-foreground">
            Track your points and loyalty status
          </p>
        </div>
        <Button
          onClick={() => setShowMintModal(true)}
          disabled={!balance || balance.balance < 100}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Mint Tokens
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Points Balance Card */}
        <Card className="border-2" padding="md">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">
              Points Balance
            </h3>
            <Coins className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {balance?.balance || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ≈ {estimatedTokens.toFixed(2)} $RVT tokens
            </p>
          </div>
        </Card>

        {/* Loyalty Tier Card */}
        <Card
          className={`border-2 bg-gradient-to-br ${tierStyle.color}`}
          padding="md"
        >
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Loyalty Tier</h3>
            <Award className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl">{tierStyle.icon}</span>
              <span className="text-2xl font-bold text-white capitalize">
                {balance?.tier || "Bronze"}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1">
              {tiers?.[balance?.tier]?.multiplier || 1}x points multiplier
            </p>
          </div>
        </Card>

        {/* Total Earned Card */}
        <Card className="border-2" padding="md">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Total Earned</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.totalEarned || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Lifetime points earned</p>
          </div>
        </Card>
      </div>

      {/* Tier Progress */}
      {tiers && balance?.tier !== "platinum" && (
        <Card padding="md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progress to Next Tier
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{balance?.tier || "Bronze"}</span>
              <span className="capitalize">
                {balance?.tier === "bronze" && "Silver"}
                {balance?.tier === "silver" && "Gold"}
                {balance?.tier === "gold" && "Platinum"}
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-gray-500">
              {calculatePointsToNextTier(stats?.totalEarned || 0, tiers)} points
              needed to reach the next tier
            </p>
          </div>
        </Card>
      )}

      {/* Transaction History */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>
        <div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">
                Start earning points by shopping at partner merchants!
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.transaction_type === "earn"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.merchant_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.description || "Purchase reward"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span
                          className={
                            transaction.transaction_type === "earn"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.transaction_type === "earn" ? "+" : "-"}
                          {transaction.amount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {history.length >= itemsPerPage * currentPage && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={loadMoreHistory}>
                    Load More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Token Mint Modal */}
      {showMintModal && (
        <TokenMintModal
          isOpen={showMintModal}
          onClose={() => setShowMintModal(false)}
          currentBalance={balance?.balance || 0}
          onMintSuccess={loadData}
        />
      )}
    </div>
  );
};

export default PointsDashboard;
