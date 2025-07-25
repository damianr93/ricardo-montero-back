import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  razonSocial: {
    type: String,
    required: false,
  },
  CUIT: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  direccion: {
    type: String,
    required: false,
  },
  localidad: {
    type: String,
    required: false,
  },
  provincia: {
    type: String,
    required: false,
  },
  codigoPostal: {
    type: Number,
    requires: false,
  },
  img: {
    type: String,
  },
  role: {
    type: [String],
    default: ["USER_ROLE"],
    enum: ["ADMIN_ROLE", "USER_ROLE"],
  },

  emailValidated: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  approvalToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: String,
  },
  rejectedAt: {
    type: Date,
  },
  rejectedBy: {
    type: String,
  },
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete ret._id;
    delete ret.password;
    delete ret.approvalToken; 
  },
});

export const UserModel = mongoose.model("User", userSchema);
