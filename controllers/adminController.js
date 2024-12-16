import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import { comparePassword, hassPassword } from "../utils/passwordUtil.js";

export const updateAdmin = async (req, res) => {
  try {
    const updates = req.body;
    const currentUser = req.user;

    // Check if the authenticated user is an admin
    if (currentUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const {
      email,
      password,
      adminAddress,
      siteTitle,
      currencyType,
      taxRate,
      shippingThreshold,
      mode,
      discountApplicableAmount,
      discountInRupees,
      discountCoupon,
    } = updates;

    // Find the admin in the Admin model
    let adminEntry = await Admin.findOne({ email });

    // Find the user in the User model
    let relatedUser = await User.findOne({ email });

    // If user exists, use the user's data to fill in missing fields
    if (relatedUser) {
      updates.adminName = updates.adminName || relatedUser.userName;
      updates.contactNumber = updates.contactNumber || relatedUser.mobileNo;
    }

    if (!adminEntry) {
      // If no admin found, create a new Admin entry
      adminEntry = new Admin({
        adminName: updates.adminName,
        email,
        contactNumber: updates.contactNumber,
        password: password ? await hassPassword(password) : undefined,
        adminAddress,
        siteTitle,
        currencyType,
        taxRate,
        shippingThreshold,
        mode: mode || "allowUserLogin",
        discountApplicableAmount: discountApplicableAmount || 2000,
        discountInRupees: discountInRupees || 100,
        discountCoupon: discountCoupon || "DRY50",
      });

      await adminEntry.save();

      // If no user is found, create a new user as well
      if (!relatedUser) {
        relatedUser = new User({
          userName: updates.adminName,
          email,
          mobileNo: updates.contactNumber,
          password: password ? await hassPassword(password) : undefined,
          role: "admin",
        });

        await relatedUser.save();
      }

      return res.status(201).json({
        message: "Admin created successfully",
        admin: adminEntry,
      });
    } else {
      // If admin exists, update the admin
      if (password) {
        updates.password = await hassPassword(password);
      }

      // Update discount fields explicitly
      updates.discountApplicableAmount =
        discountApplicableAmount || adminEntry.discountApplicableAmount;
      updates.discountInRupees =
        discountInRupees || adminEntry.discountInRupees;
      updates.discountCoupon = discountCoupon || adminEntry.discountCoupon;

      // Update the existing Admin entry
      const updatedAdmin = await Admin.findByIdAndUpdate(
        adminEntry._id,
        updates,
        { new: true }
      );

      // If the User entry exists, update the shared fields
      if (relatedUser) {
        relatedUser.userName = updates.adminName || relatedUser.userName;
        relatedUser.mobileNo = updates.contactNumber || relatedUser.mobileNo;
        if (password) {
          relatedUser.password = await hassPassword(password);
        }
        await relatedUser.save();
      }

      return res.status(200).json({
        message: "Admin updated successfully",
        admin: updatedAdmin,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating admin", error: error.message });
  }
};

// {
//   "adminName": "admin",
//   "email": "admin@example.com",
//   "contactNumber": "1234567890",
//   "password": "secret123",
//   "adminAddress": "456 Admin Street",
//   "siteTitle": "New E-Commerce Site",
//   "currencyType": "USD",
//   "taxRate": 20,
//   "shippingThreshold": 100,
//   "whatsappNumber":"1234567890"
// }

export const updateMode = async (req, res) => {
  try {
    const { mode } = req.body; // 'allowUserLogin' or 'underMaintenance'
    const currentUser = req.user; // Get the current authenticated user from middleware

    // Ensure the current user is an admin
    if (currentUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Validate the mode input
    if (!["allowUserLogin", "underMaintenance"].includes(mode)) {
      return res.status(400).json({ message: "Invalid mode" });
    }

    // Update only the 'mode' field in the Admin model
    const updatedAdmin = await Admin.findOneAndUpdate(
      {}, // Assuming a single Admin settings document
      { $set: { mode } }, // Use $set to update only the mode field
      { new: true } // Return the updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin settings not found" });
    }

    res.status(200).json({
      message: `System mode updated to ${mode}`,
      mode: updatedAdmin.mode,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating mode", error: error.message });
  }
};

// Update admin password
export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params; // Admin ID from URL
    const { currentPassword, newPassword } = req.body; // Existing and new passwords from request body

    // Fetch admin by ID
    const admin = await User.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Compare existing password using your utility function
    const isMatch = await comparePassword(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect current password" });
    }

    // Hash the new password using your utility function
    admin.password = await hassPassword(newPassword);

    // Save the updated admin document
    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
