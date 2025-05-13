const express = require("express");
const router = express.Router();
const { 
  sendApprovalNotification, 
  sendRejectionNotification 
} = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/approve", authenticate, authorize(['admin']), sendApprovalNotification);
router.post("/reject", authenticate, authorize(['admin']), sendRejectionNotification);

module.exports = router;