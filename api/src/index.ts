import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as functions from "firebase-functions/v2";
import { AppController } from "./controllers/app.controller.js";
import { ApiKeyGuard } from "./guards/apiKey.guard.js";
import setFirebaseConfig from "./firebase/firebase.config.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

setFirebaseConfig();

const appController = new AppController();
app.use("/app", ApiKeyGuard.central, appController.router);

export const zetoApi = functions.https.onRequest(app);
