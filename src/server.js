import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import Routes from "./route.js";
import { updateDB } from "./config/databaseUpdate.js"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Socket from "./websocket/socket.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use(cors({
   origin: "*",
   optionsSuccessStatus: 200
}));

app.get('/', (req, res) => {
   res.sendFile(__dirname + "/public/index.html");
});

app.use(express.static(path.join(__dirname, "/public")));

await mongoose.connect(process.env.MONGO_SERVER, {
   poolSize: 10,
   useNewUrlParser: true,
   useUnifiedTopology: true ,
   autoIndex: false,
});

// Websocket
Socket(app, PORT);

// Sets routes
Routes(app);

// Update DB
updateDB();
