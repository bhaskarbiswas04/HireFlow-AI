import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "recruiter"],
      required: true,
      default: "recruiter",
    },

    status: {
      type: String,
      enum: ["active", "invited", "suspended"],
      default: "active",
      required: true,
    },

    joinedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    logoUrl: {
      type: String,
      default: "",
    },

    industry: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    memberships: {
      type: [membershipSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

companySchema.index({ slug: 1 }, { unique: true });
companySchema.index({ "memberships.user": 1 });

const Company = mongoose.model("Company", companySchema);

export default Company;
