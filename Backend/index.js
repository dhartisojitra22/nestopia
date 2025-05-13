const express = require("express");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute");
const passwordRoutes = require("./routes/passwordRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const AgentRoutes = require("./routes/AgentRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const contactRoutes=require("./routes/contactRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes");
const connectMongoDB = require("./config/connection");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes=require("./routes/notificationRoutes")
const chatbotRoutes = require('./routes/chatbotRoutes');

const cors = require("cors");
const path = require("path");
require("dotenv").config();



const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3001"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));


// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/user", userRoutes);
app.use("/user/password", passwordRoutes);
app.use('/api/agent', AgentRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications",notificationRoutes)
app.use("/api/bookings", bookingRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Database Connection & Server Start
connectMongoDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("❌ Server failed to start:", error);
    });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: "Error in server",
        error: err.message
    });
});
