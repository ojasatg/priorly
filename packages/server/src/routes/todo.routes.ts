import { Router } from "express";

import TodoController from "../controllers/todo.controller";

const router = Router();

router.get("/details", TodoController.details);
router.post("/create", TodoController.create);
router.post("/all", TodoController.all);
router.post("/count", TodoController.count);
router.put("/edit", TodoController.edit);
router.delete("/remove", TodoController.remove);

export default router;
