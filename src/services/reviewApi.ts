import type { Review, NewReview } from '../types/review'

import API_BASE_URL from '../config/api'

export async function fetchReviewsByFoodId(foodId: string | number): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews?restaurant_id=${foodId}`)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return [] // Return array kosong agar tidak crash
  }
}

export async function submitReview(review: NewReview): Promise<Review> {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Gagal mengirim ulasan')
  }
  
  return await res.json()
}