import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    storageKey: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      enum: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      required: true,
    },

    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
      max: 10 * 1024 * 1024,
    },

    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      required: true,
    },

    extractedText: {
      type: String,
      select: false,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

resumeSchema.index({ candidate: 1, createdAt: -1 });
resumeSchema.index({ candidate: 1, isDefault: 1 });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
