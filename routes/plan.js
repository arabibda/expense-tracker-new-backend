import express from "express";
import mongoose from "mongoose";
import Plan from "../models/Plan.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, name, type, target, saved, category, period, startDate, endDate, targetDate, alertAt, monthlyContribution, description, status } = req.body;

    if (!mongoose.isValidObjectId(userId) || !name?.trim() || (type !== "Goal" && type !== "Budget") || !Number.isFinite(Number(target)) || Number(target) <= 0) {
      return res.status(400).json({ message: "Name, type and a valid target amount are required." });
    }

    const plan = await Plan.create({
      userId,
      name: name.trim(),
      type,
      target: Number(target),
      saved: Number(saved) || 0,
      category: category || "",
      period: period || "",
      startDate: startDate || "",
      endDate: endDate || "",
      targetDate: targetDate || "",
      alertAt: Number(alertAt) || 80,
      monthlyContribution: Number(monthlyContribution) || 0,
      description: description || "",
      status: status || "Active",
    });

    return res.status(201).json({ message: "Plan saved successfully.", plan });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId, type } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "A valid user is required." });
    }

    const filter = { userId, ...(type ? { type } : {}) };
    const plans = await Plan.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ plans });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { userId, name, type, target, saved, category, period, startDate, endDate, targetDate, alertAt, monthlyContribution, description, status } = req.body;

    if (!mongoose.isValidObjectId(userId) || !name?.trim() || (type !== "Goal" && type !== "Budget") || !Number.isFinite(Number(target)) || Number(target) <= 0) {
      return res.status(400).json({ message: "Name, type and a valid target amount are required." });
    }

    const plan = await Plan.findByIdAndUpdate(
      { _id: req.params.id, userId },
      {
        name: name.trim(),
        type,
        target: Number(target),
        saved: Number(saved) || 0,
        category: category || "",
        period: period || "",
        startDate: startDate || "",
        endDate: endDate || "",
        targetDate: targetDate || "",
        alertAt: Number(alertAt) || 80,
        monthlyContribution: Number(monthlyContribution) || 0,
        description: description || "",
        status: status || "Active",
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.status(200).json({ message: "Plan updated successfully.", plan });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "A valid user is required." });
    }

    const plan = await Plan.findOneAndDelete({ _id: req.params.id, userId });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    return res.status(200).json({ message: "Plan deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
