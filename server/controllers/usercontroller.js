import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import generateToken from "../utils/genarateToken.js";

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
  }
  try {
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      message: "User created successfully",
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
    if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }
    try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    res.status(200).json({
      success:true,  
      message: "Login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//to get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("name email");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true, user});
    }
    catch (error) {
        console.error("Error fetching user profile:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Update user profile
// export const updateUserProfile = async (req, res) => {
//     const { name, email } = req.body;
//     if(!name || !email || !validator.isEmail(email)) {
//         return res.status(400).json({ success: false, message: "Invalid input data" });
//     }
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }
//         if (name) user.name = name;
//         if (email) {
//             if (email !== user.email && await User.findOne({ email })) {
//                 return res.status(400).json({ success: false, message: "Email already exists" });
//             }
//             user.email = email;
//         }
//         await user.save();
//         res.status(200).json({
//             success: true,
//             message: "User profile updated successfully",
//             name: user.name,
//             email: user.email,
//             token: generateToken(user._id),
//         });
//     } catch (error) {
//         console.error("Error updating user profile:", error.message);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

export const updateUserProfile = async (req, res) => {
    const { name, email } = req.body;

    if (!name && !email) {
        return res.status(400).json({
            success: false,
            message: "No data provided for update"
        });
    }

    if (email && !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) user.name = name;

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }

            user.email = email;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Error updating user profile:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// to change user password

export const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Invalid input data" });
    }
    try {
        const user = await User.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }   
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


