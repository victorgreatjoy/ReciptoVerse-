import React, { useEffect } from "react";
import { classNames } from "../../utils/helpers";

export const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const DialogContent = ({ children, className = "" }) => {
  return (
    <div
      className={classNames(
        "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className = "" }) => {
  return <div className={classNames("mb-4", className)}>{children}</div>;
};

export const DialogTitle = ({ children, className = "" }) => {
  return (
    <h2 className={classNames("text-xl font-bold text-gray-900", className)}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ children, className = "" }) => {
  return (
    <p className={classNames("text-sm text-gray-600 mt-2", className)}>
      {children}
    </p>
  );
};
