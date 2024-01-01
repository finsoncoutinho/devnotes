import { Request } from 'express'
import { User } from '../models/user.model'
import { ApiError } from '../utils/ApiError'
import { asyncHandler } from '../utils/asyncHandler'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    _id: string
    fullName: string
    email: string
    role: string
    avatar: string
    isSeller: boolean
    isVerified: boolean
  }
}

// if `res` is not used in the method then replace it with `_`
export const verifyJWT = asyncHandler(async (req: AuthRequest, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, 'Unauthorized request')
    }

    interface IDecodedAccessToken {
      _id: string
      email: string
      username: string
      fullName: string
    }

    const decodedToken: IDecodedAccessToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as IDecodedAccessToken

    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    )

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token')
    }

    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, 'Invalid access token')
  }
})
