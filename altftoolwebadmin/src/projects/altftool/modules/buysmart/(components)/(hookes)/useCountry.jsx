import { useMemo } from "react";
import CountryFlag from "react-country-flag";

const countries = [
  { code: "ALL", name: "All Country" },
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
];

export function useCountry(form, setForm) {

  const countryOptions = useMemo(() => {
    return countries.map((c) => ({
      value: c.code,
      label: (
        <div className="flex items-center gap-2">
          <CountryFlag countryCode={c.code} svg style={{ width: "1.2em" }} />
          <span>{c.name}</span>
        </div>
      ),
    }));
  }, []);

  const handleCountryChange = (option) => {
    setForm((prev) => ({
      ...prev,
      country: option?.value || "",
    }));
  };

  const selectedCountry =
    countryOptions.find((opt) => opt.value === form.country) || null;

  return {
    countryOptions,
    selectedCountry,
    handleCountryChange,
  };
}