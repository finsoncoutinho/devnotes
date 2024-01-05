import { Router } from 'express'
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserDetails,
} from '../controllers/user.controller'
import { verifyJWT } from '../middlewares/auth.middleware'

const router = Router()

router.route('/register').post(registerUser)

router.route('/login').post(loginUser)

// secured routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/update-details').patch(verifyJWT, updateUserDetails)

export default router
