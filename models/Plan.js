import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Goal", "Budget"],
      required: true,
    },
    target: {
      type: Number,
      required: true,
    },
    saved: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: "",
    },
    period: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    targetDate: {
      type: String,
      default: "",
    },
    alertAt: {
      type: Number,
      default: 80,
    },
    monthlyContribution: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
