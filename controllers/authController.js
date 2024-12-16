import userModel from "../models/userModel.js";
import { comparePassword, hassPassword } from "../utils/passwordUtil.js";
import { createToken, encryptToken } from "../utils/tokenUtil.js";
import Admin from "../models/adminModel.js";

export const userRegister = async (req, res) => {
  try {
    const { userName, mobileNo, email, password, role } = req.body;
    // Set the role to "user" by default if it’s not specified as "admin"
    const userRole = role === "admin" ? "admin" : "user";
    // Hash the password before saving it to the database
    const hashedPassword = await hassPassword(password);
    // Check if the user already exists in the database
    const existingUser = await userModel.findOne({
      $or: [{ userName }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }
    // Create the user in the database
    const user = await userModel.create({
      userName,
      mobileNo,
      email,
      password: hashedPassword,
      role: userRole,
    });
    // Create a token for the user
    const token = createToken({ userId: user._id, role: user.role });
    // Encrypt the token and save it in the cookie
    console.log("token :", token);
    const encryptedToken = encryptToken(token);
    console.log(encryptedToken, " : --------- encrypted token ");

    res.cookie("token", encryptedToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    // Show the user details in the response without the password field
    const userInfo = await userModel
      .findById(user._id)
      .select("-password")
      .lean();
    res.status(201).json({ message: "User Created Successfully", userInfo });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    // Step 1: Check if the system is in maintenance mode
    const adminSettings = await Admin.findOne({});
    // if (adminSettings && adminSettings.mode === "underMaintenance") {
    //   return res.status(503).json({
    //     message: "The site is under maintenance. Please try again later.",
    //   });
    // }

    // Step 2: Find the user by email
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Step 3: Compare passwords
    const isValidUser = await comparePassword(req.body.password, user.password);
    if (!isValidUser) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Step 4: Create a JWT token for the user
    const token = createToken({ userId: user._id, role: user.role });

    // Step 5: Encrypt the token and save it in a cookie
    const encryptedToken = encryptToken(token);

    // Step 6: Send the token as a cookie in the response
    res.cookie("token", encryptedToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      // sameSite: "Strict", // Uncomment if needed to prevent CSRF
    });

    // Step 7: Respond with success and user data
    res.status(200).json({
      message: "User Logged In Successfully",
      encryptedToken,
      user,
    });
  } catch (error) {
    // Step 8: Handle any unexpected errors
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ msg: "Something went wrong. Please try again later." });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password, passkey } = req.body;
    // Check if passkey is correct
    if (passkey !== process.env.ADMIN_PASSKEY) {
      return res.status(400).json({ msg: "Invalid Passkey" });
    }
    // Find user by email
    const user = await userModel.findOne({ email });
    // Check if user exists and password is correct
    const isValidUser =
      user && (await comparePassword(password, user.password));
    if (!isValidUser) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    // Create token for the user
    const token = createToken({ userId: user._id, role: user.role });
    // Encrypt the token and save it in a cookie
    const encryptedToken = encryptToken(token);
    res.cookie("token", encryptedToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    // Respond with success and token
    res
      .status(200)
      .json({ message: "Admin Logged In Successfully", encryptedToken });
  } catch (error) {
    console.error("Error in adminLogin:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // res.clearCookie("token");
    res.cookie("token", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(200).json({ msg: "User Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
