import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import AddIncome from "../models/Add-Income.js";
import AddExpense from "../models/Add-Expense.js";
import Plan from "../models/Plan.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(409).json({ message: "Email or mobile already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, mobile, password: hashedPassword });

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/add-income", async (req, res) => {
  try {
    const { userId, incomeTitle, amount, date, category } = req.body;
    const normalizedTitle = incomeTitle?.trim();
    const normalizedAmount = Number(amount);

    if (!mongoose.isValidObjectId(userId) || !normalizedTitle || !Number.isFinite(normalizedAmount) || !date || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const addIncome = await AddIncome.create({
      userId,
      incomeTitle: normalizedTitle,
      amount: normalizedAmount,
      date,
      category,
    });

    return res.status(201).json({
      message: "Income added successfully.",
      income: { id: addIncome._id, incomeTitle: addIncome.incomeTitle, amount: addIncome.amount, date: addIncome.date, category: addIncome.category },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/incomes", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "A valid user is required." });
    }

    const incomes = await AddIncome.find({ userId });
    return res.status(200).json({ incomes });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/add-expense", async (req, res) => {
  try {
    const { userId, expenseTitle, amount, date, category } = req.body;
    const normalizedTitle = expenseTitle?.trim();
    const normalizedAmount = Number(amount);

    if (!mongoose.isValidObjectId(userId) || !normalizedTitle || !Number.isFinite(normalizedAmount) || !date || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const addExpense = await AddExpense.create({
      userId,
      expenseTitle: normalizedTitle,
      amount: normalizedAmount,
      date,
      category,
    });

    await Plan.updateMany({ userId, type: "Budget", category }, { $inc: { saved: normalizedAmount } });

    return res.status(201).json({
      message: "Expense added successfully.",
      expense: { id: addExpense._id, expenseTitle: addExpense.expenseTitle, amount: addExpense.amount, date: addExpense.date, category: addExpense.category },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/expenses", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "A valid user is required." });
    }

    const expenses = await AddExpense.find({ userId });
    return res.status(200).json({ expenses });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
