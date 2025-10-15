import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "../contexts/UserContext";
import { Button, Input, Card, Captcha } from "./ui";
import { showToast } from "../utils/toastUtils";

const AuthModal = ({
  isOpen,
  onClose,
  mode: initialMode = "login",
  onVerificationRequired,
}) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    desiredHandle: "",
    displayName: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const { login, register } = useUser();

  useEffect(() => {
    setMode(initialMode);
    setFormData({
      email: "",
      password: "",
      desiredHandle: "",
      displayName: "",
    });
    setErrors({});
    setCaptchaToken(null);
  }, [initialMode]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "register") {
      if (!formData.desiredHandle.trim()) {
        newErrors.desiredHandle = "Username is required";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.desiredHandle)) {
        newErrors.desiredHandle =
          "Username can only contain letters and numbers";
      }

      // Only require captcha for registration
      if (!captchaToken) {
        newErrors.captcha = "Please complete the reCAPTCHA verification";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔍 Form submitted, mode:", mode);
    console.log("🔍 Form data:", formData);

    // For login, only validate basic fields
    if (mode === "login") {
      if (!formData.email || !formData.password) {
        console.log("🔍 Basic validation failed");
        setErrors({
          email: !formData.email ? "Email is required" : "",
          password: !formData.password ? "Password is required" : "",
        });
        return;
      }
      console.log("🔍 Basic validation passed");
    } else {
      // For registration, validate all fields
      if (!validateForm()) return;
    }

    console.log("🔍 Starting login process...");
    setIsLoading(true);

    try {
      let result;

      if (mode === "login") {
        result = await login(formData.email, formData.password);

        console.log("🔍 Login result:", result);

        // Handle login verification requirement
        if (!result.success && result.requiresVerification) {
          console.log("🔍 Triggering verification from AppContent");
          onVerificationRequired?.(result.email || formData.email);

          showToast.info(
            "Please verify your email to continue",
            "Verification Required"
          );

          return;
        }
      } else {
        result = await register(
          formData.email,
          formData.password,
          formData.desiredHandle,
          formData.displayName || formData.desiredHandle,
          captchaToken
        );
      }

      if (result.success) {
        if (result.requiresVerification) {
          // Show verification screen
          onVerificationRequired?.(formData.email);
          showToast.success(
            "Registration successful! Please check your email for verification code.",
            "Email Sent"
          );
        } else {
          // Normal login/registration success
          showToast.success(
            mode === "login"
              ? "Welcome back!"
              : "Account created successfully!",
            "Success"
          );
          onClose();
        }

        setFormData({
          email: "",
          password: "",
          desiredHandle: "",
          displayName: "",
        });
      } else {
        showToast.error(result.error, "Authentication Error");
      }
    } catch (err) {
      console.error("Auth error:", err);
      showToast.error("Something went wrong. Please try again.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    setCaptchaToken(null);
    setFormData({
      email: "",
      password: "",
      desiredHandle: "",
      displayName: "",
    });
  };

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
    if (errors.captcha) {
      setErrors((prev) => ({
        ...prev,
        captcha: "",
      }));
    }
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    showToast.error(
      "reCAPTCHA verification failed. Please try again.",
      "Verification Error"
    );
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
    setErrors((prev) => ({
      ...prev,
      captcha: "reCAPTCHA has expired. Please verify again.",
    }));
  };

  const benefits = [
    {
      icon: <SparklesIcon className="h-5 w-5" />,
      text: "Turn receipts into valuable NFTs",
    },
    {
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      text: "Earn RECV tokens with every purchase",
    },
    {
      icon: <UserGroupIcon className="h-5 w-5" />,
      text: "Vote on platform decisions",
    },
    {
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      text: "Access exclusive games and rewards",
    },
  ];

  return (
    <>
      {/* Main Auth Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md mx-auto" padding="none">
                {/* Header */}
                <div className="px-6 py-4 border-b border-earth-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-earth-900">
                      {mode === "login"
                        ? "Welcome Back!"
                        : "Join ReceiptoVerse"}
                    </h2>
                    <p className="text-sm text-earth-600 mt-1">
                      {mode === "login"
                        ? "Sign in to your account"
                        : "Create your account to get started"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="p-2"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      error={errors.email}
                      required
                    />

                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      error={errors.password}
                      required
                    />

                    {mode === "register" && (
                      <>
                        <Input
                          label="Username"
                          type="text"
                          name="desiredHandle"
                          value={formData.desiredHandle}
                          onChange={handleInputChange}
                          placeholder="yourusername"
                          error={errors.desiredHandle}
                          helperText="Letters and numbers only"
                          required
                        />

                        <Input
                          label="Display Name"
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          placeholder="Your Display Name"
                          helperText="Optional - how others will see you"
                        />

                        {/* reCAPTCHA for registration */}
                        <div className="mt-4">
                          <Captcha
                            onVerify={handleCaptchaVerify}
                            onError={handleCaptchaError}
                            onExpired={handleCaptchaExpired}
                          />
                          {errors.captcha && (
                            <p className="mt-2 text-sm text-sunset-600 flex items-center">
                              <XMarkIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                              {errors.captcha}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isLoading}
                      className="mt-6"
                    >
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </Button>
                  </form>

                  {/* Switch Mode */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-earth-600">
                      {mode === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={switchMode}
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        {mode === "login" ? "Sign up here" : "Sign in here"}
                      </button>
                    </p>
                  </div>

                  {/* Benefits for Registration */}
                  {mode === "register" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-100"
                    >
                      <h4 className="text-sm font-semibold text-earth-900 mb-3 flex items-center">
                        <SparklesIcon className="h-4 w-4 mr-2 text-primary-500" />
                        What you'll get:
                      </h4>
                      <ul className="space-y-2">
                        {benefits.map((benefit, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="flex items-center text-sm text-earth-700"
                          >
                            <span className="text-primary-500 mr-2">
                              {benefit.icon}
                            </span>
                            {benefit.text}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthModal;
