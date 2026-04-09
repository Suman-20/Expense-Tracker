import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/mongo.js";
import UserRoute from "./routes/userRoute.js";
import Incomeroute from "./routes/incomeRoute.js";
import ExpenseRoute from "./routes/expenseRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";



const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}));

app.use(express.json());
app.use (express.urlencoded({ extended: true }));

app.use("/api/user", UserRoute);
app.use("/api/income",Incomeroute);
app.use("/api/expense",ExpenseRoute); 
app.use("/api/dashboard", dashboardRoute);


app.get('/ping', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
}).catch((error) => {
    console.error('Failed to start server:', error.message);
});





