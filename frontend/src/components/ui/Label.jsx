import React from "react";
import { classNames } from "../../utils/helpers";

export const Label = ({ children, htmlFor, className = "" }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={classNames(
        "block text-sm font-medium text-gray-700 mb-1",
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
