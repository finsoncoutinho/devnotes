import mongoose, { Schema } from 'mongoose'

const reviewSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Review = mongoose.model('Review', reviewSchema)
