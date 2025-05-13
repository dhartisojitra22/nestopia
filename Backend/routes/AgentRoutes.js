const express = require('express');
const router = express.Router();
const agentController = require('../controllers/AgentController');
const upload = require("../middleware/multer_config");

// Get all agents
router.get('/get', agentController.getAgents);

// Add a new agent (image uploaded using Multer)
router.post('/add', upload.single("img"), agentController.addAgent);

// Delete an agent by ID
router.delete('/:id', agentController.deleteAgent);

module.exports = router;
