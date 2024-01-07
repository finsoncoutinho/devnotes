import jwt from 'jsonwebtoken'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { AuthRequest } from '../middlewares/auth.middleware'
import { User } from '../models/user.model'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { deleteFileOnCloudinary, uploadOnCloudinary } from '../utils/cloudinary'

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user?.generateAccessToken()
    const refreshToken = user?.generateRefreshToken()

    user!.refreshToken = refreshToken!
    await user?.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating refresh and access token'
    )
  }
}
const registerUser = asyncHandler(async (req, res) => {
  // get user details from client
  // validate details using zod
  // check if user already exists
  // create user object: create entry in db
  // check user creation
  // remove password and refresh token feild from response
  // return response
  const userSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name must not be empty' }),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })

  type UserType = z.infer<typeof userSchema>

  try {
    const { fullName, email, password }: UserType = userSchema.parse(req.body)

    const userExists = await User.findOne({ email })

    if (userExists) {
      throw new ApiError(409, 'User with this email already exists')
    }

    const user = await User.create({
      fullName,
      email,
      password,
      avatar: '',
      role: 'user',
      isVerified: false,
      isSeller: false,
    })

    const createdUser = await User.findById(user._id).select(
      '-password -refreshToken'
    )

    if (!createdUser) {
      throw new ApiError(500, 'Something went wrong while registering the user')
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, 'User registered successfully'))
  } catch (error) {
    if (error instanceof z.ZodError) {
      // const fieldErrors: Record<string, string> = {}
      // error.errors.forEach((err) => {
      //   const fieldName = err.path[0]
      //   const errorMessage = err.message || 'Validation error'
      //   fieldErrors[fieldName] = errorMessage
      // })

      // throw new ApiError(400, 'Validation error')
      throw new ApiError(400, error.errors[0].message)
    }
    throw error
  }
})

const loginUser = asyncHandler(async (req, res) => {
  // req body => data
  // find user using email
  // check if password in correct
  // generate access and refresh token
  // send cookie

  const userSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })

  type UserType = z.infer<typeof userSchema>

  try {
    const { email, password }: UserType = userSchema.parse(req.body)

    const user = await User.findOne({ email })

    if (!user) {
      throw new ApiError(404, 'User does not exists')
    }

    // methods defined on the userSchema should be used on user instance and not the User model
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid user credentials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    )

    const loggedInUser = await User.findById(user._id).select(
      '-password -refreshToken'
    )

    const options = {
      httpOnly: true,
      secure: true,
    }

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          'User logged In Successfully'
        )
      )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }
    throw error
  }
})

const logoutUser = asyncHandler(async (req: AuthRequest, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'unauthorized request')
  }

  interface IDecodedRefreshToken {
    _id: string
  }

  try {
    const decodedToken: IDecodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as IDecodedRefreshToken

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token')
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user?._id
    )

    const options = {
      httpOnly: true,
      secure: true,
    }

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          'Access token refreshed'
        )
      )
  } catch (error) {
    console.log(error)
    throw new ApiError(401, 'Invalid refresh token')
  }
})

const changeCurrentPassword = asyncHandler(async (req: AuthRequest, res) => {
  const passwordSchema = z.object({
    oldPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),

    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })

  type passwordType = z.infer<typeof passwordSchema>

  try {
    const { oldPassword, newPassword }: passwordType = passwordSchema.parse(
      req.body
    )

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user?.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
      throw new ApiError(400, 'Invalid old password')
    }

    user!.password = newPassword
    await user!.save({ validateBeforeSave: false })

    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Password changed successfully'))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }
    throw error
  }
})

const getCurrentUser = asyncHandler(async (req: AuthRequest, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'User fetched successfully'))
})

const updateUserDetails = asyncHandler(async (req: AuthRequest, res) => {
  const userSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name must not be empty' }),
  })

  type UserType = z.infer<typeof userSchema>

  try {
    const avatarLocalPath = req.file?.path

    const { fullName }: UserType = userSchema.parse(req.body)
    let user

    if (!avatarLocalPath) {
      user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullName,
          },
        },
        { new: true }
      ).select('-password -refreshToken')
    } else {
      if (req.user?.avatar !== '') {
        // delete old avatar

        const deleteAvatar = await deleteFileOnCloudinary(req.user?.email!)
        if (!deleteAvatar) {
          throw new ApiError(500, 'Error while deleteing old avatar')
        }
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath, req.user?.email!)

      if (!avatar?.url) {
        throw new ApiError(400, 'Error while uploading the avatar')
      }

      user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullName,
            avatar: avatar?.url,
          },
        },
        { new: true }
      ).select('-password -refreshToken')
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'Account details updated successfully'))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }

    throw error
  }
})

const becomeSeller = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user?.isVerified) {
    throw new ApiError(
      403,
      'Your email is not verified. Please verify your email before becoming a seller to unlock this feature.'
    )
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        isSeller: true,
      },
    },
    { new: true }
  ).select('-password -refreshToken')
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account details updated successfully'))
})

const sendVerificationEmail = asyncHandler(async (req: AuthRequest, res) => {
  const verificationLink = `http:localhost:3000/verify-email/${req.user?._id}`

  console.log('email-->' + req.user?.email)
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_SERVER_HOST,
    port: Number(process.env.SMPT_SERVER_PORT),
    auth: {
      user: process.env.SMPT_SERVER_USER,
      pass: process.env.SMPT_SERVER_PASSWORD,
    },
  })

  // Email content
  const mailOptions = {
    from: 'devnotes.fin@gmail.com',
    to: req.user?.email,
    subject: 'Verify your DevNotes Account',
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="font-family: 'Arial', sans-serif;">

  <h2>Email Verification</h2>

  <p>Dear ${req.user?.fullName},</p>

  <p>
    Please click the button below to verify your email address.
  </p>

  <a href=${verificationLink} style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
    Verify Email
  </a>

  <p>
    If you're having trouble clicking the button, you can also copy and paste the following link into your browser's address bar: ${verificationLink}
  </p>

  <p>
    Thank you,<br>
    Team DevNotes
  </p>

</body>
</html>

    `,
  }

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(info)
      throw new ApiError(500, 'Error while sending email')
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Verification mail sent successfully'))
    }
  })
})

const verifyUser = asyncHandler(async (req, res) => {
  const { id } = req.body
  if (!id) {
    throw new ApiError(400, 'User id is required')
  }

  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        isVerified: true,
      },
    },
    { new: true }
  ).select('-password -refreshToken')
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Email verified successfully'))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  becomeSeller,
  sendVerificationEmail,
  verifyUser,
}
