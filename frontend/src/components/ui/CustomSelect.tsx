import React, { useState, useRef, useEffect } from "react";
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
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false,
  className = "",
  buttonClassName = "",
  label,
  size = "md",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options into standard CustomSelectOption objects
  const normalizedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

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
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 240px space below and more space above, open upward
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const sizeClasses = {
    sm: "h-8 px-2.5 text-[11px]",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-4 text-sm",
  }[size];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
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
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 max-h-72 overflow-y-auto rounded-xl bg-white p-1.5 shadow-2xl border border-ink/10 animate-fadeIn scrollbar-thin ${
            openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
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
      )}
    </div>
  );
}
