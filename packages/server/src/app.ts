import express from "express";
import mongoose from "mongoose";

import router from "./routes/router";

const app = express();

app.use(express.json());
app.use(router);

const PORT = process.env.PORT || 3010;
const MONGO_URI = String(process.env.MONGO_URI);

app.get("/test", (_req, res) => {
    res.send("Test successful!");
});

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
