import { Router } from "express";

import UserController from "../controllers/user.controller";

const router = Router();

router.post("/edit", UserController.edit);

export default router;
