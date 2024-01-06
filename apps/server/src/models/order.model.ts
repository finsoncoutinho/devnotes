import mongoose, { Schema } from 'mongoose'

const orderSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    orderItems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
)

export const Order = mongoose.model('Order', orderSchema)
