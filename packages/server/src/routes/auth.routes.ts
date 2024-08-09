import { Router } from "express";

import AuthController from "../controllers/auth.controller";

import { isAuthenticated } from "../middlewares/auth.middle";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get("/logout", isAuthenticated, AuthController.logout);

router.get("/forgot", AuthController.forgotPassword); // sends mail that redirects to change password page and email
router.post("/email", AuthController.changeEmail); // sends mail for verification with user old email and new email embedded on jwt

router.get("/confirm", AuthController.confirmMail); // user old email parameter embedded in jwt

export default router;
