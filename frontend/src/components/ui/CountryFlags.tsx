import React from "react";

export function USAFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`rounded-sm shrink-0 object-cover shadow-xs ${className}`} viewBox="0 0 640 480">
      <path fill="#bd3d44" d="M0 0h640v480H0z"/>
      <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"/>
      <path fill="#192f5d" d="M0 0h256v258.5H0z"/>
      <g fill="#fff">
        <circle cx="25" cy="23" r="8"/><circle cx="75" cy="23" r="8"/><circle cx="125" cy="23" r="8"/><circle cx="175" cy="23" r="8"/><circle cx="225" cy="23" r="8"/>
        <circle cx="50" cy="55" r="8"/><circle cx="100" cy="55" r="8"/><circle cx="150" cy="55" r="8"/><circle cx="200" cy="55" r="8"/>
        <circle cx="25" cy="87" r="8"/><circle cx="75" cy="87" r="8"/><circle cx="125" cy="87" r="8"/><circle cx="175" cy="87" r="8"/><circle cx="225" cy="87" r="8"/>
        <circle cx="50" cy="119" r="8"/><circle cx="100" cy="119" r="8"/><circle cx="150" cy="119" r="8"/><circle cx="200" cy="119" r="8"/>
        <circle cx="25" cy="151" r="8"/><circle cx="75" cy="151" r="8"/><circle cx="125" cy="151" r="8"/><circle cx="175" cy="151" r="8"/><circle cx="225" cy="151" r="8"/>
        <circle cx="50" cy="183" r="8"/><circle cx="100" cy="183" r="8"/><circle cx="150" cy="183" r="8"/><circle cx="200" cy="183" r="8"/>
        <circle cx="25" cy="215" r="8"/><circle cx="75" cy="215" r="8"/><circle cx="125" cy="215" r="8"/><circle cx="175" cy="215" r="8"/><circle cx="225" cy="215" r="8"/>
      </g>
    </svg>
  );
}

export function CanadaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`rounded-sm shrink-0 object-cover shadow-xs ${className}`} viewBox="0 0 640 480">
      <path fill="#ff0000" d="M0 0h160v480H0zm480 0h160v480H480z"/>
      <path fill="#fff" d="M160 0h320v480H160z"/>
      <path fill="#ff0000" d="m320 72 26 53 58-15-21 55 53 26-45 38 18 57-56-18-33 49-33-49-56 18 18-57-45-38 53-26-21-55 58 15z"/>
    </svg>
  );
}

export function IndiaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`rounded-sm shrink-0 object-cover shadow-xs ${className}`} viewBox="0 0 640 480">
      <path fill="#f93" d="M0 0h640v160H0z"/>
      <path fill="#fff" d="M0 160h640v160H0z"/>
      <path fill="#128807" d="M0 320h640v160H0z"/>
      <circle cx="320" cy="240" r="56" fill="none" stroke="#000080" strokeWidth="8"/>
      <circle cx="320" cy="240" r="10" fill="#000080"/>
      <g stroke="#000080" strokeWidth="4">
        <path d="M320 184v112M264 240h112M280 200l80 80M280 280l80-80"/>
      </g>
    </svg>
  );
}

export function getCountryFlagIcon(codeOrName: string) {
  const c = (codeOrName || "").trim().toUpperCase();
  if (c === "US" || c === "USA" || c.includes("UNITED STATES")) return <USAFlag />;
  if (c === "CA" || c === "CAN" || c.includes("CANADA")) return <CanadaFlag />;
  if (c === "IN" || c === "IND" || c.includes("INDIA")) return <IndiaFlag />;
  return null;
}
