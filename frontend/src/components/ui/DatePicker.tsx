import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  required?: boolean;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  disablePast?: boolean;
  footerNote?: string;
  openDirection?: "up" | "down";
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const parseDateStr = (str: string) => {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
};

const formatDateStr = (year: number, month: number, day: number) => {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};

export function DatePicker({
  label,
  value,
  onChange,
  required,
  placeholder = "Select date",
  minYear = 1940,
  maxYear = 2050,
  disablePast = false,
  footerNote,
  openDirection = "up",
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = parseDateStr(value);

  const [viewYear, setViewYear] = useState<number>(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );

  useEffect(() => {
    if (value) {
      const d = parseDateStr(value);
      if (d) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewYear(viewYear - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < maxYear) {
        setViewYear(viewYear + 1);
        setViewMonth(0);
      }
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatDateStr(viewYear, viewMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleToday = () => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    setViewYear(y);
    setViewMonth(m);
    onChange(formatDateStr(y, m, d));
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isTodayDay = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isDayDisabled = (day: number) => {
    if (!disablePast) return false;
    const checkDate = new Date(viewYear, viewMonth, day);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() < today.getTime();
  };

  const displayString = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const popoverPositionClass = openDirection === "up" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div className={`relative block ${className}`} ref={containerRef}>
      {label && <label className="mb-1.5 block text-xs font-semibold text-ink">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition hover:bg-white focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
      >
        <span className={displayString ? "text-ink font-medium" : "text-ink-muted"}>
          {displayString || placeholder}
        </span>
        <Calendar size={16} className="text-ink-muted" />
      </button>

      {required && (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {isOpen && (
        <div className={`absolute left-0 ${popoverPositionClass} z-[100] w-72 rounded-2xl border border-ink/10 bg-white p-4 shadow-2xl backdrop-blur-xl animate-fadeIn`}>
          {/* Header with Month & Year dropdowns */}
          <div className="flex items-center justify-between gap-1 pb-3 border-b border-ink/10">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ink/5 text-ink-soft transition"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="h-8 rounded-lg bg-ink/5 px-2 text-xs font-semibold text-ink outline-none cursor-pointer hover:bg-ink/10"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="h-8 rounded-lg bg-ink/5 px-2 text-xs font-semibold text-ink outline-none cursor-pointer hover:bg-ink/10"
              >
                {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={viewYear >= maxYear && viewMonth >= 11}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ink/5 text-ink-soft disabled:opacity-30 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="mt-3 grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[11px] font-bold text-ink-muted uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const active = isSelected(dayNum);
              const isToday = isTodayDay(dayNum);
              const disabled = isDayDisabled(dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`grid h-8 w-8 place-items-center rounded-xl text-xs transition ${
                    active
                      ? "bg-neon text-ink font-extrabold shadow-sm shadow-neon/40"
                      : isToday
                      ? "border border-neon-dark text-ink font-bold bg-neon/10"
                      : disabled
                      ? "text-ink-muted/40 cursor-not-allowed"
                      : "text-ink font-medium hover:bg-ink/5"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer controls */}
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2 text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="font-bold text-neon-dark hover:underline"
            >
              Today
            </button>
            {footerNote && <span className="text-[10px] text-ink-muted">{footerNote}</span>}
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="font-semibold text-ink-soft hover:text-ink hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
