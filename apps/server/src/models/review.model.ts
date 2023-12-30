import mongoose, { Schema } from 'mongoose'

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    notesId: {
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
