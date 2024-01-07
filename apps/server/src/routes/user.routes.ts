import { Router } from 'express'
import {
  becomeSeller,
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  sendVerificationEmail,
  updateUserDetails,
  verifyUser,
} from '../controllers/user.controller'
import { verifyJWT } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/multer.middleware'

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

// secured routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router
  .route('/update-details')
  .patch(verifyJWT, upload.single('avatar'), updateUserDetails)
router.route('/change-password').patch(verifyJWT, changeCurrentPassword)
router.route('/become-seller').patch(verifyJWT, becomeSeller)
router.route('/details').get(verifyJWT, getCurrentUser)
router.route('/verification-email').post(verifyJWT, sendVerificationEmail)
router.route('/verify-user').patch(verifyUser)

export default router
