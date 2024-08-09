import { Router } from "express";

import AuthController from "../controllers/auth.controller";

import { isAuthenticated } from "../middlewares/auth.middle";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get("/logout", isAuthenticated, AuthController.logout);

export default router;
