import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const conn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();

const admin = conn.db.admin();
const { databases } = await admin.listDatabases();
console.log("Databases:", databases.map((d) => d.name));

const expenseDb = conn.useDb("Expense-Tracker");
const collections = await expenseDb.db.listCollections().toArray();
console.log(`Collections in "Expense-Tracker":`, collections.map((c) => c.name));

const users = await expenseDb.collection("users").find().toArray();
console.log(`Users in Expense-Tracker.users:`, users.length);

const testDb = conn.useDb("test");
const testUsers = await testDb.collection("users").find().toArray();
console.log(`Users in test.users:`, testUsers.length);

await conn.close();
