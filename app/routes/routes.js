import express from "express";
import SucureController from "../controller/controller.js";
const router = express.Router();

router.post("/register",SucureController.register);
router.post("/login",SucureController.login);
router.patch("reset-password",SucureController.resetPassword);
router.get("users",SucureController.getAllUsers);

export default router;