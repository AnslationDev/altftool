const seo = {
  title: "CSS Specificity Referee: Why Your Selector Loses",
  metaDescription:
    "Compare two selectors: both (a,b,c) triples per Selectors Level 4, which of the six cascade criteria decided it, and the smallest edit that flips it.",
  steps: [
    "On the \"Two selectors\" tab, type the rule that is \"Winning now\" and the one you \"Want to win\", giving each its \"Cascade layer (blank = unlayered)\".",
    "Tick \"Declared !important\" or \"It is a style attribute\" where they apply, then set \"Layer order, as declared\" and Source order under Cascade context.",
    "The verdict names the winning selector, prints both (a,b,c) triples with a token table, chips the criterion that \"Decided by\" the fight, and lists \"What flips the result\"; \"Copy verdict\" copies it.",
  ],
  intro:
    "This page referees a CSS fight: give it the selector that is currently winning and the one you want to win, and it returns each selector's (a, b, c) specificity per Selectors Level 4 §15, the cascade criterion that actually decided the contest per CSS Cascade Level 5 §6.1, and the smallest edit that reverses the result. It is for anyone staring at a style that will not apply — because specificity is only the fifth of six sorting criteria, and importance, style attributes and @layer are all settled before the browser ever counts your classes.",
  useCases: [
    "Work out why `.btn.primary` (0,2,0) loses to `#sidebar .btn` (1,1,0) and what the wanted selector would have to score to win",
    "Paste the Chrome DevTools Styles pane, with its `element.style` block and struck-out rules, and get the one declaration that survived the cascade",
    "Check a whole stylesheet for every rule that sets `color` on `button#save.btn.primary`, ranked from winner to loser with the layer each rule sits in",
    "Confirm the modern-cascade surprise: an unlayered normal declaration beats a layered one, while an unlayered `!important` declaration loses to a layered one",
  ],
  benefits: [
    [
      "Selectors Level 4 arithmetic, not the 1996 version",
      ":is(), :not() and :has() take the specificity of their most specific argument, :where() always contributes 0,0,0, and :nth-child(-n+3 of .noted) counts as one pseudo-class plus .noted — 0,1,0 plus the type selector.",
    ],
    [
      "Layers resolved before specificity",
      "Cascade layers are criterion 4 and specificity is criterion 5, so a layered rule can lose to a weaker unlayered one. The page names which criterion decided instead of only printing triples.",
    ],
    [
      "The flip is spelled out as arithmetic",
      "When specificity decides, the page states the exact triple the losing selector must exceed and how many ID, class-level or type-level units reach it.",
    ],
    [
      "Three ways in",
      "Two-selector duel, a DevTools Styles-pane paste, or a full stylesheet plus an element description like button#save.btn.primary.",
    ],
  ],
  faqs: [
    [
      "Why is my CSS not applying even though my selector is more specific?",
      "Because specificity is only the fifth of the six cascade criteria in CSS Cascade Level 5 §6.1. Sorted before it are importance (an `!important` declaration beats any normal one), context, element-attached styles (a `style` attribute beats every style rule of the same importance), and cascade layers. A 0,1,0 unlayered `.btn` beats a 1,1,0 `#app .btn` that sits inside `@layer components`, because the layer test finishes before either triple is counted.",
    ],
    [
      "How is specificity actually calculated?",
      "As the triple (a, b, c) from Selectors Level 4 §15: a counts ID selectors, b counts class selectors, attribute selectors and pseudo-classes, and c counts type selectors and pseudo-elements. They are compared column by column, not added up — 1,0,0 beats 0,99,0. The universal selector `*` and every combinator (space, >, +, ~) contribute nothing, so `#nav .list li a:hover` is 1,2,2.",
    ],
    [
      "What do :is(), :where(), :not() and :has() do to specificity?",
      ":is(), :not() and :has() contribute the specificity of the most specific complex selector in their argument list and nothing of their own, so `:is(p, #fakeId)` is 1,0,0 and `p:not(.a, #b)` is 1,0,1. `:where()` is the exception: it contributes 0,0,0 no matter what is inside it, which is why `:where(#a, .b) p` scores only 0,0,1.",
    ],
    [
      "Does !important reverse the cascade layer order?",
      "Yes. For normal declarations the last-declared layer wins and unlayered styles sit in an implicit final layer, so unlayered beats layered. For `!important` declarations CSS Cascade Level 5 inverts it: the first-declared layer wins, and that same implicit final layer now puts unlayered `!important` at the bottom, losing to every layered `!important`. So `@layer base { .btn { color: navy !important } }` beats an unlayered `#app .btn { color: olive !important }`.",
    ],
  ],
};

export default seo;
