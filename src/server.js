import express from "express";
import cors from "cors";

import Routes from "./route.js";

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use(cors({
   origin: "*",
   optionsSuccessStatus: 200
}));

app.listen(3333);

// Sets routes
Routes(app);