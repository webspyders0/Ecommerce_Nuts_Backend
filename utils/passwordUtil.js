import bcrypt from "bcryptjs";

// to hasing the password while register
export const hassPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// to compare the password while user try to login
export const comparePassword = async (password, hassPassword) => {
  const isMatch = await bcrypt.compare(password, hassPassword);
  return isMatch;
};
