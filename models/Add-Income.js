import mongoose from "mongoose";

const addIncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    incomeTitle: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    
     date: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("addIncome", addIncomeSchema);
