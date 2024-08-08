import { Router } from "express";

import UserController from "../controllers/user.controller";

const router = Router();

router.post("/edit", UserController.edit);
router.delete("/remove", UserController.remove);

export default router;
