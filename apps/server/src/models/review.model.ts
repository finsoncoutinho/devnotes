import mongoose, { Schema } from 'mongoose'

const reviewSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    notesID: {
      type: Schema.Types.ObjectId,
      ref: 'Note',
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

export const Note = mongoose.model('Note', reviewSchema)
