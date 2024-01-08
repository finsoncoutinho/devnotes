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

    const categoryImage = await uploadOnCloudinary(
      categoryImageLocalPath,
      categoryName
    )

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
    throw error
  }
})
const updateCategory = asyncHandler(async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(401, 'Unauthorized request')
  }

  const categorySchema = z.object({
    categoryID: z.string().min(1, { message: 'categoryID must not be empty' }),
  })

  const categoryImageLocalPath = req.file?.path

  if (!categoryImageLocalPath) {
    throw new ApiError(400, 'Category image file is missing')
  }

  try {
    const { categoryID } = categorySchema.parse(req.body)

    const category = await Category.findById(categoryID)

    if (!category) {
      throw new ApiError(400, 'invalid category id')
    }

    const categoryImage = await uploadOnCloudinary(
      categoryImageLocalPath,
      category.categoryName
    )

    if (!categoryImage?.url) {
      throw new ApiError(400, 'Error while uploading category image')
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryID,
      {
        $set: {
          categoryImage: categoryImage?.url,
        },
      },
      { new: true }
    )

    if (!updatedCategory) {
      throw new ApiError(500, 'Something went wrong while updating category')
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCategory, 'Category updated successfully')
      )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }
    throw error
  }
})

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
  if (!categories) {
    throw new ApiError(500, 'Something went wrong while fetching category')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, categories, 'Categories fetched successfully'))
})

export { createCategory, updateCategory, getAllCategories }
