const seo = {
  title: "Compare 121 Countries by Population, GDP & HDI",
  metaDescription:
    "Sortable table of 121 countries with population, area, GDP and HDI. Filter by continent, search capitals, and pin up to 5 countries side by side.",
  steps: [
    "Search countries or capitals, choose a Sort (Population, Area, GDP, HDI) and filter to one continent.",
    "Press Compare Mode and click table rows to pin up to 5 countries — the Comparison panel lines up all four metrics side by side.",
    "Press Export to copy a plain-text report of the top 20 under your current sort and filter, plus any comparison you built.",
  ],
  intro:
    "World Facts Explorer is a searchable table of 121 countries carrying population, land area in square kilometres, nominal GDP in billions of US dollars, Human Development Index, capital city and continent. Sort by any of the four metrics, filter to one continent, search by country or capital, and pin up to five countries side by side to compare them directly. The current view — the top 20 plus any comparison — can be copied or downloaded as a plain-text report.",
  useCases: [
    "You are settling an argument about whether Russia or Canada is larger, and want both areas on screen at once instead of two separate searches",
    "A student is writing up a continent study and needs the African countries ranked by HDI with their capitals in one place",
    "You are preparing a slide on market size and want the top 20 economies by nominal GDP as text you can paste straight into your notes",
  ],
  benefits: [
    ["Five countries compared at once", "Pin up to five and their population, area, GDP and HDI line up in one panel rather than being read one profile at a time."],
    ["Search matches capitals too", "Typing Nairobi or Canberra finds the country, which is what you want when you know the city but not the entry name."],
    ["Exports the view you built", "The report carries your current sort and continent filter with the top 20 rows, so the copy reflects what you were actually looking at."],
  ],
  faqs: [
    [
      "How many countries are included?",
      "121, spanning every continent group from the largest by population down to Vatican City at roughly 800 people and 0.44 km². It is a curated set rather than the full 193 UN member states, so some smaller nations are not present.",
    ],
    [
      "What do the HDI bands mean?",
      "HDI runs from 0 to 1 and is grouped as Very High at 0.800 and above, High from 0.700 to 0.799, Medium from 0.550 to 0.699 and Low below 0.550 — the same thresholds the UN Development Programme uses. It combines life expectancy, education and income into one figure, so it says nothing about inequality within a country.",
    ],
    [
      "Is the GDP figure nominal or purchasing-power adjusted?",
      "Nominal GDP, shown in billions of current US dollars — the United States at about $25,462B and China at about $17,963B in this dataset. PPP-adjusted figures would reorder the middle of the table considerably, so do not mix the two when quoting.",
    ],
    [
      "How current are these numbers?",
      "They are a fixed snapshot bundled with the page, not a live feed, with population, GDP and HDI values reflecting early-2020s estimates. For anything published or cited, check the current figure against the primary source — the UN Population Division, the World Bank or the UNDP Human Development Report.",
    ],
  ],
};

export default seo;
