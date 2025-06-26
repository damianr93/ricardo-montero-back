import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    img: {
        type: String
    },
    role: {
        type: [String],
        default: ['USER_ROLE'],
        enum: ['ADMIN_ROLE', 'USER_ROLE']
    },

    emailValidated: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    approvalToken: {
        type: String,
        unique: true,
        sparse: true
    },
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: String
    },
    rejectedAt: {
        type: Date
    },
    rejectedBy: {
        type: String
    }
});

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.password;
        delete ret.approvalToken; // No exponer el token
    }
});

export const UserModel = mongoose.model('User', userSchema);