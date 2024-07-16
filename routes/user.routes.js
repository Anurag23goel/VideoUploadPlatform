import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  updateCurrentPassword,
  getCurrentuser,
  updateAccountDetails,
  updateAvatarUrl,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(verifyJWT, updateCurrentPassword);
router.route("/getcurrentuser").get(verifyJWT, getCurrentuser);
router.route("/updatecurrentuser").get(verifyJWT, updateAccountDetails);
router.route("/updateavatar").patch(verifyJWT, upload.single("avatar"),updateAvatarUrl);

export default router;
