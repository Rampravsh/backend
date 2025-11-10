import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(registerUser)

router.route("/test").get((_, res) => {
    res.send("<h1>Api is working</h1>");
  });

export default router;
