import { Router } from 'express'
import { createCategory } from '../controllers/category.controller'
import { verifyJWT } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/multer.middleware'

const router = Router()
// secured routes
router
  .route('/create')
  .post(verifyJWT, upload.single(' categoryImage'), createCategory)

export default router
