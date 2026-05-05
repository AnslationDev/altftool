import { getBrandDetails } from "../utils/firebase.brandDetail";
import { buildCategoryTree } from "./BrandDetail";

export const getFormattedBrandData = async () => {
  const data = await getBrandDetails();
  return buildCategoryTree(data);
};