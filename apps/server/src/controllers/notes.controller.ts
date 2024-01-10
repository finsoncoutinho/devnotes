import { z } from 'zod'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/ApiError'
import { Note } from '../models/notes.model'
import { uploadOnCloudinary } from '../utils/cloudinary'
import { ApiResponse } from '../utils/ApiResponse'
import { AuthRequest } from '../middlewares/auth.middleware'
import { addReview } from './review.controller'
import { Types } from 'mongoose'

const createNote = asyncHandler(async (req: AuthRequest, res) => {
  // get notes details from client
  // validate details using zod
  // create notes object: create entry in db
  // return response
  const notesSchema = z.object({
    title: z.string().min(1, { message: 'title must not be empty' }),
    description: z
      .string()
      .min(1, { message: 'description must not be empty' }),
    category: z.string().min(1, { message: 'category must not be empty' }),
    price: z.string().min(1, { message: 'price must not be empty' }),

    // price: z.number().refine((value) => Number.isInteger(value), {
    //   message: 'Price amount must be a positive integer',
    // }),
  })

  type NotesType = z.infer<typeof notesSchema>
  interface notesFiles {
    thumbnail?: Express.Multer.File[]
    noteURL?: Express.Multer.File[]
  }
  try {
    const { title, description, category, price }: NotesType =
      notesSchema.parse(req.body)

    const files: notesFiles = req.files as notesFiles

    const thumbnailLocalPath = files?.thumbnail
      ? files?.thumbnail![0].path
      : null

    const notesURLLocalPath = files?.noteURL ? files?.noteURL![0].path : null

    if (!thumbnailLocalPath) {
      throw new ApiError(400, 'thumbnail is required')
    }

    if (!notesURLLocalPath) {
      throw new ApiError(400, 'notes file is required')
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const noteURL = await uploadOnCloudinary(notesURLLocalPath)

    const note = await Note.create({
      sellerID: req.user?._id,
      title,
      description,
      category,
      price,
      thumbnail: thumbnail?.url,
      noteURL: noteURL?.url,
      isVerified: false,
      review: [],
    })

    return res
      .status(201)
      .json(new ApiResponse(201, note, 'Note created successfully'))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }
    throw error
  }
})

const updateNote = asyncHandler(async (req: AuthRequest, res) => {
  const notesSchema = z.object({
    noteID: z.string().min(1, { message: 'id must not be empty' }),
    title: z.string().min(1, { message: 'title must not be empty' }),
    description: z
      .string()
      .min(1, { message: 'description must not be empty' }),
    category: z.string().min(1, { message: 'category must not be empty' }),
    price: z.string().min(1, { message: 'price must not be empty' }),

    // price: z.number().refine((value) => Number.isInteger(value), {
    //   message: 'Price amount must be a positive integer',
    // }),
  })

  type NotesType = z.infer<typeof notesSchema>

  try {
    const { noteID, title, description, category, price }: NotesType =
      notesSchema.parse(req.body)

    const thumbnailLocalPath = req.file?.path
    let note

    if (!thumbnailLocalPath) {
      note = await Note.findByIdAndUpdate(
        noteID,
        {
          $set: {
            title,
            description,
            category,
            price,
          },
        },
        { new: true }
      )
    } else {
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

      note = await Note.findByIdAndUpdate(
        noteID,
        {
          $set: {
            title,
            description,
            category,
            price,
            thumbnail: thumbnail?.url,
          },
        },
        { new: true }
      )
    }

    return res
      .status(200)
      .json(new ApiResponse(200, note, 'Note updated successfully'))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }
    throw error
  }
})

const deleteNote = asyncHandler(async (req: AuthRequest, res) => {
  const { noteID } = req.params
  if (!noteID) {
    throw new ApiError(400, 'NoteID is required')
  }
  const note = await Note.findById(noteID)

  if (note?.sellerID?.toString() !== req.user?._id.toString()) {
    throw new ApiError(401, 'unauthorized request')
  }

  const deleteNote = await Note.findByIdAndDelete(noteID)
  return res
    .status(200)
    .json(new ApiResponse(200, deleteNote, 'Note deleted successfully'))
})

