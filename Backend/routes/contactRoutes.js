const express = require("express");
const router = express.Router();
const { sendContactEmail ,getAllMessages,replyToUser,deleteMessage} = require("../controllers/contactController");

router.post("/contact-admin", sendContactEmail);

// GET: Get all messages
router.get("/messages", getAllMessages);

// POST: Reply to a message
router.post("/reply/:id", replyToUser);

router.delete("/messages/:id", deleteMessage);
module.exports = router;