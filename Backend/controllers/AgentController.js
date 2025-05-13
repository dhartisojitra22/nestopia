const Agent = require('../models/AgentModel');

// Get all agents
exports.getAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agents.' });
  }
};

// Add a new agent
exports.addAgent = async (req, res) => {
  try {
    const { name, designation, facebookUsername } = req.body;

    // Check if Multer uploaded an image
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    // Construct the image path
    const img = `/uploads/${req.file.filename}`;

    // Check required fields
    if (!name || !designation) {
      return res.status(400).json({ message: 'Name and designation are required.' });
    }

    // Create new agent
    const newAgent = new Agent({ name, designation, img, facebookUsername });

    // Save to database
    await newAgent.save();

    res.status(201).json({ message: 'Agent added successfully!', agent: newAgent });
  } catch (error) {
    console.error('Error adding agent:', error);
    res.status(500).json({ message: 'Error adding agent.' });
  }
};

// Delete an agent
exports.deleteAgent = async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting agent.' });
  }
};
