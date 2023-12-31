import { User } from '../models/user.model'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'

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

export { registerUser }
