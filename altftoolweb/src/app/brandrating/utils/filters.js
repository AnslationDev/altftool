export function getCategory(data, categoryName) {
  const categories = data?.categories || []

  return categories.find(
    (c) => c.category === categoryName
  )
}

export function getBrands(data, categoryName) {
  const category = getCategory(data, categoryName)

  return category?.brands || []
}

//  get all categories safely
export function getAllCategories(data) {
  return data?.categories || []
}

//  get all brand names (flat list)
export function getAllBrands(data, categoryName) {
  const brands = getBrands(data, categoryName)

  return brands.map((b) => b.name)
}