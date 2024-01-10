import { Router } from 'express'
import { upload } from '../middlewares/multer.middleware'
import {
  createNote,
  deleteNote,
  getAllNonVerifiedNotes,
  getNoteDetails,
  getNotesByCategory,
  getNotesByTitle,
  getUserNotes,
  reviewNote,
  updateNote,
  verifyNote,
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
router.route('/review').patch(verifyJWT, reviewNote)
router.route('/user-notes').get(verifyJWT, getUserNotes)
router.route('/non-verified-notes').get(verifyJWT, getAllNonVerifiedNotes)
router.route('/verify-note/:noteID').post(verifyJWT, verifyNote)
router.route('/note-details/:noteID').get(getNoteDetails)
router.route('/title/:title').get(getNotesByTitle)
router.route('/category/:categoryID').get(getNotesByCategory)

export default router
