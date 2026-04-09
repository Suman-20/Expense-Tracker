import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";

// Create a new income entry

export const createIncome = async (req, res) => {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const newIncome = new incomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });
    await newIncome.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Income created successfully",
        data: newIncome,
      });
  } catch (err) {
    console.error("Error creating income:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//get all the income

export const getIncomes = async (req, res) => {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: income });
  } catch (err) {
    console.error("Error fetching incomes:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//update income

export const updateIncome = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount } = req.body;

  try {
    const updatedIncome = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      { description, amount },
      { new: true },
    );
    if (!updatedIncome) {
      return res
        .status(404)
        .json({ success: false, message: "Income not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Income updated successfully",
        data: updatedIncome,
      });
  } catch (err) {
    console.error("Error updating income:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//delete income
export const deleteIncome = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const deletedIncome = await incomeModel.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!deletedIncome) {
      return res
        .status(404)
        .json({ success: false, message: "Income not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Income deleted successfully" });
  } catch (err) {
    console.error("Error deleting income:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  to download the data  in an excel sheet

export const downloadIncomeExcel = async (req, res) => {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    const excelData = income.map((income) => ({
      Description: income.description,
      Amount: income.amount,
      Category: income.category,
      Date: income.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData); // Convert JSON data to worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income");
    XLSX.writeFile(workbook, "income_details.xlsx"); // Save the workbook as an Excel file
    res.download("income_details.xlsx"); // Download the Excel file
  } catch (err) {
    console.error("Error downloading income data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// to get the income overview

export const getIncomeOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query; // Get the date range from query parameters
    const { start, end } = getDateRange(range); // Get the start and end dates based on the range
    const incomes = await incomeModel
      .find({
        userId,
        date: { $gte: start, $lte: end }, // Filter income entries based on the date range
      })
      .sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;
    const recentTransactions = incomes.slice(0, 9);
    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range
        },
    });

  } catch (err) {
    console.error("Error fetching income overview:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
