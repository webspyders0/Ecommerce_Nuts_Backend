import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

// Create the token
export const createToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  console.log("token :", token);

  return token;
};

// Verify the token
export const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

// Encryption function
export const encryptToken = (token) => {
  const secretKey = process.env.ENCRYPTION_SECRET;
  try {
    const ciphertext = CryptoJS.AES.encrypt(token, secretKey).toString();
    return ciphertext;
  } catch (error) {
    console.error("Encryption Error:", error);
    throw new Error("Failed to encrypt the token");
  }
};

// Decryption function
export const decryptToken = (ciphertext) => {
  const secretKey = process.env.ENCRYPTION_SECRET;
  try {
    if (!ciphertext) throw new Error("No ciphertext provided for decryption");

    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalToken = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalToken)
      throw new Error(
        "Decryption failed, invalid secret key or altered ciphertext"
      );

    return originalToken;
  } catch (error) {
    console.error("Decryption Error:", error);
    throw new Error("Failed to decrypt the token");
  }
};
