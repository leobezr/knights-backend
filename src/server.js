import express from "express";
import cors from "cors";
import path from "path";

import Routes from "./route.js";

import mongo from "mongodb";
import assert from "assert";

const app = express();

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