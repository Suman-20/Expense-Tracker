import express from "express";
import protect from "../middleware/auth.js";
import { addExpense, deleteExpense, downloadExpensesExcel, getExpenseOverview, getExpenses, updateExpense } from "../controllers/expenseController.js";


const expenseRouter = express.Router();


expenseRouter.post("/add", protect,addExpense);
expenseRouter.get("/get", protect, getExpenses);
expenseRouter.put("/update/:id", protect, updateExpense);
expenseRouter.delete("/delete/:id", protect, deleteExpense);
expenseRouter.get("/downloadexcel", protect, downloadExpensesExcel);
expenseRouter.get("/overview", protect, getExpenseOverview);

export default expenseRouter;



