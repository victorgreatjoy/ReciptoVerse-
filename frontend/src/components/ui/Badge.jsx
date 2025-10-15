import React from "react";
import { classNames } from "../../utils/helpers";

const Badge = ({
  children,
  variant = "default",
  size = "sm",
  rounded = true,
  className = "",
  ...props
}) => {
  const variants = {
    default: "bg-earth-100 text-earth-800",
    primary: "bg-primary-100 text-primary-800",
    secondary: "bg-secondary-100 text-secondary-800",
    accent: "bg-accent-100 text-accent-800",
    success: "bg-accent-100 text-accent-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-sunset-100 text-sunset-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const classes = classNames(
    "inline-flex items-center font-medium",
    variants[variant],
    sizes[size],
    rounded ? "rounded-full" : "rounded",
    className
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
