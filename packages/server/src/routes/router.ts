import { Router } from "express";
import todoRouter from "./todo.routes";

const router = Router();

router.use("/todo", todoRouter);

export default router;
