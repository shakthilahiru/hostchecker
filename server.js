const express = require("express");
const cors = require("cors");
const whois = require("whois-json");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for Render

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to check hosting provider
app.get("/api/check-host", async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required!" });
  }

  try {
    // Perform a WHOIS lookup
    const whoisData = await whois(domain);

    // Fetch additional IP information (optional)
    let ipInfo = {};
    if (whoisData.address) {
      try {
        const response = await axios.get(`https://ipinfo.io/${whoisData.address}/json`);
        ipInfo = response.data;
      } catch (err) {
        console.warn("Error fetching IP info:", err.message);
      }
    }

    // Send response with hosting provider details
    res.json({
      domain: domain,
      hostingProvider: whoisData.org || "Not Available",
      ipAddress: whoisData.address || "Not Available",
      location: ipInfo.city
        ? `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`
        : "Not Available",
    });
  } catch (error) {
    console.error("Error during WHOIS lookup:", error.message);
    res.status(500).json({ error: "Error fetching domain data." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
