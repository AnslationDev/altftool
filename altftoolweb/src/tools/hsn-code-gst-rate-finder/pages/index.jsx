"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw, Search } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/**
 * Indicative GST slabs after the rate rationalisation notified with effect from
 * 22 September 2025 (mainly Nil / 5% / 18%, with a 40% demerit rate and the
 * special 0.25%, 1.5% and 3% rates for precious stones and metals).
 * `code` is the HSN chapter/heading for goods and the SAC heading for services.
 */
const ITEMS = [
  // Food and agriculture
  { name: "Fresh fruits and vegetables (unprocessed)", code: "0701-0810", kind: "Goods", group: "Food & agriculture", rate: 0 },
  { name: "Fresh and pasteurised milk, UHT milk", code: "0401", kind: "Goods", group: "Food & agriculture", rate: 0 },
  { name: "Paneer / chena, pre-packaged and labelled", code: "0406", kind: "Goods", group: "Food & agriculture", rate: 0 },
  { name: "Curd, lassi, buttermilk", code: "0403", kind: "Goods", group: "Food & agriculture", rate: 0 },
  { name: "Eggs in shell, fresh", code: "0407", kind: "Goods", group: "Food & agriculture", rate: 0 },
  { name: "Indian breads - roti, chapati, paratha, khakhra", code: "1905", kind: "Goods", group: "Food & agriculture", rate: 0 },
  { name: "Cereals - wheat, rice, not pre-packaged", code: "1001 / 1006", kind: "Goods", group: "Food & agriculture", rate: 0 },
  { name: "Cereals - wheat, rice, pre-packaged and labelled", code: "1001 / 1006", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Atta, maida, besan, flours (pre-packaged)", code: "1101 / 1106", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Butter, ghee, dairy spreads", code: "0405", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Cheese", code: "0406", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Dry fruits and nuts - almonds, cashew, pistachio", code: "0801 / 0802", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Edible oils - groundnut, mustard, sunflower", code: "1507-1515", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Sugar", code: "1701", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Tea and coffee (not instant)", code: "0901 / 0902", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Biscuits and sweet biscuits", code: "1905", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Pasta, noodles, macaroni", code: "1902", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Cornflakes and breakfast cereals", code: "1904", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Chocolates and cocoa preparations", code: "1806", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Ice cream and edible ice", code: "2105", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Namkeen, bhujia, salted snacks", code: "2106", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Sauces, ketchup, jams, fruit preserves", code: "2007 / 2103", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Packaged drinking and mineral water", code: "2201", kind: "Goods", group: "Food & agriculture", rate: 5 },
  { name: "Aerated / carbonated drinks with added sugar", code: "2202", kind: "Goods", group: "Food & agriculture", rate: 40 },
  { name: "Caffeinated and energy drinks", code: "2202", kind: "Goods", group: "Food & agriculture", rate: 40 },
  { name: "Pan masala", code: "2106", kind: "Goods", group: "Demerit goods", rate: 40 },
  { name: "Cigarettes, cigars, chewing tobacco", code: "2402 / 2403", kind: "Goods", group: "Demerit goods", rate: 40 },

  // Household and personal care
  { name: "Hair oil", code: "3305", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Shampoo", code: "3305", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Toothpaste and tooth powder", code: "3306", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Toothbrush", code: "9603", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Bathing soap and soap bars", code: "3401", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Shaving cream, aftershave lotion", code: "3307", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Talcum powder and face powder", code: "3304", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Detergents and washing powder", code: "3402", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Candles and tapers", code: "3406", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Tableware and kitchenware", code: "3924 / 7323", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Feeding bottles, baby napkins, diapers", code: "3924 / 9619", kind: "Goods", group: "Personal care & household", rate: 5 },
  { name: "Sewing machines and parts", code: "8452", kind: "Goods", group: "Personal care & household", rate: 5 },

  // Health
  { name: "Medicines and drug formulations", code: "3004", kind: "Goods", group: "Health & pharma", rate: 5 },
  { name: "Specified life-saving drugs (notified list)", code: "3004", kind: "Goods", group: "Health & pharma", rate: 0 },
  { name: "Medical devices, surgical instruments", code: "9018", kind: "Goods", group: "Health & pharma", rate: 5 },
  { name: "Diagnostic kits and reagents", code: "3822", kind: "Goods", group: "Health & pharma", rate: 5 },
  { name: "Spectacles and corrective lenses", code: "9003 / 9004", kind: "Goods", group: "Health & pharma", rate: 5 },
  { name: "Thermometers, glucometers, BP monitors", code: "9025 / 9027", kind: "Goods", group: "Health & pharma", rate: 5 },

  // Textiles and footwear
  { name: "Apparel and made-ups up to Rs 2,500 per piece", code: "6101-6217", kind: "Goods", group: "Textiles & footwear", rate: 5 },
  { name: "Apparel and made-ups above Rs 2,500 per piece", code: "6101-6217", kind: "Goods", group: "Textiles & footwear", rate: 18 },
  { name: "Footwear up to Rs 2,500 per pair", code: "6401-6405", kind: "Goods", group: "Textiles & footwear", rate: 5 },
  { name: "Footwear above Rs 2,500 per pair", code: "6401-6405", kind: "Goods", group: "Textiles & footwear", rate: 18 },
  { name: "Cotton, yarn and woven fabrics", code: "5201 / 5205 / 5208", kind: "Goods", group: "Textiles & footwear", rate: 5 },
  { name: "Handbags, trunks and travel luggage", code: "4202", kind: "Goods", group: "Textiles & footwear", rate: 18 },

  // Construction and industrial
  { name: "Cement (Portland, clinker)", code: "2523", kind: "Goods", group: "Construction & industry", rate: 18 },
  { name: "Building bricks and fly-ash bricks", code: "6815 / 6904", kind: "Goods", group: "Construction & industry", rate: 5 },
  { name: "Marble and granite blocks", code: "2515 / 2516", kind: "Goods", group: "Construction & industry", rate: 5 },
  { name: "Iron and steel bars, rods, structures", code: "7213 / 7214 / 7308", kind: "Goods", group: "Construction & industry", rate: 18 },
  { name: "Paints, varnishes and putty", code: "3208 / 3209 / 3214", kind: "Goods", group: "Construction & industry", rate: 18 },
  { name: "Plywood, particle board, MDF", code: "4410 / 4412", kind: "Goods", group: "Construction & industry", rate: 18 },
  { name: "Ceramic tiles and sanitaryware", code: "6907 / 6910", kind: "Goods", group: "Construction & industry", rate: 18 },
  { name: "Furniture - wooden, metal, plastic", code: "9401 / 9403", kind: "Goods", group: "Construction & industry", rate: 18 },

  // Electronics
  { name: "Mobile phones and smartphones", code: "8517", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Laptops, desktops and monitors", code: "8471 / 8528", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Televisions of all screen sizes", code: "8528", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Air conditioners", code: "8415", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Refrigerators and freezers", code: "8418", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Washing machines", code: "8450", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Dishwashers", code: "8422", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Printers, scanners, copiers", code: "8443", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "LED lamps and light fittings", code: "9405", kind: "Goods", group: "Electronics & appliances", rate: 18 },
  { name: "Batteries, power banks, inverters", code: "8507 / 8504", kind: "Goods", group: "Electronics & appliances", rate: 18 },

  // Vehicles
  { name: "Bicycles and bicycle parts", code: "8712 / 8714", kind: "Goods", group: "Vehicles & transport", rate: 5 },
  { name: "Tractors for agricultural use", code: "8701", kind: "Goods", group: "Vehicles & transport", rate: 5 },
  { name: "Electric vehicles (battery powered)", code: "8703", kind: "Goods", group: "Vehicles & transport", rate: 5 },
  { name: "Small cars - petrol up to 1200cc / diesel up to 1500cc and up to 4000 mm", code: "8703", kind: "Goods", group: "Vehicles & transport", rate: 18 },
  { name: "Mid-size cars, SUVs above 1500cc or above 4000 mm", code: "8703", kind: "Goods", group: "Vehicles & transport", rate: 40 },
  { name: "Motorcycles up to 350cc", code: "8711", kind: "Goods", group: "Vehicles & transport", rate: 18 },
  { name: "Motorcycles above 350cc", code: "8711", kind: "Goods", group: "Vehicles & transport", rate: 40 },
  { name: "Three-wheelers and auto rickshaws", code: "8703", kind: "Goods", group: "Vehicles & transport", rate: 18 },
  { name: "Goods transport vehicles and trucks", code: "8704", kind: "Goods", group: "Vehicles & transport", rate: 18 },
  { name: "Auto parts and components (uniform rate)", code: "8708", kind: "Goods", group: "Vehicles & transport", rate: 18 },
  { name: "Yachts and private aircraft", code: "8903 / 8802", kind: "Goods", group: "Demerit goods", rate: 40 },

  // Stationery, books
  { name: "Exercise books and notebooks", code: "4820", kind: "Goods", group: "Stationery & books", rate: 0 },
  { name: "Pencils, crayons, sharpeners, erasers", code: "9609 / 8214 / 4016", kind: "Goods", group: "Stationery & books", rate: 0 },
  { name: "Maps, atlases, globes, charts", code: "4905", kind: "Goods", group: "Stationery & books", rate: 0 },
  { name: "Printed books, newspapers, journals", code: "4901 / 4902", kind: "Goods", group: "Stationery & books", rate: 0 },
  { name: "Paper, paperboard and printing paper", code: "4802", kind: "Goods", group: "Stationery & books", rate: 18 },

  // Precious metals
  { name: "Gold and gold jewellery", code: "7108 / 7113", kind: "Goods", group: "Precious metals & stones", rate: 3 },
  { name: "Silver, platinum and articles thereof", code: "7106 / 7110 / 7114", kind: "Goods", group: "Precious metals & stones", rate: 3 },
  { name: "Rough diamonds and precious stones", code: "7102 / 7103", kind: "Goods", group: "Precious metals & stones", rate: 0.25 },
  { name: "Cut and polished diamonds", code: "7102", kind: "Goods", group: "Precious metals & stones", rate: 1.5 },
  { name: "Imitation jewellery", code: "7117", kind: "Goods", group: "Precious metals & stones", rate: 5 },

  // Services
  { name: "Restaurant service - standalone eatery", code: "9963", kind: "Services", group: "Food & hospitality services", rate: 5, note: "Without input tax credit" },
  { name: "Restaurant inside a hotel with room tariff above Rs 7,500", code: "9963", kind: "Services", group: "Food & hospitality services", rate: 18, note: "With input tax credit" },
  { name: "Hotel accommodation up to Rs 7,500 per night", code: "9963", kind: "Services", group: "Food & hospitality services", rate: 5, note: "Without input tax credit" },
  { name: "Hotel accommodation above Rs 7,500 per night", code: "9963", kind: "Services", group: "Food & hospitality services", rate: 18 },
  { name: "Outdoor catering (non-specified premises)", code: "9963", kind: "Services", group: "Food & hospitality services", rate: 5, note: "Without input tax credit" },
  { name: "Beauty salon, barber, gym, yoga, wellness", code: "9997", kind: "Services", group: "Personal services", rate: 5, note: "Without input tax credit" },
  { name: "Goods transport agency (GTA)", code: "9965", kind: "Services", group: "Transport services", rate: 5, note: "5% without ITC or 18% with ITC" },
  { name: "Air travel - economy class", code: "9964", kind: "Services", group: "Transport services", rate: 5 },
  { name: "Air travel - business and premium class", code: "9964", kind: "Services", group: "Transport services", rate: 18 },
  { name: "Rail travel - AC and first class", code: "9964", kind: "Services", group: "Transport services", rate: 5 },
  { name: "Radio taxi and app-based cab rides", code: "9964", kind: "Services", group: "Transport services", rate: 5 },
  { name: "Courier and express delivery", code: "9968", kind: "Services", group: "Transport services", rate: 18 },
  { name: "Works contract and construction service", code: "9954", kind: "Services", group: "Real estate & construction", rate: 18 },
  { name: "Under-construction affordable housing flat", code: "9954", kind: "Services", group: "Real estate & construction", rate: 1, note: "Without input tax credit" },
  { name: "Under-construction residential flat (other than affordable)", code: "9954", kind: "Services", group: "Real estate & construction", rate: 5, note: "Without input tax credit" },
  { name: "Renting of commercial or immovable property", code: "9972", kind: "Services", group: "Real estate & construction", rate: 18 },
  { name: "Telecom, broadband, DTH services", code: "9984", kind: "Services", group: "Professional & digital", rate: 18 },
  { name: "IT, software and SaaS subscriptions", code: "9973 / 9983", kind: "Services", group: "Professional & digital", rate: 18 },
  { name: "Advertising and marketing services", code: "9983", kind: "Services", group: "Professional & digital", rate: 18 },
  { name: "Chartered accountancy and management consulting", code: "9982", kind: "Services", group: "Professional & digital", rate: 18 },
  { name: "Legal services to a business entity", code: "9982", kind: "Services", group: "Professional & digital", rate: 18, note: "Usually under reverse charge" },
  { name: "Banking, financial and NBFC services", code: "9971", kind: "Services", group: "Professional & digital", rate: 18 },
  { name: "Commission agents and brokerage", code: "9961", kind: "Services", group: "Professional & digital", rate: 18 },
  { name: "Individual life insurance premium", code: "9971", kind: "Services", group: "Insurance", rate: 0 },
  { name: "Individual health insurance premium", code: "9971", kind: "Services", group: "Insurance", rate: 0 },
  { name: "Job work - textiles, leather, hides", code: "9988", kind: "Services", group: "Job work", rate: 5 },
  { name: "Job work - other manufacturing services", code: "9988", kind: "Services", group: "Job work", rate: 18 },
  { name: "Healthcare services by a clinical establishment", code: "9993", kind: "Services", group: "Education & health services", rate: 0 },
  { name: "Education by a recognised institution", code: "9992", kind: "Services", group: "Education & health services", rate: 0 },
  { name: "Private coaching and skill training", code: "9992", kind: "Services", group: "Education & health services", rate: 18 },
  { name: "Cinema tickets up to Rs 100", code: "9996", kind: "Services", group: "Entertainment", rate: 5 },
  { name: "Cinema tickets above Rs 100", code: "9996", kind: "Services", group: "Entertainment", rate: 18 },
  { name: "Online money gaming, casinos, betting, lottery", code: "9996", kind: "Services", group: "Entertainment", rate: 40 },
  { name: "Admission to IPL and similar sporting events", code: "9996", kind: "Services", group: "Entertainment", rate: 40 },
];

const SLABS = [0, 0.25, 1, 1.5, 3, 5, 18, 40];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const rateLabel = (rate) => `${NUM.format(rate)}%`;

/** Split a value into CGST/SGST/IGST for a given slab. */
export function splitGst(amount, rate, { inclusive = false, interState = false } = {}) {
  if (!(amount >= 0) || !(rate >= 0)) return null;
  const taxable = inclusive ? (amount * 100) / (100 + rate) : amount;
  const tax = (taxable * rate) / 100;
  const total = taxable + tax;
  return {
    taxable,
    tax,
    total,
    cgst: interState ? 0 : tax / 2,
    sgst: interState ? 0 : tax / 2,
    igst: interState ? tax : 0,
  };
}

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [slab, setSlab] = useState("All");
  const [selectedName, setSelectedName] = useState(ITEMS[0].name);
  const [amount, setAmount] = useState("10000");
  const [inclusive, setInclusive] = useState(false);
  const [interState, setInterState] = useState(false);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (kind !== "All" && item.kind !== kind) return false;
      if (slab !== "All" && item.rate !== Number(slab)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
      );
    });
  }, [query, kind, slab]);

  const selected = useMemo(
    () => ITEMS.find((item) => item.name === selectedName) ?? ITEMS[0],
    [selectedName],
  );

  const calc = useMemo(() => {
    const value = toNumber(amount);
    if (Number.isNaN(value)) return { error: "Enter a valid amount in rupees." };
    if (value < 0) return { error: "Amount cannot be negative." };
    if (value > 1e13) return { error: "Amount is too large — keep it under 10,00,00,00,00,000." };
    const split = splitGst(value, selected.rate, { inclusive, interState });
    if (!split) return { error: "Enter a valid amount in rupees." };
    return split;
  }, [amount, selected, inclusive, interState]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "HSN / SAC GST lookup",
      `Item: ${selected.name}`,
      `${selected.kind === "Services" ? "SAC" : "HSN"} code: ${selected.code}`,
      `GST rate: ${rateLabel(selected.rate)}${selected.note ? ` (${selected.note})` : ""}`,
      "",
      `${inclusive ? "Amount entered (GST inclusive)" : "Taxable value"}: ${money(toNumber(amount))}`,
      `Taxable value: ${money(calc.taxable)}`,
      interState
        ? `IGST @ ${rateLabel(selected.rate)}: ${money(calc.igst)}`
        : `CGST @ ${rateLabel(selected.rate / 2)}: ${money(calc.cgst)}\nSGST/UTGST @ ${rateLabel(selected.rate / 2)}: ${money(calc.sgst)}`,
      `Total GST: ${money(calc.tax)}`,
      `Invoice total: ${money(calc.total)}`,
    ].join("\n");
  }, [calc, selected, amount, inclusive, interState]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setQuery("");
    setKind("All");
    setSlab("All");
    setSelectedName(ITEMS[0].name);
    setAmount("10000");
    setInclusive(false);
    setInterState(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          GST
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">HSN Code GST Rate Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search {ITEMS.length} common goods and services by name or HSN/SAC code, see the GST slab
          that applies, then split any invoice amount into CGST, SGST or IGST.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="hsn-search">
          Search item, service or HSN/SAC code
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
          <input
            id="hsn-search"
            type="search"
            className={`${INPUT_CLASS} pl-9`}
            placeholder="e.g. cement, 8517, hotel, medicines"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hsn-kind">
              Type
            </label>
            <select
              id="hsn-kind"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option value="All">Goods and services</option>
              <option value="Goods">Goods (HSN)</option>
              <option value="Services">Services (SAC)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hsn-slab">
              GST slab
            </label>
            <select
              id="hsn-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              <option value="All">All slabs</option>
              {SLABS.map((value) => (
                <option key={value} value={String(value)}>
                  {rateLabel(value)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]" aria-live="polite">
          {results.length} {results.length === 1 ? "match" : "matches"}
        </p>

        <div className="mt-2 max-h-80 overflow-y-auto rounded-md border border-[var(--border)]">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[var(--muted-foreground)]">
              Nothing matched. Try a broader word such as “oil”, “car” or “insurance”.
            </p>
          ) : (
            <ul>
              {results.map((item) => {
                const active = item.name === selected.name;
                return (
                  <li key={`${item.name}-${item.code}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedName(item.name)}
                      aria-pressed={active}
                      className={`flex w-full items-start justify-between gap-3 border-b border-[var(--border)] px-3 py-3 text-left transition last:border-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        active ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{item.name}</span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {item.kind === "Services" ? "SAC" : "HSN"} {item.code} · {item.group}
                          {item.note ? ` · ${item.note}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-bold text-[var(--primary)]">
                        {rateLabel(item.rate)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Split an amount at this rate</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hsn-amount">
              Amount (INR)
            </label>
            <input
              id="hsn-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>Options</span>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInclusive((value) => !value)}
                aria-pressed={inclusive}
                className={inclusive ? CHIP_ON : CHIP}
              >
                {inclusive ? "GST inclusive" : "GST exclusive"}
              </button>
              <button
                type="button"
                onClick={() => setInterState((value) => !value)}
                aria-pressed={interState}
                className={interState ? CHIP_ON : CHIP}
              >
                {interState ? "Inter-state (IGST)" : "Intra-state (CGST+SGST)"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                GST rate for {selected.name}
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {rateLabel(selected.rate)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {selected.kind === "Services" ? "SAC" : "HSN"} {selected.code}
                {selected.note ? ` · ${selected.note}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy GST rate and tax split"
                className={GHOST_BTN}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset search and amount" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Taxable value", money(calc.taxable)],
              ...(interState
                ? [[`IGST @ ${rateLabel(selected.rate)}`, money(calc.igst)]]
                : [
                    [`CGST @ ${rateLabel(selected.rate / 2)}`, money(calc.cgst)],
                    [`SGST / UTGST @ ${rateLabel(selected.rate / 2)}`, money(calc.sgst)],
                  ]),
              ["Total GST", money(calc.tax)],
              ["Invoice total", money(calc.total)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Rates reflect the slab structure notified from 22 September 2025 and are
        grouped at chapter/heading level — the exact 8-digit HSN, conditions and any compensation
        cess for your product can differ. Always confirm against the CBIC rate notifications or your
        tax adviser before invoicing.
      </p>
    </main>
  );
}
