import React from "react";
import { classNames } from "../../utils/helpers";

export const Slider = ({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = "",
}) => {
  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange([parseInt(e.target.value)]);
    }
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      disabled={disabled}
      className={classNames(
        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
        "slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4",
        "slider-thumb:bg-blue-600 slider-thumb:rounded-full slider-thumb:cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        background: `linear-gradient(to right, #2563eb ${
          ((value[0] - min) / (max - min)) * 100
        }%, #e5e7eb ${((value[0] - min) / (max - min)) * 100}%)`,
      }}
    />
  );
};

export default Slider;
