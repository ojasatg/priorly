import { Router } from "express";

import UserController from "../controllers/user.controller";

const router = Router();

router.post("/edit", UserController.edit);
router.delete("/remove", UserController.remove);
router.post("/passwd", UserController.changePassword);

export default router;
