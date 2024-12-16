import { decryptToken, verifyToken } from "../utils/tokenUtil.js";

export const authenticateUser = async (req, res, next) => {
  console.log("Headers:", req.headers);
  console.log("Cookies object:", req.cookies); // Log cookies
  const token = req.cookies?.token;
  console.log("Extracted token:", token);

  if (!token) {
    console.error("No token found in cookies");
    return res.status(401).json({ msg: "Token not found" });
  }

  try {
    const decryptedToken = decryptToken(token);
    console.log("Decrypted token:", decryptedToken); // Log decrypted token

    const { userId, role } = verifyToken(decryptedToken);
    console.log("Verified user:", { userId, role }); // Log user details

    req.user = { userId, role };
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};
