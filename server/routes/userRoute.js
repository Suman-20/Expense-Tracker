import express from "express";


import { registerUser,loginUser,getUserProfile,updateUserProfile,updatePassword } from "../controllers/usercontroller.js";
import protect from "../middleware/auth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/me",protect,getUserProfile);
router.put("/profile",protect,updateUserProfile);
router.put("/password",protect,updatePassword);

export default router;
