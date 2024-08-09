import { Router } from "express";

import AuthController from "../controllers/auth.controller";

import { isAuthenticated } from "../middlewares/auth.middle";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get("/logout", isAuthenticated, AuthController.logout);

router.get("/confirm", AuthController.confirmMail); // user email parameter embedded in jwt
router.get("/forgot", AuthController.forgotPassword); // sends mail that redirects to change password page
router.post("/passwd", AuthController.changePassowrd);

export default router;
