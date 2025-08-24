import express from "express";
import SucureController from "../controller/controller.js";
const router = express.Router();
import { AuthCheck, adminCheck } from "../middleware/authCheck.js";

router.post("/register" , AuthCheck , adminCheck , SucureController.register);
router.post("/login",SucureController.login);
router.patch("/reset-password",AuthCheck,SucureController.resetPassword);
router.get("/users",AuthCheck ,SucureController.getAllUsers);

export default router;