const reviewNote = asyncHandler(async (req: AuthRequest, res) => {
  const reviewSchema = z.object({
    noteID: z.string().min(1, { message: 'noteID must not be empty' }),
    review: z.string().min(1, { message: 'review must not be empty' }),
    // rating: z.string().min(1, { message: 'rating must not be empty' }),
    rating: z
      .number()
      .min(1, { message: 'Rating must be at least 1' })
      .max(5, { message: 'Rating must be at most 5' })
      .refine((value) => Number.isInteger(value), {
        message: 'Rating must be an integer',
      }),
  })
  type ReviewType = z.infer<typeof reviewSchema>

  try {
    const { noteID, review, rating }: ReviewType = reviewSchema.parse(req.body)

    const newReview = await addReview(rating, review, req.user?._id!)

    const note = await Note.findByIdAndUpdate(
      noteID,
      { $push: { review: newReview._id } },
      { new: true }
    )

    return res
      .status(200)
      .json(new ApiResponse(200, note, 'Review added successfully'))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message)
    }
    throw error
  }
})

const getUserNotes = asyncHandler(async (req: AuthRequest, res) => {
  const userNotes = await Note.find({ sellerID: req.user?._id })
  if (!userNotes) {
    throw new ApiError(500, 'Something went wrong while fetching notes')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userNotes, 'notes fetched successfully'))
})

const getAllNonVerifiedNotes = asyncHandler(async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(401, 'Unauthorized request')
  }
  const nonVerifiedNotes = await Note.find({ isVerified: false })

  if (!nonVerifiedNotes) {
    throw new ApiError(500, 'Something went wrong while fetching notes')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, nonVerifiedNotes, 'notes fetched successfully'))
})
const verifyNote = asyncHandler(async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(401, 'Unauthorized request')
  }

  const { noteID } = req.params

  const note = await Note.findByIdAndUpdate(
    noteID,
    {
      $set: {
        isVerified: true,
      },
    },
    { new: true }
  )

  if (!note) {
    throw new ApiError(500, 'Something went wrong while verifing notes')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, 'note verified successfully'))
})

const getNoteDetails = asyncHandler(async (req, res) => {
  const { noteID } = req.params

  // const note = await Note.findById(noteID)
  const note = await Note.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(noteID),
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [
          {
            $project: {
              categoryName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        category: {
          $first: '$category',
        },
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: 'review',
        foreignField: '_id',
        as: 'review',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'userID',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          {
            $project: {
              'userDetails.fullName': 1,
              'userDetails.avatar': 1,
              review: 1,
              rating: 1,
            },
          },
        ],
      },
    },
  ])

  if (!note) {
    throw new ApiError(500, 'Something went wrong while fetching notes')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, 'note details fetched successfully'))
})

const getNotesByTitle = asyncHandler(async (req, res) => {
  const { title } = req.params

  const notes = await Note.aggregate([
    {
      $match: {
        title: {
          $regex: new RegExp(title, 'i'), // Case-insensitive regex match
        },
        isVerified: true,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [
          {
            $project: {
              categoryName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        category: {
          $first: '$category',
        },
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: 'review',
        foreignField: '_id',
        as: 'review',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'userID',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          {
            $project: {
              'userDetails.fullName': 1,
              'userDetails.avatar': 1,
              review: 1,
              rating: 1,
            },
          },
        ],
      },
    },
  ])

  if (!notes) {
    throw new ApiError(500, 'Something went wrong while fetching notes')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notes, 'notes fetched successfully'))
})

export {
  createNote,
  updateNote,
  deleteNote,
  reviewNote,
  getUserNotes,
  getAllNonVerifiedNotes,
  verifyNote,
  getNoteDetails,
  getNotesByTitle,
}
