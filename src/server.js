import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import Routes from "./route.js";

const app = express();

dotenv.config();

// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use(cors({
   origin: "*",
   optionsSuccessStatus: 200
}));

app.use(express.static(path.join(__dirname, "/public")));

app.listen(3333);

// Sets routes
Routes(app);