
const normalizeKey = (value = "") => value.trim().toLowerCase();


export const buildCategoryTree = (items = []) => {
    const categoryMap = new Map();
  
    items.forEach((item) => {
      (item.categories || []).forEach((category) => {
        const categoryName = category?.name?.trim();
        if (!categoryName) return;
  
        const categoryKey = normalizeKey(categoryName);
  
        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, {
            name: categoryName,
            subcategories: [],
          });
        }
  
        const targetCategory = categoryMap.get(categoryKey);
        const subcategoryMap = new Map(
          targetCategory.subcategories.map((sub) => [
            normalizeKey(sub.name),
            sub,
          ])
        );
  
        (category.subcategories || []).forEach((subcategory) => {
          const subcategoryName = subcategory?.name?.trim();
          if (!subcategoryName) return;
  
          const subcategoryKey = normalizeKey(subcategoryName);
  
          if (!subcategoryMap.has(subcategoryKey)) {
            subcategoryMap.set(subcategoryKey, {
              name: subcategoryName,
              brands: [],
            });
          }
  
          const targetSubcategory = subcategoryMap.get(subcategoryKey);
          const brandMap = new Map(
            targetSubcategory.brands.map((brand) => [
              normalizeKey(brand.name),
              brand,
            ])
          );
  
          (subcategory.brands || []).forEach((brand) => {
            const brandName = brand?.name?.trim();
            if (!brandName) return;
  
            const brandKey = normalizeKey(brandName);
  
            if (!brandMap.has(brandKey)) {
              brandMap.set(brandKey, {
                ...brand,
                name: brandName,
              });
            }
          });
  
          targetSubcategory.brands = Array.from(brandMap.values());
        });
  
        targetCategory.subcategories = Array.from(subcategoryMap.values());
      });
    });
  
    return Array.from(categoryMap.values());
  };


