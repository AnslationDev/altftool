const seo = {
  intro:
    "This checker applies section 64(1A) of the Income-tax Act to work out whose return a minor child's investment income belongs in, and how much of it survives the section 10(32) exemption of Rs 1,500 per child. It picks the clubbing parent using the statutory test — the parent with the higher total income while the marriage subsists, otherwise the parent who maintains the child — and applies the proviso that keeps the child's own earnings and a section 80U disability out of clubbing altogether. It also flags that section 115BAC withdraws the Rs 1,500 exemption under the new regime.",
  useCases: [
    "A parent who opened a fixed deposit in a seven-year-old's name and wants to know which spouse must declare the interest.",
    "A separated parent confirming that the minor's income follows the parent who maintains the child rather than the higher earner.",
    "A family with a child actor checking that fees earned from the child's own talent stay in the child's return and get the full basic exemption limit.",
  ],
  benefits: [
    ["Applies the real test", "Picks the clubbing parent by comparing total income excluding the minor's, exactly as section 64(1A) requires."],
    ["Regime aware", "Allows the Rs 1,500 section 10(32) exemption in the old regime and removes it in the new regime."],
    ["Covers the exceptions", "Separates exempt PPF and Sukanya interest, the child's own earnings and section 80U cases from ordinary clubbing."],
  ],
  faqs: [
    [
      "Is interest on an FD in my child's name taxable in my hands?",
      "Yes. Section 64(1A) includes all income of a minor child in the total income of a parent, so deposit interest earned on an account in the child's name is taxed in the parent's return. The parent may exclude only Rs 1,500 per minor child under section 10(32), and even that is unavailable under the new regime.",
    ],
    [
      "Which parent has to club the minor child's income?",
      "The parent whose total income, computed before including the minor's income, is greater — where the marriage of the parents subsists. If it does not subsist, the income goes to the parent who maintains the child. Once clubbed with one parent it continues with that parent in later years unless the Assessing Officer directs otherwise after giving that parent a hearing.",
    ],
    [
      "How much exemption do I get for a minor child's income?",
      "Rs 1,500 per minor child per year under section 10(32), or the amount of income actually clubbed if that is lower. It is a per-child figure, so two children with clubbed income give Rs 3,000, and it is denied under the new regime by section 115BAC(2)(i).",
    ],
    [
      "Is Sukanya Samriddhi or PPF interest in a child's name clubbed with the parent?",
      "No. Sukanya Samriddhi interest is exempt under section 10(11A) and PPF interest under section 10(11), so there is no taxable income for section 64(1A) to move. Clubbing only shifts taxable income between returns; it cannot make exempt income taxable.",
    ],
  ],
};

export default seo;
