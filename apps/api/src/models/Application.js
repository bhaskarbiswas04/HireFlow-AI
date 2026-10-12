import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    resumeSnapshot: {
      originalName: { type: String, required: true },
      storageKey: { type: String, required: true },
      version: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: [
        "applied",
        "screening",
        "interview",
        "offer",
        "hired",
        "joined",
        "rejected",
        "dropped",
      ],
      default: "applied",
      required: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: "",
    },

    matchAnalysis: {
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },

      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      matchedSkills: {
        type: [String],
        default: [],
      },

      missingSkills: {
        type: [String],
        default: [],
      },

      explanation: {
        type: String,
        maxlength: 5000,
        default: "",
      },

      analyzedAt: {
        type: Date,
        default: null,
      },
    },

    appliedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// A candidate can apply only once to a particular job.
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

applicationSchema.index({ company: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ candidate: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
