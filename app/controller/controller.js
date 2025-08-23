import dotenv from "dotenv";
dotenv.config();
import User from "../model/userModel.js";
import sendMail from "../middleware/sendMail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

class SecureController {
    async register(req, res) {
        try {
            const { name, email } = req.body;
            if (!email || !name) {
                return res.status(400).json({ message: "Email and name are required" });
            }

            const tempPassword = crypto.randomBytes(6).toString("hex");

            const hashedPassword = await bcrypt.hash(tempPassword, 10);

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
            let { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            email = email.trim();
            password = password.trim();

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // check password
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            console.log("👉 Entered Password:", password);
            console.log("👉 Stored Hash:", user.password);
            console.log("👉 Match Result:", isPasswordMatch);

            if (!isPasswordMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // generate token
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });

            res.status(200).json({
                message: "Login successful",
                user: { id: user._id, email: user.email },
                token,
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    async resetPassword(req, res) {
        return res.status(200).json({ message: "Reset password API not implemented yet" });
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.find({});
            res.status(200).json({ message: "Users fetched successfully", data: users });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default new SecureController();
