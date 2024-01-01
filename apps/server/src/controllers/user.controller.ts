import { AuthRequest } from '../middlewares/auth.middleware'
import { User } from '../models/user.model'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'

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
  // check if user already exists: email
  // create user object: create entry in db
  // check user creation
  // remove password and refresh token feild from response
  // return response

  const { fullName, email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    throw new ApiError(409, 'User with this email already exists')
  }

  const user = await User.create({
    fullName,
    email,
    password,
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
})

const loginUser = asyncHandler(async (req, res) => {
  // req body => data
  // find user using email
  // check if password in correct
  // generate access and refresh token
  // send cookie

  const { email, password } = req.body

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

export { registerUser, loginUser, logoutUser }
