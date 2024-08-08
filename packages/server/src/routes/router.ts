import { Router } from "express";
import TodoRouter from "./todo.routes";
import AuthRouter from "./auth.routes";
import UserRouter from "./user.routes";

import { isAuthenticated } from "../middlewares/auth.middle";

const router = Router();

router.use("/todo", isAuthenticated, TodoRouter);
router.use("/auth", AuthRouter);
router.use("/user", isAuthenticated, UserRouter);

export default router;
