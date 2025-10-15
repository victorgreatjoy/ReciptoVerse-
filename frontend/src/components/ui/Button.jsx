import React from "react";
import { motion } from "framer-motion";
import { classNames } from "../../utils/helpers";

const Button = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg",
      secondary:
        "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400 shadow-md hover:shadow-lg",
      accent:
        "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500 shadow-md hover:shadow-lg",
      outline:
        "border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 bg-white",
      ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg",
      success:
        "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-md hover:shadow-lg",
    };

    const sizes = {
      xs: "px-2.5 py-1.5 text-xs",
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-4 py-2 text-base",
      xl: "px-6 py-3 text-base",
    };

    const classes = classNames(
      baseClasses,
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      className
    );

    return (
      <motion.button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            {LeftIcon && <LeftIcon className="mr-2 h-4 w-4" />}
            {children}
            {RightIcon && <RightIcon className="ml-2 h-4 w-4" />}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
