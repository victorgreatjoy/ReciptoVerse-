import React from "react";
import { motion } from "framer-motion";
import { classNames } from "../../utils/helpers";

const Card = ({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  rounded = "lg",
  border = false,
  hover = false,
  clickable = false,
  onClick,
  ...props
}) => {
  const baseClasses = "bg-white transition-all duration-200";

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  };

  const hoverClasses = hover ? "hover:shadow-lg hover:-translate-y-1" : "";
  const clickableClasses = clickable ? "cursor-pointer" : "";
  const borderClasses = border ? "border border-earth-200" : "";

  const cardClasses = classNames(
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    roundedClasses[rounded],
    borderClasses,
    hoverClasses,
    clickableClasses,
    className
  );

  const CardComponent = clickable ? motion.div : "div";
  const motionProps = clickable
    ? {
        whileHover: { y: -4, scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Card sub-components
const CardHeader = ({ children, className = "", ...props }) => (
  <div className={classNames("mb-4", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({
  children,
  className = "",
  as: Component = "h3",
  ...props
}) => (
  <Component
    className={classNames(
      "text-lg font-semibold text-earth-900 mb-2",
      className
    )}
    {...props}
  >
    {children}
  </Component>
);

const CardDescription = ({ children, className = "", ...props }) => (
  <p className={classNames("text-earth-600 text-sm", className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={classNames("", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = "", ...props }) => (
  <div
    className={classNames("mt-6 pt-4 border-t border-earth-100", className)}
    {...props}
  >
    {children}
  </div>
);

// Attach sub-components to main Card component
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
