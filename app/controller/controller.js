import dotenv from "dotenv";
dotenv.config();
import User from "../model/userModel.js";
import sendMail from "../middleware/sendMail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { comparePassword, hsahePassword } from "../middleware/authCheck.js";

class SecureController {
    async register(req, res) {
        try {
            const { name, email } = req.body;
            if (!email || !name) {
                return res.status(400).json({ message: "Email and name are required" });
            }

            const tempPassword = crypto.randomBytes(6).toString("hex");

            const hashedPassword = await hsahePassword(tempPassword);

            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
            });

            // send mail with plain password
            await sendMail(
                email,
                "Welcome to SecurePulse",
                `
                <h1>Your account has been created</h1><br/>
                <p>Your temporary password is: <code>${tempPassword}</code></p><br/>
                <p>Please change your password after logging in.</p><br/>
                <a href="http://localhost:5000/api/login">Login Here</a>
                `
            );

            res.status(201).json({
                message: "User registered successfully",
                data: newUser,
                sendMail: "Email sent successfully",
            });

        } catch (error) {
            console.error("Register Error:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }


    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            // Find the user by email
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Create JWT token
            const token = jwt.sign(
                { userId: user._id, email: user.email , role: user.role },
                process.env.JWT_SECRET, 
                { expiresIn: '1h' } 
            );

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const hashedPassword = await hsahePassword(password);
            user.password = hashedPassword;
            await user.save();
            res.status(200).json({ message: "Password reset successful" });
            
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.find().select("-password");
            res.status(200).json({ message: "Users fetched successfully", data: users });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default new SecureController();
