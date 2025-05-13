const sendEmail = require("./utils/sendEmail");

sendEmail("admin-email@example.com", "Test Email", "<h3>Testing Email Sending</h3>")
  .then(() => console.log("Test email sent!"))
  .catch((err) => console.error("Error:", err));
