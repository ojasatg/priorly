import { Router } from "express";
import TodoRouter from "./todo.routes";
import AuthRouter from "./auth.routes";
import UserRouter from "./user.routes";

const router = Router();

router.use("/todo", TodoRouter);
router.use("/auth", AuthRouter);
router.use("/user", UserRouter);

export default router;
