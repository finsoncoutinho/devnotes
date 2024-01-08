import { Review } from '../models/review.model'
import { ApiError } from '../utils/ApiError'

const addReview = async (rating: number, review: string, userID: string) => {
  const newReview = await Review.create({
    rating,
    review,
    userID,
  })
  if (!newReview) {
    throw new ApiError(500, 'Something went wrong while adding the review')
  }

  return newReview
}

export { addReview }
