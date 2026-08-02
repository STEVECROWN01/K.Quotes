"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { COUNTRIES, findCountry, type Country } from "@/lib/countries";

interface Props {
  value: string;
  onChange: (countryName: string) => void;
  placeholder?: string;
}

/**
 * CountrySelect — custom dropdown with flag images.
 * Native <select> can't render emoji flags on Linux, so we build
 * a custom dropdown using flagcdn.com images.
 */
export function CountrySelect({ value, onChange, placeholder = "Select a country" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedCountry = value ? findCountry(value) : null;

  const filtered = search
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  const handleSelect = (country: Country) => {
    onChange(country.name);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="k-input flex items-center justify-between text-left"
        style={{ cursor: "pointer" }}
      >
        <span className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <img
                src={`https://flagcdn.com/20x15/${selectedCountry.code.toLowerCase()}.png`}
                width={20}
                height={15}
                alt={selectedCountry.code}
                style={{ display: "block", borderRadius: 2, flexShrink: 0 }}
              />
              <span className="text-sm text-[#000028]">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-sm text-[#9CA3AF]">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E5E7EB] shadow-lg max-h-64 overflow-auto"
          style={{ borderRadius: "var(--radius)" }}
        >
          {/* Search input */}
          <div className="sticky top-0 bg-white border-b border-[#E5E7EB] p-2">
            <input
              type="text"
              autoFocus
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-[#E5E7EB] focus:border-[#D4AF37] focus:outline-none"
              style={{ borderRadius: "var(--radius)" }}
            />
          </div>

          {/* Country list */}
          <div className="py-1">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#FBF6E0] transition-colors ${
                  value === c.name ? "bg-[#FBF6E0]" : ""
                }`}
              >
                <img
                  src={`https://flagcdn.com/20x15/${c.code.toLowerCase()}.png`}
                  width={20}
                  height={15}
                  alt={c.code}
                  style={{ display: "block", borderRadius: 2, flexShrink: 0 }}
                />
                <span className="text-sm text-[#000028] flex-1">{c.name}</span>
                {value === c.name && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-[#6B7280] italic">No country found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
