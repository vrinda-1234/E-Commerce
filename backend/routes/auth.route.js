import express from "express";
import { login, logout, signup , refreshToken } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken); // to generate access token once it expires



export default router;