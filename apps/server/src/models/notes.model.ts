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
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    NotesURL: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

export const Note = mongoose.model('Note', notesSchema)
