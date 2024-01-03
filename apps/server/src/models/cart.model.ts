import mongoose, { Schema } from 'mongoose'

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    cartItems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Cart = mongoose.model('Cart', cartSchema)
