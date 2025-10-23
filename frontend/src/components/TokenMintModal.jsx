import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Label from "./ui/Label";
import Slider from "./ui/Slider";
import {
  Sparkles,
  Coins,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { calculateTokenConversion } from "../services/pointsService";
import { showToast } from "../utils/toastUtils";
import confetti from "canvas-confetti";

const TokenMintModal = ({ isOpen, onClose, currentBalance, onMintSuccess }) => {
  const [pointsToMint, setPointsToMint] = useState(100);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // null, 'pending', 'success', 'error'
  const [txHash, setTxHash] = useState("");

  const CONVERSION_RATE = 100; // 100 points = 1 token
  const MIN_POINTS = 100;
  const maxPoints = Math.floor(currentBalance / 100) * 100; // Round down to nearest 100

  const tokensToReceive = calculateTokenConversion(
    pointsToMint,
    CONVERSION_RATE
  );

  const handleSliderChange = (value) => {
    setPointsToMint(value[0]);
  };

  const handleMint = async () => {
    if (pointsToMint < MIN_POINTS) {
      showToast.error(`Minimum ${MIN_POINTS} points required to mint`);
      return;
    }

    if (pointsToMint > currentBalance) {
      showToast.error("Insufficient points balance");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("pending");

      // TODO: Implement actual minting logic with Hedera Token Service
      // This is a placeholder for the actual implementation

      // Step 1: Request mint from backend
      const response = await fetch("/api/tokens/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          pointsToSpend: pointsToMint,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate mint request");
      }

      await response.json();

      // Step 2: Sign transaction with HashConnect (wallet integration)
      // const wallet = useSelector((state) => state.wallet);
      // const signedTx = await hashconnect.signTransaction(data.transaction);

      // Step 3: Submit to Hedera
      // const txReceipt = await submitToHedera(signedTx);

      // Simulate successful transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setTxStatus("success");
      setTxHash("0.0.12345678-1234567890-123456789"); // Mock transaction ID

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#9333ea", "#3b82f6", "#fbbf24"],
      });

      showToast.success(
        `Successfully minted ${tokensToReceive.toFixed(2)} $RVT tokens!`
      );

      // Refresh parent component data
      setTimeout(() => {
        onMintSuccess();
        handleClose();
      }, 3000);
    } catch (error) {
      console.error("Error minting tokens:", error);
      setTxStatus("error");
      showToast.error("Failed to mint tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPointsToMint(100);
    setTxStatus(null);
    setTxHash("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Mint $RVT Tokens</span>
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Convert your points to $RVT tokens on Hedera network
          </p>
        </DialogHeader>

        {txStatus === null && (
          <div className="space-y-6 py-4">
            {/* Points Input */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="points">Points to Convert</Label>
                <span className="text-sm text-muted-foreground">
                  Balance: {currentBalance} points
                </span>
              </div>

              <Slider
                id="points"
                min={MIN_POINTS}
                max={maxPoints}
                step={100}
                value={[pointsToMint]}
                onValueChange={handleSliderChange}
                className="w-full"
                disabled={loading}
              />

              <Input
                type="number"
                value={pointsToMint}
                onChange={(e) =>
                  setPointsToMint(
                    Math.max(MIN_POINTS, parseInt(e.target.value) || MIN_POINTS)
                  )
                }
                min={MIN_POINTS}
                max={maxPoints}
                step={100}
                disabled={loading}
                className="text-center text-lg font-semibold"
              />
            </div>

            {/* Conversion Preview */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Points</span>
                </div>
                <span className="font-bold text-lg">{pointsToMint}</span>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">$RVT Tokens</span>
                </div>
                <span className="font-bold text-lg text-purple-600">
                  {tokensToReceive.toFixed(2)}
                </span>
              </div>

              <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                Conversion Rate: {CONVERSION_RATE} points = 1 $RVT
              </div>
            </div>

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Points will be deducted from your balance</p>
              <p>• Tokens will be sent to your connected wallet</p>
              <p>• Transaction fee: ~$0.001 (paid in HBAR)</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMint}
                disabled={
                  loading ||
                  pointsToMint < MIN_POINTS ||
                  pointsToMint > currentBalance
                }
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Mint Tokens
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {txStatus === "pending" && (
          <div className="py-8 text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Processing Transaction</h3>
              <p className="text-sm text-muted-foreground">
                Please confirm the transaction in your wallet...
              </p>
            </div>
          </div>
        )}

        {txStatus === "success" && (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-green-600">Success!</h3>
              <p className="text-sm text-muted-foreground">
                Successfully minted {tokensToReceive.toFixed(2)} $RVT tokens
              </p>
              {txHash && (
                <p className="text-xs text-muted-foreground font-mono break-all px-4">
                  TX: {txHash}
                </p>
              )}
            </div>
          </div>
        )}

        {txStatus === "error" && (
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-red-600">
                Transaction Failed
              </h3>
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
            </div>
            <Button variant="outline" onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TokenMintModal;
