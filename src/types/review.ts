export interface Review {
  id: number
  restaurant_id: number      // relasi ke food.id
  user_id: number | null
  user_name: string
  user_avatar: string | null
  user_email: string | null
  rating: number
  comment: string
  images: string[] | null
  visited_date: string | null
  helpful_count: number
  is_verified_purchase: boolean
  reply_from_owner: string | null
  reply_date: string | null
}

export interface NewReview {
  restaurant_id: number
  user_id: number
  user_name: string
  rating: number
  comment: string
}