import { Router } from "express";
import * as UserController from "../../controllers/user.controller";

const router = Router();

router.put("/me",       UserController.updateMe);
router.put("/me/senha", UserController.changePassword);

export default router;
