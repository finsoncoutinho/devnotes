import { z } from 'zod'
import { asyncHandler } from '../utils/asyncHandler'
import { Category } from '../models/category.model'
import { ApiError } from '../utils/ApiError'
import { uploadOnCloudinary } from '../utils/cloudinary'
import { ApiResponse } from '../utils/ApiResponse'
import { AuthRequest } from '../middlewares/auth.middleware'

const createCategory = asyncHandler(async (req: AuthRequest, res) => {
  // get category name and image from client
  // validate details using zod
  // create entry in db
  // return response

  if (req.user?.role !== 'admin') {
    throw new ApiError(401, 'Unauthorized request')
  }

  const categorySchema = z.object({
    categoryName: z
      .string()
      .min(1, { message: 'Category name must not be empty' }),
  })

  const categoryImageLocalPath = req.file?.path

  if (!categoryImageLocalPath) {
    throw new ApiError(400, 'Category image file is missing')
  }

  try {
    const { categoryName } = categorySchema.parse(req.body)

    const categoryExists = await Category.findOne({ categoryName })

    if (categoryExists) {
      throw new ApiError(409, 'Category with this name already exists')
    }

    const categoryImage = await uploadOnCloudinary(categoryImageLocalPath)

    if (!categoryImage?.url) {
      throw new ApiError(400, 'Error while uploading category image')
    }

    const newCategory = await Category.create({
      categoryName,
      categoryImage: categoryImage.url,
    })

    if (!newCategory) {
      throw new ApiError(500, 'Something went wrong while creating category')
    }

    return res
      .status(201)
      .json(new ApiResponse(200, newCategory, 'Category created successfully'))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }
  }
})

export { createCategory }
