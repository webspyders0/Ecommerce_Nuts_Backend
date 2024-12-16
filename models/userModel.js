    import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: String,
        required: true,
    },
    address: [
        {
            street: String,
            city: String,
            state: String,
            pinCode: String,
            country: String,
        }
    ],
    profileImage: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    orderHistory: [
        {
            orderId: mongoose.Schema.Types.ObjectId, //011
            items: [
                {
                    productId: mongoose.Schema.Types.ObjectId,
                    quantity: Number,
                }
            ],
            totalAmount: Number,
            status: {
                type: String,
                enum: ['pending', 'shipped', 'delivered', 'cancelled'],
                default: 'pending',
            },
            date: { type: Date, default: Date.now }
        }
    ],
    wishlist: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            addedAt: { type: Date, default: Date.now }
        }
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    otp: { type: String },
    otpExpiresAt: { type: Date },
}, {
    timestamps: true
});

export default mongoose.model("User", UserSchema);
