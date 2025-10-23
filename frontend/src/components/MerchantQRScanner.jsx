import React, { useState, useEffect, useRef, useCallback } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Label from "./ui/Label";
import Textarea from "./ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Coins,
  User,
} from "lucide-react";
import { scanQRAndAwardPoints } from "../services/pointsService";
import { showToast } from "../utils/toastUtils";
import confetti from "canvas-confetti";
import { Html5QrcodeScanner } from "html5-qrcode";

const MerchantQRScanner = () => {
  const [scannerMode, setScannerMode] = useState("camera"); // 'camera' or 'manual'
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  const onScanSuccess = useCallback((decodedText) => {
    console.log("QR Code scanned:", decodedText);
    setScannedData(decodedText);

    // Stop scanner after successful scan
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error);
    }

    showToast.success("QR Code scanned successfully!");
  }, []);

  const onScanError = useCallback(() => {
    // Silent error handling
  }, []);

  const initializeScanner = useCallback(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    html5QrcodeScannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    html5QrcodeScannerRef.current.render(onScanSuccess, onScanError);
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    if (scannerMode === "camera" && scannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, [scannerMode, initializeScanner]);

  const handleAwardPoints = async () => {
    if (!scannedData) {
      showToast.error("Please scan a QR code first");
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      showToast.error("Please enter a valid purchase amount");
      return;
    }

    try {
      setLoading(true);

      // Parse QR data
      let qrData;
      try {
        qrData = JSON.parse(scannedData);
      } catch {
        // Assume it's a plain userId
        qrData = scannedData;
      }

      // Award points
      const receiptData = receiptNotes
        ? {
            notes: receiptNotes,
            timestamp: new Date().toISOString(),
          }
        : null;

      const response = await scanQRAndAwardPoints(
        qrData,
        parseFloat(purchaseAmount),
        receiptData
      );

      setResult(response);
      setShowResult(true);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f59e0b", "#d97706"],
      });

      // Reset form
      setPurchaseAmount("");
      setReceiptNotes("");
      setScannedData(null);

      // Restart scanner after delay
      setTimeout(() => {
        setShowResult(false);
        setResult(null);
        if (scannerMode === "camera") {
          initializeScanner();
        }
      }, 5000);
    } catch (error) {
      console.error("Error awarding points:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to award points";
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    const userId = prompt("Enter User ID:");
    if (userId) {
      setScannedData(userId);
      showToast.success("User ID entered");
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setPurchaseAmount("");
    setReceiptNotes("");
    if (scannerMode === "camera") {
      initializeScanner();
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto" padding="md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <span>Scan Customer QR Code</span>
          </h2>
        </div>
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={scannerMode === "camera" ? "default" : "outline"}
              onClick={() => setScannerMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={scannerMode === "manual" ? "default" : "outline"}
              onClick={() => setScannerMode("manual")}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {/* Camera Scanner */}
          {scannerMode === "camera" && !scannedData && (
            <div
              id="qr-reader"
              ref={scannerRef}
              className="w-full rounded-lg overflow-hidden border-2 border-primary"
            />
          )}

          {/* Manual Entry */}
          {scannerMode === "manual" && !scannedData && (
            <div className="text-center py-8 space-y-4">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Click below to manually enter customer User ID
              </p>
              <Button onClick={handleManualEntry} variant="outline">
                Enter User ID
              </Button>
            </div>
          )}

          {/* Scanned Data Confirmation */}
          {scannedData && (
            <div className="space-y-4">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-300">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">
                    QR Code Scanned Successfully
                  </span>
                </div>
              </div>

              {/* Purchase Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Purchase Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="text-lg"
                  disabled={loading}
                />
              </div>

              {/* Receipt Notes (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="notes">Receipt Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this transaction..."
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Points Preview */}
              {purchaseAmount && (
                <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Estimated Points:
                    </span>
                    <span className="text-2xl font-bold text-amber-600">
                      ~{Math.floor(parseFloat(purchaseAmount) || 0)}+
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Actual points may vary based on customer's tier
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={resetScanner}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAwardPoints}
                  disabled={loading || !purchaseAmount}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Award Points
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Success Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Points Awarded!</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>

            {result && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">
                      {result.user?.email || "Customer"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{result.user?.handle || "N/A"}
                  </p>
                </div>

                {/* Points Awarded */}
                <div className="p-6 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Points Awarded
                  </p>
                  <p className="text-5xl font-bold text-amber-600">
                    +{result.points?.awarded || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    New Balance: {result.points?.newBalance || 0} points
                  </p>
                </div>

                {/* Tier Info */}
                {result.points?.tierChanged && (
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg text-center">
                    <p className="font-semibold text-purple-600">
                      🎉 Tier Upgraded!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Customer reached{" "}
                      <span className="font-bold capitalize">
                        {result.points?.newTier}
                      </span>{" "}
                      tier
                    </p>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground">
              This dialog will close automatically in a few seconds...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MerchantQRScanner;
