import mongoose, { Schema } from 'mongoose'

const notesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    price: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    notesURL: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },

    sellerID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const Note = mongoose.model('Note', notesSchema)
