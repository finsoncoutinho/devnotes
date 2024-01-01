import mongoose, { Schema, Document } from 'mongoose'

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'user'],
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    isSeller: {
      type: Boolean,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// you should avoid arrow functions here as they don't have access to this keyword

// hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// check if password is correct
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<Boolean> {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}
interface IUser {
  fullName: string
  email: string
  password: string
  role: string
  avatar: string
  isSeller: boolean
  isVerified: boolean
  refreshToken: string
}

interface IUserDocument extends IUser, Document {
  isPasswordCorrect(password: string): Promise<boolean>
  generateAccessToken(): string
  generateRefreshToken(): string
}

export const User = mongoose.model<IUserDocument>('User', userSchema)
