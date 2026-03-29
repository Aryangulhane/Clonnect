"use client";

import { cn } from "@/lib/utils";

interface ClonnectLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  textClassName?: string;
}

/**
 * Clonnect brand logo — Stylized "C" with handshake icon
 * Based on the brand identity: blue-violet gradient, "Close. Connected."
 */
export function ClonnectLogo({
  size = 40,
  className,
  showText = false,
  showTagline = false,
  textClassName,
}: ClonnectLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="logo-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="logo-grad-hand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
        </defs>

        {/* Outer C shape */}
        <path
          d="M85 25C75 15 62 10 48 12C28 15 13 32 12 52C11 72 23 90 42 97C52 101 62 100 72 96"
          stroke="url(#logo-grad-1)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />

        {/* Inner arc */}
        <path
          d="M78 92C85 85 90 75 90 64C90 48 80 35 66 30"
          stroke="url(#logo-grad-2)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />

        {/* Handshake — simplified two-hand clasp */}
        <g transform="translate(32, 42) scale(0.55)">
          <path
            d="M20 45L35 30L55 35L70 20"
            stroke="url(#logo-grad-hand)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M70 20L85 35L65 50L50 65"
            stroke="url(#logo-grad-hand)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="35" cy="30" r="5" fill="url(#logo-grad-hand)" opacity="0.8" />
          <circle cx="70" cy="20" r="5" fill="url(#logo-grad-hand)" opacity="0.8" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "text-xl font-bold tracking-tight gradient-text",
              textClassName
            )}
          >
            Clonnect
          </span>
          {showTagline && (
            <span className="text-[10px] font-medium text-muted-foreground tracking-wider">
              Close. Connected.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
