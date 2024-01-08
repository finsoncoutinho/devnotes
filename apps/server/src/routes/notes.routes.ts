import { Router } from 'express'
import { upload } from '../middlewares/multer.middleware'
import {
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notes.controller'
import { verifyJWT } from '../middlewares/auth.middleware'

const router = Router()

// protected routes
router.route('/create').post(
  verifyJWT,
  upload.fields([
    {
      name: 'thumbnail',
      maxCount: 1,
    },
    {
      name: 'noteURL',
      maxCount: 1,
    },
  ]),
  createNote
)

router.route('/update').patch(verifyJWT, upload.single('thumbnail'), updateNote)
router.route('/delete/:noteID').delete(verifyJWT, deleteNote)

export default router
