import mongoose from "mongoose";

const addExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expenseTitle: {
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

export default mongoose.model("addExpense", addExpenseSchema);
