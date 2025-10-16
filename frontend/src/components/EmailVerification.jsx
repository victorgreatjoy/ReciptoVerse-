import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button, Card } from "./ui";
import { showToast } from "../utils/toastUtils";

const EmailVerification = ({
  email,
  onVerificationComplete,
  onResendCode,
  isOpen,
  onClose,
}) => {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [canResend, setCanResend] = useState(true); // Allow first resend immediately
  const [hasResent, setHasResent] = useState(false); // Track if user has resent at least once

  useEffect(() => {
    // Only start timer if we've already resent once
    if (timeLeft > 0 && hasResent && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasResent) {
      setCanResend(true);
      // Show a helpful message when the timer runs out
      if (isOpen) {
        showToast.info(
          "You can now request a new verification code.",
          "Timer Expired"
        );
      }
    }
  }, [timeLeft, isOpen, hasResent, canResend]);

  useEffect(() => {
    // Reset when component opens
    if (isOpen) {
      setVerificationCode(["", "", "", "", "", ""]);
      setTimeLeft(60); // 1 minute
      setCanResend(true); // Allow immediate first resend
      setHasResent(false); // Reset resend tracking
    }
  }, [isOpen]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-verify when all digits are entered
    if (
      newCode.every((digit) => digit !== "") &&
      newCode.join("").length === 6
    ) {
      verifyCode(newCode.join(""));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Extract only numeric characters and limit to 6 digits
    const numericData = pastedData.replace(/\D/g, "").slice(0, 6);

    if (numericData.length > 0) {
      const newCode = [...verificationCode];

      // Fill the array with pasted digits
      for (let i = 0; i < 6; i++) {
        newCode[i] = numericData[i] || "";
      }

      setVerificationCode(newCode);

      // Focus the last filled input or the first empty one
      const focusIndex = Math.min(numericData.length - 1, 5);
      const targetInput = document.getElementById(`code-${focusIndex}`);
      if (targetInput) {
        setTimeout(() => targetInput.focus(), 0);
      }

      // Auto-verify if we have 6 digits
      if (numericData.length === 6) {
        verifyCode(numericData);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyCode = async (code) => {
    setIsVerifying(true);

    try {
      // Use the onVerificationComplete callback instead of direct API call
      const result = await onVerificationComplete?.(
        code || verificationCode.join("")
      );

      if (result && result.success) {
        // Verification was successful
        // The parent component handles success messages and navigation
      } else {
        // Verification failed
        const errorCode = result?.code;
        const errorMessage = result?.error || "Verification failed";

        // Check if code expired - if so, allow immediate resend
        if (errorCode === "CODE_EXPIRED") {
          setCanResend(true);
          setTimeLeft(0);
          showToast.error(
            "Verification code has expired. You can now request a new one.",
            "Code Expired"
          );
        } else {
          showToast.error(errorMessage);
        }

        setVerificationCode(["", "", "", "", "", ""]);
        // Focus first input
        const firstInput = document.getElementById("code-0");
        if (firstInput) firstInput.focus();
      }
    } catch (error) {
      console.error("Verification error:", error);
      showToast.error("Verification failed. Please try again.");
      setVerificationCode(["", "", "", "", "", ""]);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const result = await onResendCode?.(email);

      if (result?.success) {
        showToast.success("Verification code sent to your email");
        setTimeLeft(60); // 1 minute countdown
        setCanResend(false);
        setHasResent(true); // Mark that user has resent, this will start the timer
        setVerificationCode(["", "", "", "", "", ""]);
      } else {
        showToast.error(result?.error || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      showToast.error("Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="text-center" padding="lg">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-earth-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-earth-600 text-sm">
              We've sent a 6-digit code to{" "}
              <span className="font-medium text-earth-900">{email}</span>
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-center space-x-2 mb-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-bold border-2 border-earth-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                  disabled={isVerifying}
                />
              ))}
            </div>

            {isVerifying && (
              <div className="flex items-center justify-center text-sm text-earth-600">
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => verifyCode()}
              variant="primary"
              size="lg"
              fullWidth
              loading={isVerifying}
              disabled={verificationCode.some((digit) => digit === "")}
            >
              Verify Email
            </Button>

            <div className="text-center">
              {!canResend && hasResent ? (
                <p className="text-sm text-earth-600">
                  Resend code in {formatTime(timeLeft)}
                </p>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors disabled:opacity-50"
                >
                  {isResending ? "Sending..." : hasResent ? "Resend Code" : "Resend Code"}
                </button>
              )}
            </div>

            <Button onClick={onClose} variant="ghost" size="sm" fullWidth>
              Cancel
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
