import { Router } from 'express'
import {
  createCategory,
  getAllCategories,
  updateCategory,
} from '../controllers/category.controller'
import { verifyJWT } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/multer.middleware'

const router = Router()

router.route('/get-all').get(getAllCategories)

// secured routes
router
  .route('/create')
  .post(verifyJWT, upload.single('categoryImage'), createCategory)
router
  .route('/update')
  .patch(verifyJWT, upload.single('categoryImage'), updateCategory)

export default router
