import React from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getCountryFlagIcon } from "@/components/ui/CountryFlags";
import { COUNTRIES } from "@/lib/locationData";

interface PhoneInputProps {
  country: string;
  onCountryChange: (countryCode: string) => void;
  phone: string;
  onPhoneChange: (phoneValue: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  required = true,
  label = "Phone Number *",
  placeholder = "(555) 019-2831",
  className = "",
}: PhoneInputProps) {
  const currentCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];

  // Country Code Dropdown Options
  const countryCodeOptions = COUNTRIES.map((c) => ({
    value: c.code,
    label: `${c.dialCode}`,
    description: c.name,
    icon: getCountryFlagIcon(c.code),
  }));

  return (
    <div className={`w-full ${className}`}>
      {label && <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>}
      <div className="flex items-center gap-2">
        {/* Country Code Dropdown with Flag */}
        <div className="w-32 shrink-0">
          <CustomSelect
            options={countryCodeOptions}
            value={currentCountry.code}
            onChange={(selectedCode) => {
              onCountryChange(selectedCode);
            }}
          />
        </div>

        {/* Phone Digits Input */}
        <input
          type="tel"
          required={required}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-xl border border-ink/10 bg-white/70 px-4 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/40 font-medium"
        />
      </div>
    </div>
  );
}
