import React from "react";
import { classNames } from "../../utils/helpers";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
  text,
  overlay = false,
  ...props
}) => {
  const sizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colors = {
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    accent: "text-accent-500",
    white: "text-white",
    earth: "text-earth-500",
    sunset: "text-sunset-500",
  };

  const spinnerClasses = classNames(
    "animate-spin",
    sizes[size],
    colors[color],
    className
  );

  const Spinner = () => (
    <svg
      className={spinnerClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner />
          {text && (
            <p className="mt-4 text-sm text-earth-600 font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center space-x-3">
        <Spinner />
        <span className="text-sm text-earth-600 font-medium">{text}</span>
      </div>
    );
  }

  return <Spinner />;
};

// Skeleton loader components
const Skeleton = ({
  className = "",
  height = "h-4",
  width = "w-full",
  rounded = "rounded",
  animation = true,
}) => {
  const skeletonClasses = classNames(
    "bg-earth-200",
    height,
    width,
    rounded,
    animation && "animate-pulse",
    className
  );

  return <div className={skeletonClasses} />;
};

const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={classNames("space-y-3", className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} width={index === lines - 1 ? "w-3/4" : "w-full"} />
    ))}
  </div>
);

const SkeletonCard = ({ className = "" }) => (
  <div className={classNames("p-6 bg-white rounded-lg shadow-md", className)}>
    <div className="space-y-4">
      <Skeleton height="h-6" width="w-1/2" />
      <SkeletonText lines={2} />
      <div className="flex space-x-3">
        <Skeleton height="h-8" width="w-20" rounded="rounded-md" />
        <Skeleton height="h-8" width="w-20" rounded="rounded-md" />
      </div>
    </div>
  </div>
);

// Add sub-components to LoadingSpinner
LoadingSpinner.Skeleton = Skeleton;
LoadingSpinner.SkeletonText = SkeletonText;
LoadingSpinner.SkeletonCard = SkeletonCard;

export default LoadingSpinner;
