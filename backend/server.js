import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import planRoutes from "./routes/plan.js";

// Local/ISP DNS refuses SRV queries needed by mongodb+srv:// URIs.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const app = express();
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Missing MONGO_URI. Create a .env file and add your MongoDB connection string.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
