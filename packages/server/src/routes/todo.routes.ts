import { Router } from "express";

import TodoController from "../controllers/todo.controller";

const router = Router();

router.post("/create", TodoController.create);
router.get("/details", TodoController.details);
router.get("/all", TodoController.all);
router.put("/edit", TodoController.edit);
router.delete("/remove", TodoController.remove);
router.get("/count", TodoController.count);

export default router;
