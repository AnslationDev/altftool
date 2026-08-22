const seo = {
  title: "Spain VAT Calculator (IVA 21%, 10%, 4% + Recargo)",
  metaDescription:
    "Add or remove Spanish IVA at 21%, 10% or 4%, see base, cuota and total, and apply the recargo de equivalencia (5.2%, 1.4%, 0.5%) for retailers.",
  steps: [
    "Switch between 'Add IVA' and 'Remove IVA', then enter the base imponible or the total (IVA incluido) amount.",
    "Choose the 'Tipo de IVA' — Tipo general 21%, reducido 10%, superreducido 4%, 0% or a custom rate — and tick 'Apply recargo de equivalencia' when invoicing a retailer on that regime.",
    "Read the base imponible, cuota de IVA, recargo and 'Total factura' rows, compare the same base at every Spanish rate, then click 'Copy result'.",
  ],
  intro:
    "This calculator works out Spanish IVA in either direction: it multiplies a base imponible by 1.21 at the tipo general, or divides a gross total by 1.21 to recover the base and the cuota. The 10% tipo reducido and 4% superreducido bands set out in articles 90 and 91 of Ley 37/1992 are one click away, and an optional recargo de equivalencia adds the 5.2%, 1.4% or 0.5% retailer surcharge to the same base.",
  useCases: [
    "Turning a 1,000 EUR base imponible into the 1,210 EUR total that appears on a Spanish factura at the tipo general.",
    "Recovering the base and cuota from a 121 EUR receipt so the figures can be entered on modelo 303 as 100 EUR base and 21 EUR IVA.",
    "Invoicing a small retailer on the recargo de equivalencia regime, where a 100 EUR base at 21% becomes 21 EUR IVA plus 5.20 EUR recargo, a 126.20 EUR total.",
  ],
  benefits: [
    ["All three IVA bands", "21% general, 10% reducido and 4% superreducido, plus a custom rate for IGIC comparisons."],
    ["Recargo de equivalencia built in", "Applies the correct 5.2%, 1.4% or 0.5% surcharge automatically for the chosen band."],
    ["Reconciles to the céntimo", "Base, cuota, recargo and total are rounded so the invoice always adds up."],
  ],
  faqs: [
    [
      "What is the VAT rate in Spain?",
      "The tipo general is 21% and has applied since 1 September 2012. A 10% tipo reducido covers hospitality, restaurants, hotels, passenger transport and most foodstuffs, while a 4% tipo superreducido covers staples such as bread, milk, cheese, eggs, fruit and vegetables, plus books, newspapers and medicines.",
    ],
    [
      "How do I calculate the base imponible from a total with IVA?",
      "Divide the total by 1.21 at 21%, by 1.10 at 10% or by 1.04 at 4%, then subtract the base from the total to get the cuota. A 121 EUR total at 21% is 100 EUR base and 21 EUR IVA — the tax is 21/121 of the gross, about 17.36%.",
    ],
    [
      "What is the recargo de equivalencia and who pays it?",
      "It is a surcharge under article 161 of Ley 37/1992 that suppliers add when they invoice retailers who sell to consumers without transforming the goods. It is 5.2% on 21% supplies, 1.4% on 10%, 0.5% on 4% and 1.75% on tobacco. The retailer pays it to the supplier and in exchange files no IVA return on those sales.",
    ],
    [
      "Does IVA apply in the Canary Islands, Ceuta and Melilla?",
      "No. The Canary Islands apply IGIC, whose general rate is 7%, and Ceuta and Melilla apply IPSI. Both sit outside the Spanish IVA territory, so a peninsular 21% calculation does not carry across. Check the applicable local rate or ask a gestor before invoicing there.",
    ],
  ],
};

export default seo;
