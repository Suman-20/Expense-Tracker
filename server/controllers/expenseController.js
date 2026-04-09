import ExpenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dateFilter.js";
import XLSX from "xlsx";

//add expense
export const addExpense = async (req, res) => {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const newExpense = new ExpenseModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });
    await newExpense.save();
    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: newExpense,
    });
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all the expenses
export const getExpenses = async (req, res) => {
  const userId = req.user._id;
  try {
    const expense = await ExpenseModel.find({ userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//update expense
export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount } = req.body;
  try {
    const updatedExpense = await ExpenseModel.findByIdAndUpdate(
      { _id: id, userId },
      { description, amount },
      { new: true },
    );
    if (!updatedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Expense updated successfully",
        data: updatedExpense,
      });
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//delete expense

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const deletedExpense = await ExpenseModel.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!deletedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// download expenses

export const downloadExpensesExcel = async (req, res) => {
  const userId = req.user._id;
  try {
    const expenses = await ExpenseModel.find({ userId }).sort({ date: -1 });
    const excelData = expenses.map((expense) => ({
      Description: expense.description,
      Amount: expense.amount,
      Category: expense.category,
      Date: expense.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData); // Convert JSON data to worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "expenses_details.xlsx"); // Save the workbook as an Excel file
    res.download("expenses_details.xlsx"); // Download the Excel file
  } catch (err) {
    console.error("Error downloading expenses data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// overview

export const getExpenseOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query; // Get the date range from query parameters
    const { start, end } = getDateRange(range); // Get the start and end dates based on the range
    const expenses = await ExpenseModel
      .find({
        userId,
        date: { $gte: start, $lte: end }, // Filter expense entries based on the date range
      })
      .sort({ date: -1 });

    const totalExpense = expenses.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
    const numberOfTransactions = expenses.length;
    const recentTransactions = expenses.slice(0, 5);
    res.status(200).json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range
        },
    });

  } catch (err) {
    console.error("Error fetching expense overview:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

