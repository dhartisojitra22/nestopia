const nodemailer = require("nodemailer");
require("dotenv").config();
const Message = require('../models/contactModel')

// Create transporter once
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendContactEmail = async(req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        return res.status(500).json({ error: "Admin email is not configured." });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: `New Contact Request from ${name}`, // ✅ Fixed
            text: `You have received a new message:

Name: ${name}
Email: ${email}

Message:
${message}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email. Please try again." });
    }
};

const getAllMessages = async (req, res) => {
    try {
      const messages = await Message.find().sort({ date: -1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).send("Failed to fetch messages");
    }
  };
  
const replyToUser = async (req, res) => {
    const { id } = req.params;
    const { replyMessage } = req.body;
  
    try {
      const message = await Message.findById(id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Send email to user
      await transporter.sendMail({
        from: process.env.MY_EMAILs,
        to: process.env.EMAIL_USER,
        subject: "Reply to your message from Real Estate Management",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Reply to your message</h2>
            <p>Dear ${message.name},</p>
            <p>Thank you for contacting us. Here is our response to your message:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">${replyMessage}</p>
            </div>
            <p>Best regards,<br>Real Estate Management Team</p>
          </div>
        `,
      });
  
      // Update message status
      message.replied = true;
      message.reply = replyMessage;
      await message.save();
  
      res.status(200).json({ message: "Reply sent successfully" });
    } catch (error) {
      console.error("Error sending reply:", error);
      res.status(500).json({ error: "Error sending reply: " + error.message });
    }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

module.exports = { sendContactEmail ,getAllMessages , replyToUser, deleteMessage};

