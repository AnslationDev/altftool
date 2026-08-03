// src/app/tradeon/lib/outlookStocks.js
// Standalone universe of Indian NSE stocks that have a weekly outlook, grouped by
// sector. Kept independent of INSTRUMENTS (which powers the live market tape) so
// the outlook directory can scale to hundreds of names without flooding the rest
// of the app. Each entry:
//   symbol  — the NSE ticker (also the Yahoo ".NS" root and the /outlook/<symbol> slug)
//   name    — display name
//   sector  — one of OUTLOOK_SECTORS
//   domain  — official-logo domain (Brandfetch CDN key); monogram fallback on miss
//   base    — approx INR price, only used for the simulated fallback before/if the
//             live Yahoo fetch resolves (real data overrides it)
// To add a stock: append a row with the correct NSE ticker. To add a sector:
// add it to OUTLOOK_SECTORS and tag stocks with it. Everything else is derived.

// Display order for sector sections + filter chips.
export const OUTLOOK_SECTORS = [
  "Banking",
  "Financial Services",
  "IT",
  "FMCG",
  "Consumer & Retail",
  "Auto",
  "Pharma",
  "Healthcare",
  "Metal & Mining",
  "Energy & Power",
  "Oil & Gas",
  "Chemicals",
  "Cement",
  "Infrastructure",
  "Realty",
  "Telecom",
  "PSU",
];

