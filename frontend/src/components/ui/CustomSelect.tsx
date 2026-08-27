import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: (string | CustomSelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  direction?: "auto" | "up" | "down";
  usePortal?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false,
  className = "",
  buttonClassName = "",
  labelClassName = "",
  label,
  size = "md",
  direction = "auto",
  usePortal = true,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(direction === "up");
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Normalize options into standard CustomSelectOption objects
  const normalizedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Update fixed position on open or scroll
  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const isUp = direction === "up" || (direction === "auto" && window.innerHeight - rect.bottom < 240 && rect.top > 200);
    setOpenUpward(isUp);

    const style: React.CSSProperties = {
      position: "fixed",
      width: Math.max(rect.width, 140),
      left: rect.left,
      zIndex: 9999,
    };

    if (isUp) {
      style.bottom = window.innerHeight - rect.top + 6;
      style.maxHeight = Math.min(280, rect.top - 12);
    } else {
      style.top = rect.bottom + 6;
      style.maxHeight = Math.min(280, window.innerHeight - rect.bottom - 12);
    }

    setMenuStyle(style);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen, direction]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const sizeClasses = {
    sm: "h-8 px-2.5 text-[11px]",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-4 text-sm",
  }[size];

  const menuContent = isOpen && (
    <div
      style={usePortal ? menuStyle : undefined}
      className={`${
        usePortal
          ? "fixed z-[9999]"
          : `absolute left-0 right-0 z-50 ${openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"}`
      } max-h-72 overflow-y-auto rounded-xl bg-white p-1.5 shadow-2xl border border-ink/10 animate-fadeIn scrollbar-thin`}
    >
      {normalizedOptions.length === 0 ? (
        <div className="p-3 text-center text-xs text-ink-muted">No options available</div>
      ) : (
        normalizedOptions.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-left text-xs transition ${
                isSelected
                  ? "bg-neon/15 font-bold text-ink"
                  : "text-ink-soft hover:bg-slate-100/90 hover:text-ink font-medium"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {opt.icon}
                <div>
                  <div className="truncate">{opt.label}</div>
                  {opt.description && (
                    <div className="text-[10px] text-ink-muted font-normal truncate">{opt.description}</div>
                  )}
                </div>
              </div>
              {isSelected && <Check size={14} className="text-ink shrink-0" />}
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <span className={labelClassName || "block text-xs font-medium text-ink-soft mb-1.5"}>{label}</span>
      )}

      {/* Select Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border border-ink/15 bg-white font-medium text-ink shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neon/60 hover:border-ink/30 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : <span className="text-ink-muted">{placeholder}</span>}
        </span>
        <ChevronDown
          size={15}
          className={`text-ink-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-ink" : ""}`}
        />
      </button>

      {/* Options Popup Menu */}
      {usePortal && isMounted ? createPortal(menuContent, document.body) : menuContent}
    </div>
  );
}
