import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import router from "./routes/router";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

const PORT = process.env.PORT || 3120;
const MONGO_URI = String(process.env.MONGO_URI);

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.info("MongoDB connected");
        app.listen(PORT, () => {
            console.info(`Server started: Listening on PORT: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(error);
        console.error(
            "Error connecting to MongoDB. Please check your connection string in .env file.",
        );
    });
