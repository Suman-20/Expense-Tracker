import express from "express";
import protect from "../middleware/auth.js";
import { createIncome, deleteIncome, downloadIncomeExcel, getIncomeOverview, getIncomes, updateIncome } from "../controllers/incomeController.js";



const incomeRouter = express.Router();

incomeRouter.post("/add",protect,createIncome);
incomeRouter.get("/get",protect,getIncomes);

incomeRouter.put("/update/:id",protect,updateIncome);
incomeRouter.get("/downloadexcel",protect,downloadIncomeExcel);
incomeRouter.delete("/delete/:id",protect,deleteIncome);
incomeRouter.get("/overview",protect,getIncomeOverview);

export default incomeRouter;

