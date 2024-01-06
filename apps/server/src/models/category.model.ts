import mongoose, { Schema } from 'mongoose'

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Category = mongoose.model('Category', categorySchema)
