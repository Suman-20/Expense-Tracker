// import User from "../models/userModel.js";
// import jwt from "jsonwebtoken";



// const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")) {

//     token = req.headers.authorization.split(" ")[1];

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (error) {
//       res.status(401);
//       throw new Error("Not authorized");
//     }
//   }

//   if (!token) {
//     res.status(401);
//     throw new Error("No token");
//   }
// };

// export default protect;


import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "No token" });
  }
};

export default protect;