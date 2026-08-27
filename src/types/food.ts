export interface RecommendedPlace {
  name: string
  address: string
  rating: number
  hours: string
  priceRange: string
  mapsUrl: string
}

export interface NutritionInfo {
  calories: string
  fat: string
  carbs: string
  protein: string
  other?: string
}

export interface Food {
  id: number | string
  name: string
  description?: string
  history?: string
  journey?: string
  ingredients?: string[] | string  
  spices?: string[] | string        
  nutrition?: {
    calories?: string
    fat?: string
    carbs?: string
    protein?: string
  } | string
  price: number
  image?: string
  category?: string
  is_popular?: number | boolean
  cookingSteps?: string[] | string  
  created_at?: string
}