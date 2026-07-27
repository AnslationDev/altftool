const seo = {
  intro:
    "The Stamp Paper Denomination Splitter turns a stamp duty figure into the exact set of non-judicial stamp papers you should ask the vendor for, using the fewest sheets and the smallest unavoidable overshoot. It solves the ladder of printed face values (Re.1 up to Rs.25,000) as an unbounded coin-change problem rather than a greedy split, so the answer is genuinely the minimum. It is built for buyers, tenants, advocates' clerks and anyone about to execute an agreement on physical paper.",
  useCases: [
    "Buying stamp paper for a rent agreement where the state charges a percentage of annual rent plus deposit, leaving an awkward figure like Rs.4,720.",
    "Checking, before you leave the counter, whether the vendor's suggested combination overshoots the duty more than it needs to.",
    "Reworking the split when the vendor has run out of a denomination — untick Rs.500 or Rs.5,000 and see what replaces it.",
  ],
  benefits: [
    ["Minimum sheets, provably", "Dynamic programming finds the true minimum, which a largest-first greedy split can miss."],
    ["Shows the overshoot", "Separates duty payable from face value bought so you can see exactly how much is wasted."],
    ["Adapts to stock", "Toggle off any face value the counter does not have and the breakdown recalculates around it."],
  ],
  faqs: [
    [
      "What denominations does non-judicial stamp paper come in?",
      "India Security Press prints non-judicial stamp paper in Re.1, Rs.2, Rs.5, Rs.10, Rs.20, Rs.50, Rs.100, Rs.500, Rs.1,000, Rs.5,000, Rs.10,000, Rs.15,000, Rs.20,000 and Rs.25,000. In practice most vendors only stock Rs.10 and above, and availability of the higher values varies by state and by counter.",
    ],
    [
      "Can I use several stamp papers for one agreement?",
      "Yes. Where a single sheet does not cover the duty, the instrument is executed across multiple papers whose face values add up to at least the amount chargeable, with the document text continuing across the sheets. Practice on numbering and signing every sheet varies by state, so follow what your sub-registrar accepts.",
    ],
    [
      "What happens if the stamp duty is paid short?",
      "Under section 35 of the Indian Stamp Act, 1899 an instrument that is not duly stamped is not admissible in evidence until the deficit duty and a penalty are paid. The penalty can be several times the shortfall, which is why paying a small excess is the safer error. Consult an advocate on the position in your state.",
    ],
    [
      "Is the excess over the stamp duty refundable?",
      "Generally no once the paper has been used. Most states allow a refund only for spoiled or unused stamp paper, within a limited window and after a deduction — so it is worth minimising the overshoot at the point of purchase. Check your state's stamp rules for the exact procedure.",
    ],
  ],
};

export default seo;
