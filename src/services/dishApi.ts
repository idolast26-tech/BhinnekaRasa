import type { Food } from '../types/food'
import API_BASE_URL from '../config/api'

// Helper untuk parse JSON string dari database
function parseJsonField<T>(field: string | T): T {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field)
    } catch {
      return field as unknown as T
    }
  }
  return field
}

export async function fetchDishes(): Promise<Food[]> {
  const res = await fetch(`${API_BASE_URL}/dishes`)
  const result = await res.json()
  
  if (!result.success) throw new Error('Gagal mengambil data kuliner')
  
  // Parse JSON fields dari database
  return result.data.map((dish: any) => ({
    ...dish,
    cookingSteps: parseJsonField<string[]>(dish.cooking_steps || '[]'),
    ingredients: parseJsonField<string[]>(dish.ingredients || '[]'),
    spices: parseJsonField<string[]>(dish.spices || '[]'),
    nutrition: parseJsonField(dish.nutrition || '{}'),
  }))
}

export async function fetchDishById(id: string | number): Promise<Food | null> {
  const res = await fetch(`${API_BASE_URL}/dishes/${id}`)
  const result = await res.json()
  
  if (!result.success) return null
  
  const dish = result.data
  
  // Parse JSON fields
  return {
    ...dish,
    cookingSteps: parseJsonField<string[]>(dish.cooking_steps || '[]'),
    ingredients: parseJsonField<string[]>(dish.ingredients || '[]'),
    spices: parseJsonField<string[]>(dish.spices || '[]'),
    nutrition: parseJsonField(dish.nutrition || '{}'),
  }
}