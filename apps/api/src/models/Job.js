import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 50,
      maxlength: 30000,
    },

    requirements: {
      type: [String],
      default: [],
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "internship"],
      required: true,
    },

    workplace: {
      type: String,
      enum: ["onsite", "hybrid", "remote"],
      required: true,
    },

    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: "INR" },
      period: {
        type: String,
        enum: ["hourly", "monthly", "yearly"],
        default: "yearly",
      },
      isDisclosed: { type: Boolean, default: true },
    },

    experience: {
      minYears: { type: Number, min: 0, default: 0 },
      maxYears: { type: Number, min: 0, default: 0 },
    },

    status: {
      type: String,
      enum: ["draft", "published", "closed", "archived"],
      default: "draft",
      required: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    closesAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

jobSchema.index({ company: 1, status: 1, createdAt: -1 });
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ skills: 1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;