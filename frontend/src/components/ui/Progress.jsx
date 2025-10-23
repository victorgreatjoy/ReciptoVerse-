import React from "react";
import { classNames } from "../../utils/helpers";

export const Progress = ({ value = 0, className = "" }) => {
  return (
    <div
      className={classNames("w-full bg-gray-200 rounded-full h-2.5", className)}
    >
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export default Progress;
