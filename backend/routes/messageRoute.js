import express from "express";
import { editMessage, getMessage, sendMessage, unsendMessage } from "../controllers/messageController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/send/:id").post(isAuthenticated,sendMessage);
router.route("/:id")
    .get(isAuthenticated, getMessage)
    .patch(isAuthenticated, editMessage)
    .delete(isAuthenticated, unsendMessage);

export default router;