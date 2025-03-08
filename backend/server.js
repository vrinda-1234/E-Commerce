import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; //to access cookie

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";

import {connectDB} from "./lib/db.js";
dotenv.config(); //allows you to read the content of env file

const app =express();
const PORT =process.env.PORT || 5000;


app.use(express.json()); //allows you to parse the body of request
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT,() =>{
    console.log("Server is running on port" + PORT);

    connectDB();
});



//PKWTWS8WeCwiB9mF