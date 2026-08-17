import React from "react";
import { cn } from "../../lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-brand-800 text-white hover:bg-brand-900",
  accent: "bg-gold-500 text-gray-900 hover:bg-gold-600",
  outline:
    "border border-white/70 text-white hover:bg-white hover:text-brand-800",
  ghost: "border border-gray-200 text-gray-800 hover:bg-gray-100",
  light: "bg-white text-brand-800 hover:bg-gray-100",
};

const sizes = {
  sm: "h-9 px-4",
  md: "h-10 px-5",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
