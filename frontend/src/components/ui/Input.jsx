import React, { useState, forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../utils/helpers";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      error,
      success,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      disabled = false,
      required = false,
      fullWidth = true,
      size = "md",
      className = "",
      containerClassName = "",
      name,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleFocus = (e) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setFocused(false);
      onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const baseInputClasses =
      "block w-full rounded-lg border-0 py-1.5 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-earth-400 focus:ring-2 focus:ring-inset disabled:cursor-not-allowed disabled:bg-earth-50 disabled:text-earth-500";

    const stateClasses = {
      default: "text-earth-900 ring-earth-300 focus:ring-primary-600",
      error:
        "text-sunset-900 ring-sunset-300 focus:ring-sunset-500 bg-sunset-50",
      success:
        "text-accent-900 ring-accent-300 focus:ring-accent-500 bg-accent-50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3.5 py-2 text-sm",
      lg: "px-4 py-2.5 text-base",
    };

    const currentState = error ? "error" : success ? "success" : "default";

    const inputClasses = classNames(
      baseInputClasses,
      stateClasses[currentState],
      sizes[size],
      LeftIcon && "pl-10",
      (RightIcon || isPassword) && "pr-10",
      className
    );

    const containerClasses = classNames(
      "relative",
      fullWidth && "w-full",
      containerClassName
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={id}
            className={classNames(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              error
                ? "text-sunset-700"
                : success
                ? "text-accent-700"
                : "text-earth-700"
            )}
          >
            {label}
            {required && <span className="text-sunset-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LeftIcon
                className={classNames(
                  "h-5 w-5 transition-colors duration-200",
                  error
                    ? "text-sunset-400"
                    : success
                    ? "text-accent-400"
                    : focused
                    ? "text-primary-500"
                    : "text-earth-400"
                )}
              />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            name={name}
            id={id}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            {...props}
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {isPassword ? (
              <button
                type="button"
                className="text-earth-400 hover:text-earth-600 focus:outline-none transition-colors duration-200 p-1 h-6 w-6 flex items-center justify-center rounded"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-3 w-3" />
                ) : (
                  <EyeIcon className="h-3 w-3" />
                )}
              </button>
            ) : RightIcon ? (
              <RightIcon
                className={classNames(
                  "h-5 w-5 transition-colors duration-200",
                  error
                    ? "text-sunset-400"
                    : success
                    ? "text-accent-400"
                    : "text-earth-400"
                )}
              />
            ) : error ? (
              <ExclamationCircleIcon className="h-5 w-5 text-sunset-400" />
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {(error || success || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              {error && (
                <p className="text-sm text-sunset-600 flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-accent-600 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </p>
              )}
              {helperText && !error && !success && (
                <p className="text-sm text-earth-500">{helperText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
