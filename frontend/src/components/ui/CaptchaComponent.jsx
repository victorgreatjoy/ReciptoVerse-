import React, { useRef, useCallback } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const CaptchaComponent = React.forwardRef(
  (
    {
      onVerify,
      onError,
      onExpired,
      size = "normal",
      theme = "light",
      className = "",
      siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    },
    ref
  ) => {
    const recaptchaRef = useRef(null);

    const handleChange = useCallback(
      (token) => {
        if (token) {
          onVerify?.(token);
        } else {
          onExpired?.();
        }
      },
      [onVerify, onExpired]
    );

    const handleError = useCallback(() => {
      onError?.("reCAPTCHA verification failed");
    }, [onError]);

    const resetCaptcha = useCallback(() => {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }, []);

    const executeCaptcha = useCallback(() => {
      if (recaptchaRef.current) {
        return recaptchaRef.current.executeAsync();
      }
      return null;
    }, []);

    // Expose methods to parent components
    React.useImperativeHandle(
      ref,
      () => ({
        reset: resetCaptcha,
        execute: executeCaptcha,
      }),
      [resetCaptcha, executeCaptcha]
    );

    if (!siteKey) {
      console.warn("reCAPTCHA site key not found in environment variables");
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ reCAPTCHA is not configured. Please set VITE_RECAPTCHA_SITE_KEY
            in your environment.
          </p>
        </div>
      );
    }

    return (
      <div className={`flex justify-center ${className}`}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={handleChange}
          onError={handleError}
          onExpired={onExpired}
          size={size}
          theme={theme}
        />
      </div>
    );
  }
);

CaptchaComponent.displayName = "CaptchaComponent";

export default CaptchaComponent;