export const OUTLOOK_STOCKS = [
  // ---- Banking ----
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", domain: "hdfcbank.com", base: 1660 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", domain: "icicibank.com", base: 1180 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", domain: "sbi.co.in", base: 825 },
  { symbol: "AXISBANK", name: "Axis Bank", sector: "Banking", domain: "axisbank.com", base: 1180 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", domain: "kotak.com", base: 1800 },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", sector: "Banking", domain: "indusind.com", base: 1000 },
  { symbol: "AUBANK", name: "AU Small Finance Bank", sector: "Banking", domain: "aubank.in", base: 650 },
  { symbol: "BANDHANBNK", name: "Bandhan Bank", sector: "Banking", domain: "bandhanbank.com", base: 185 },
  { symbol: "FEDERALBNK", name: "Federal Bank", sector: "Banking", domain: "federalbank.co.in", base: 205 },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank", sector: "Banking", domain: "idfcfirstbank.com", base: 72 },
  { symbol: "RBLBANK", name: "RBL Bank", sector: "Banking", domain: "rblbank.com", base: 250 },

  // ---- Financial Services ----
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Financial Services", domain: "bajajfinance.in", base: 7200 },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv", sector: "Financial Services", domain: "bajajfinserv.in", base: 1650 },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance", sector: "Financial Services", domain: "hdfclife.com", base: 620 },
  { symbol: "SBILIFE", name: "SBI Life Insurance", sector: "Financial Services", domain: "sbilife.co.in", base: 1550 },
  { symbol: "ICICIPRULI", name: "ICICI Prudential Life", sector: "Financial Services", domain: "iciciprulife.com", base: 640 },
  { symbol: "ICICIGI", name: "ICICI Lombard", sector: "Financial Services", domain: "icicilombard.com", base: 1800 },
  { symbol: "SBICARD", name: "SBI Cards & Payment", sector: "Financial Services", domain: "sbicard.com", base: 720 },
  { symbol: "CHOLAFIN", name: "Cholamandalam Invest", sector: "Financial Services", domain: "cholamandalam.com", base: 1450 },
  { symbol: "MUTHOOTFIN", name: "Muthoot Finance", sector: "Financial Services", domain: "muthootfinance.com", base: 1900 },
  { symbol: "ABCAPITAL", name: "Aditya Birla Capital", sector: "Financial Services", domain: "adityabirlacapital.com", base: 210 },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance", sector: "Financial Services", domain: "shriramfinance.in", base: 3100 },
  { symbol: "HDFCAMC", name: "HDFC Asset Management", sector: "Financial Services", domain: "hdfcfund.com", base: 4300 },

  // ---- IT ----
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", domain: "tcs.com", base: 3850 },
  { symbol: "INFY", name: "Infosys", sector: "IT", domain: "infosys.com", base: 1650 },
  { symbol: "HCLTECH", name: "HCL Technologies", sector: "IT", domain: "hcltech.com", base: 1420 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", domain: "wipro.com", base: 470 },
  { symbol: "TECHM", name: "Tech Mahindra", sector: "IT", domain: "techmahindra.com", base: 1550 },
  { symbol: "LTIM", name: "LTIMindtree", sector: "IT", domain: "ltimindtree.com", base: 5400 },
  { symbol: "PERSISTENT", name: "Persistent Systems", sector: "IT", domain: "persistent.com", base: 5600 },
  { symbol: "COFORGE", name: "Coforge", sector: "IT", domain: "coforge.com", base: 5800 },
  { symbol: "MPHASIS", name: "Mphasis", sector: "IT", domain: "mphasis.com", base: 2700 },
  { symbol: "LTTS", name: "L&T Technology Services", sector: "IT", domain: "ltts.com", base: 5200 },

  // ---- FMCG ----
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", domain: "hul.co.in", base: 2450 },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", domain: "itcportal.com", base: 430 },
  { symbol: "NESTLEIND", name: "Nestle India", sector: "FMCG", domain: "nestle.in", base: 2500 },
  { symbol: "VBL", name: "Varun Beverages", sector: "FMCG", domain: "varunbeverages.com", base: 620 },
  { symbol: "BRITANNIA", name: "Britannia Industries", sector: "FMCG", domain: "britannia.co.in", base: 5300 },
  { symbol: "DABUR", name: "Dabur India", sector: "FMCG", domain: "dabur.com", base: 620 },
  { symbol: "GODREJCP", name: "Godrej Consumer Products", sector: "FMCG", domain: "godrejcp.com", base: 1250 },
  { symbol: "MARICO", name: "Marico", sector: "FMCG", domain: "marico.com", base: 650 },
  { symbol: "COLPAL", name: "Colgate-Palmolive India", sector: "FMCG", domain: "colgate.com", base: 2750 },
  { symbol: "TATACONSUM", name: "Tata Consumer Products", sector: "FMCG", domain: "tataconsumer.com", base: 1100 },
  { symbol: "BALRAMCHIN", name: "Balrampur Chini Mills", sector: "FMCG", domain: "balrampurchini.com", base: 600 },

  // ---- Consumer & Retail ----
  { symbol: "TITAN", name: "Titan Company", sector: "Consumer & Retail", domain: "titancompany.in", base: 3400 },
  { symbol: "TRENT", name: "Trent", sector: "Consumer & Retail", domain: "trentlimited.com", base: 6800 },
  { symbol: "DMART", name: "Avenue Supermarts", sector: "Consumer & Retail", domain: "dmart.in", base: 4100 },
  { symbol: "HAVELLS", name: "Havells India", sector: "Consumer & Retail", domain: "havells.com", base: 1700 },
  { symbol: "VOLTAS", name: "Voltas", sector: "Consumer & Retail", domain: "voltas.com", base: 1450 },
  { symbol: "DIXON", name: "Dixon Technologies", sector: "Consumer & Retail", domain: "dixoninfo.com", base: 12000 },
  { symbol: "BATAINDIA", name: "Bata India", sector: "Consumer & Retail", domain: "bata.in", base: 1350 },
  { symbol: "PAGEIND", name: "Page Industries", sector: "Consumer & Retail", domain: "pageind.com", base: 42000 },
  { symbol: "CROMPTON", name: "Crompton Greaves Consumer", sector: "Consumer & Retail", domain: "crompton.co.in", base: 380 },

  // ---- Auto ----
  { symbol: "MARUTI", name: "Maruti Suzuki India", sector: "Auto", domain: "marutisuzuki.com", base: 12500 },
  { symbol: "M&M", name: "Mahindra & Mahindra", sector: "Auto", domain: "mahindra.com", base: 2900 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", domain: "tatamotors.com", base: 980 },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", sector: "Auto", domain: "bajajauto.com", base: 9500 },
  { symbol: "EICHERMOT", name: "Eicher Motors", sector: "Auto", domain: "eichermotors.com", base: 4900 },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp", sector: "Auto", domain: "heromotocorp.com", base: 4700 },
  { symbol: "TVSMOTOR", name: "TVS Motor Company", sector: "Auto", domain: "tvsmotor.com", base: 2500 },
  { symbol: "ASHOKLEY", name: "Ashok Leyland", sector: "Auto", domain: "ashokleyland.com", base: 230 },
  { symbol: "BOSCHLTD", name: "Bosch", sector: "Auto", domain: "bosch.in", base: 34000 },
  { symbol: "MOTHERSON", name: "Samvardhana Motherson", sector: "Auto", domain: "motherson.com", base: 165 },
  { symbol: "BALKRISIND", name: "Balkrishna Industries", sector: "Auto", domain: "bkt-tires.com", base: 2900 },
  { symbol: "APOLLOTYRE", name: "Apollo Tyres", sector: "Auto", domain: "apollotyres.com", base: 480 },

  // ---- Pharma ----
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", domain: "sunpharma.com", base: 1500 },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", sector: "Pharma", domain: "drreddys.com", base: 1300 },
  { symbol: "CIPLA", name: "Cipla", sector: "Pharma", domain: "cipla.com", base: 1480 },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", sector: "Pharma", domain: "divislabs.com", base: 5200 },
  { symbol: "LUPIN", name: "Lupin", sector: "Pharma", domain: "lupin.com", base: 1650 },
  { symbol: "AUROPHARMA", name: "Aurobindo Pharma", sector: "Pharma", domain: "aurobindo.com", base: 1250 },
  { symbol: "ALKEM", name: "Alkem Laboratories", sector: "Pharma", domain: "alkemlabs.com", base: 5200 },
  { symbol: "TORNTPHARM", name: "Torrent Pharmaceuticals", sector: "Pharma", domain: "torrentpharma.com", base: 3200 },
  { symbol: "ZYDUSLIFE", name: "Zydus Lifesciences", sector: "Pharma", domain: "zyduslife.com", base: 1000 },
  { symbol: "MANKIND", name: "Mankind Pharma", sector: "Pharma", domain: "mankindpharma.com", base: 2400 },
  { symbol: "BIOCON", name: "Biocon", sector: "Pharma", domain: "biocon.com", base: 350 },
  { symbol: "GLENMARK", name: "Glenmark Pharmaceuticals", sector: "Pharma", domain: "glenmarkpharma.com", base: 1500 },

  // ---- Healthcare ----
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", sector: "Healthcare", domain: "apollohospitals.com", base: 6800 },
  { symbol: "MAXHEALTH", name: "Max Healthcare", sector: "Healthcare", domain: "maxhealthcare.in", base: 1000 },
  { symbol: "FORTIS", name: "Fortis Healthcare", sector: "Healthcare", domain: "fortishealthcare.com", base: 650 },
  { symbol: "LALPATHLAB", name: "Dr. Lal PathLabs", sector: "Healthcare", domain: "lalpathlabs.com", base: 3000 },
  { symbol: "METROPOLIS", name: "Metropolis Healthcare", sector: "Healthcare", domain: "metropolisindia.com", base: 2100 },
  { symbol: "SYNGENE", name: "Syngene International", sector: "Healthcare", domain: "syngeneintl.com", base: 850 },

  // ---- Metal & Mining ----
  { symbol: "TATASTEEL", name: "Tata Steel", sector: "Metal & Mining", domain: "tatasteel.com", base: 160 },
  { symbol: "JSWSTEEL", name: "JSW Steel", sector: "Metal & Mining", domain: "jsw.in", base: 950 },
  { symbol: "HINDALCO", name: "Hindalco Industries", sector: "Metal & Mining", domain: "hindalco.com", base: 680 },
  { symbol: "VEDL", name: "Vedanta", sector: "Metal & Mining", domain: "vedantalimited.com", base: 450 },
  { symbol: "JINDALSTEL", name: "Jindal Steel & Power", sector: "Metal & Mining", domain: "jindalsteelpower.com", base: 950 },
  { symbol: "HINDZINC", name: "Hindustan Zinc", sector: "Metal & Mining", domain: "hzlindia.com", base: 500 },
  { symbol: "APLAPOLLO", name: "APL Apollo Tubes", sector: "Metal & Mining", domain: "aplapollo.com", base: 1600 },
  { symbol: "JSL", name: "Jindal Stainless", sector: "Metal & Mining", domain: "jindalstainless.com", base: 700 },

  // ---- Energy & Power ----
  { symbol: "TATAPOWER", name: "Tata Power", sector: "Energy & Power", domain: "tatapower.com", base: 420 },
  { symbol: "ADANIGREEN", name: "Adani Green Energy", sector: "Energy & Power", domain: "adanigreenenergy.com", base: 1050 },
  { symbol: "ADANIENSOL", name: "Adani Energy Solutions", sector: "Energy & Power", domain: "adani.com", base: 900 },
  { symbol: "JSWENERGY", name: "JSW Energy", sector: "Energy & Power", domain: "jsw.in", base: 620 },
  { symbol: "TORNTPOWER", name: "Torrent Power", sector: "Energy & Power", domain: "torrentpower.com", base: 1650 },
  { symbol: "ADANIPOWER", name: "Adani Power", sector: "Energy & Power", domain: "adanipower.com", base: 600 },

  // ---- Oil & Gas ----
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Oil & Gas", domain: "ril.com", base: 1400 },
  { symbol: "PETRONET", name: "Petronet LNG", sector: "Oil & Gas", domain: "petronetlng.in", base: 320 },
  { symbol: "IGL", name: "Indraprastha Gas", sector: "Oil & Gas", domain: "iglonline.net", base: 450 },
  { symbol: "GUJGASLTD", name: "Gujarat Gas", sector: "Oil & Gas", domain: "gujaratgas.com", base: 550 },
  { symbol: "MGL", name: "Mahanagar Gas", sector: "Oil & Gas", domain: "mahanagargas.com", base: 1500 },

  // ---- Chemicals ----
  { symbol: "PIDILITIND", name: "Pidilite Industries", sector: "Chemicals", domain: "pidilite.com", base: 3000 },
  { symbol: "SRF", name: "SRF", sector: "Chemicals", domain: "srf.com", base: 2400 },
  { symbol: "UPL", name: "UPL", sector: "Chemicals", domain: "upl-ltd.com", base: 580 },
  { symbol: "AARTIIND", name: "Aarti Industries", sector: "Chemicals", domain: "aartiindustries.com", base: 640 },
  { symbol: "ATUL", name: "Atul", sector: "Chemicals", domain: "atul.co.in", base: 7000 },
  { symbol: "DEEPAKNTR", name: "Deepak Nitrite", sector: "Chemicals", domain: "deepaknitrite.com", base: 2500 },
  { symbol: "TATACHEM", name: "Tata Chemicals", sector: "Chemicals", domain: "tatachemicals.com", base: 1050 },
  { symbol: "NAVINFLUOR", name: "Navin Fluorine", sector: "Chemicals", domain: "navinfluorine.com", base: 3400 },
  { symbol: "PIIND", name: "PI Industries", sector: "Chemicals", domain: "piindustries.com", base: 4000 },
  { symbol: "ASIANPAINT", name: "Asian Paints", sector: "Chemicals", domain: "asianpaints.com", base: 2900 },
  { symbol: "BERGEPAINT", name: "Berger Paints India", sector: "Chemicals", domain: "bergerpaints.com", base: 560 },

  // ---- Cement ----
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", sector: "Cement", domain: "ultratechcement.com", base: 11500 },
  { symbol: "GRASIM", name: "Grasim Industries", sector: "Cement", domain: "grasim.com", base: 2600 },
  { symbol: "AMBUJACEM", name: "Ambuja Cements", sector: "Cement", domain: "ambujacement.com", base: 620 },
  { symbol: "ACC", name: "ACC", sector: "Cement", domain: "acclimited.com", base: 2200 },
  { symbol: "SHREECEM", name: "Shree Cement", sector: "Cement", domain: "shreecement.com", base: 26000 },
  { symbol: "DALBHARAT", name: "Dalmia Bharat", sector: "Cement", domain: "dalmiacement.com", base: 1850 },
  { symbol: "JKCEMENT", name: "JK Cement", sector: "Cement", domain: "jkcement.com", base: 4500 },

  // ---- Infrastructure ----
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infrastructure", domain: "larsentoubro.com", base: 3600 },
  { symbol: "ADANIENT", name: "Adani Enterprises", sector: "Infrastructure", domain: "adani.com", base: 3100 },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ", sector: "Infrastructure", domain: "adaniports.com", base: 1450 },
  { symbol: "SIEMENS", name: "Siemens", sector: "Infrastructure", domain: "siemens.com", base: 7000 },
  { symbol: "ABB", name: "ABB India", sector: "Infrastructure", domain: "abb.com", base: 8000 },
  { symbol: "CUMMINSIND", name: "Cummins India", sector: "Infrastructure", domain: "cummins.com", base: 3600 },
  { symbol: "THERMAX", name: "Thermax", sector: "Infrastructure", domain: "thermaxglobal.com", base: 5000 },
  { symbol: "POLYCAB", name: "Polycab India", sector: "Infrastructure", domain: "polycab.com", base: 6800 },
  { symbol: "KEI", name: "KEI Industries", sector: "Infrastructure", domain: "kei-ind.com", base: 4200 },
  { symbol: "GMRAIRPORT", name: "GMR Airports", sector: "Infrastructure", domain: "gmrgroup.in", base: 90 },
  { symbol: "IRB", name: "IRB Infrastructure", sector: "Infrastructure", domain: "irb.co.in", base: 55 },

  // ---- Realty ----
  { symbol: "DLF", name: "DLF", sector: "Realty", domain: "dlf.in", base: 820 },
  { symbol: "LODHA", name: "Macrotech Developers", sector: "Realty", domain: "lodhagroup.in", base: 1300 },
  { symbol: "GODREJPROP", name: "Godrej Properties", sector: "Realty", domain: "godrejproperties.com", base: 2900 },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty", sector: "Realty", domain: "oberoirealty.com", base: 1900 },
  { symbol: "PRESTIGE", name: "Prestige Estates", sector: "Realty", domain: "prestigeconstructions.com", base: 1700 },
  { symbol: "PHOENIXLTD", name: "Phoenix Mills", sector: "Realty", domain: "thephoenixmills.com", base: 1600 },
  { symbol: "BRIGADE", name: "Brigade Enterprises", sector: "Realty", domain: "brigadegroup.com", base: 1200 },

  // ---- Telecom ----
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", domain: "airtel.in", base: 1550 },
  { symbol: "INDUSTOWER", name: "Indus Towers", sector: "Telecom", domain: "industowers.com", base: 420 },
  { symbol: "IDEA", name: "Vodafone Idea", sector: "Telecom", domain: "myvi.in", base: 8 },
  { symbol: "TATACOMM", name: "Tata Communications", sector: "Telecom", domain: "tatacommunications.com", base: 1750 },
  { symbol: "HFCL", name: "HFCL", sector: "Telecom", domain: "hfcl.com", base: 120 },

  // ---- PSU (curated government-owned names across sectors) ----
  { symbol: "COALINDIA", name: "Coal India", sector: "PSU", domain: "coalindia.in", base: 400 },
  { symbol: "NTPC", name: "NTPC", sector: "PSU", domain: "ntpc.co.in", base: 360 },
  { symbol: "POWERGRID", name: "Power Grid Corporation", sector: "PSU", domain: "powergrid.in", base: 320 },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", sector: "PSU", domain: "ongcindia.com", base: 250 },
  { symbol: "IOC", name: "Indian Oil Corporation", sector: "PSU", domain: "iocl.com", base: 140 },
  { symbol: "BPCL", name: "Bharat Petroleum", sector: "PSU", domain: "bharatpetroleum.in", base: 300 },
  { symbol: "GAIL", name: "GAIL India", sector: "PSU", domain: "gailonline.com", base: 200 },
  { symbol: "BEL", name: "Bharat Electronics", sector: "PSU", domain: "bel-india.in", base: 300 },
  { symbol: "HAL", name: "Hindustan Aeronautics", sector: "PSU", domain: "hal-india.co.in", base: 4500 },
  { symbol: "SAIL", name: "Steel Authority of India", sector: "PSU", domain: "sail.co.in", base: 120 },
  { symbol: "NHPC", name: "NHPC", sector: "PSU", domain: "nhpcindia.com", base: 85 },
  { symbol: "IRCTC", name: "Indian Railway Catering", sector: "PSU", domain: "irctc.com", base: 800 },
  { symbol: "RECLTD", name: "REC", sector: "PSU", domain: "recindia.com", base: 500 },
  { symbol: "PFC", name: "Power Finance Corporation", sector: "PSU", domain: "pfcindia.com", base: 470 },
];

// Symbol → domain (used by the outlook detail page logo).
export const OUTLOOK_DOMAINS = Object.fromEntries(OUTLOOK_STOCKS.map((s) => [s.symbol, s.domain]));

// Fast membership set (used by the quote API route to resolve a Yahoo ".NS" root).
export const OUTLOOK_SYMBOLS = new Set(OUTLOOK_STOCKS.map((s) => s.symbol));

// Look up a single outlook stock by symbol.
export function outlookStock(symbol) {
  return OUTLOOK_STOCKS.find((s) => s.symbol === symbol) || null;
}
