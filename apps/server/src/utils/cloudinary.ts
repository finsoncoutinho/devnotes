import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

const uploadOnCloudinary = async (localFilePath: string, publicId: string) => {
  try {
    cloudinaryConfig()
    if (!localFilePath) return null

    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      public_id: publicId,
      resource_type: 'auto',
    })

    // remove the locally stored file
    fs.unlinkSync(localFilePath)

    return response
  } catch (error) {
    // remove the locally stored file as upload process failed
    fs.unlinkSync(localFilePath)
    return null
  }
}

const deleteFileOnCloudinary = async (publicId: string) => {
  try {
    cloudinaryConfig()

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      // console.log(`File with public ID ${publicId} deleted from Cloudinary`)
      return true
    } else {
      // console.error(`Failed to delete file from Cloudinary: ${result.result}`)
      return false
    }
  } catch (error) {
    const castedError = error as { message: string }
    console.error('Error deleting file from Cloudinary:', castedError.message)
  }
}

export { uploadOnCloudinary, deleteFileOnCloudinary }
