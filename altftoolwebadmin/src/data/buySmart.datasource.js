


const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const buySmartDataSource = USE_MOCK
  ? require("./mock.buySmart").mockBuySmartSource
  : require("./firebase.buySmart").firebaseBuySmartSource;

  export const buySmartHeroSource = USE_MOCK
  ? require("./mock.buySmart").mockBuySmartHeroSource
  : require("./firebase.buySmart").firebaseBuySmartSource;


  export const buySmartStoreSource = USE_MOCK
  ? require("./mock.buySmart").mockBuySmartHeroSource
  : require("./firebase.buySmart").firebaseBuySmartSource;

  export const buySmartTrendingSource = USE_MOCK
  ? require("./mock.buySmart").mockBuySmartHeroSource
  : require("./firebase.buySmart").firebaseBuySmartSource;

  export const buySmartCategoresSource = USE_MOCK
  ? require("./mock.buySmart").mockBuySmartHeroSource
  : require("./firebase.buySmart").firebaseBuySmartSource;

  export const buySmartRuleSetSource = USE_MOCK
  ? require("./mock.buySmart").mockBuySmartHeroSource
  : require("./firebase.buySmart").firebaseBuySmartSource;

  export const buySmartFeatureBrandSource = USE_MOCK
  ? require("./mock.buySmart").mockBuySmartHeroSource
  : require("./firebase.buySmart").firebaseBuySmartSource;








