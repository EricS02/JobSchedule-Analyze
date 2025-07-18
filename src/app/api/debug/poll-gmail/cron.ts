// const fetch = require("node-fetch");

const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const API_URL = process.env.POLL_GMAIL_API_URL || "http://localhost:3000/api/debug/poll-gmail";

async function pollGmail() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      console.error("Poll Gmail failed:", await res.text());
    } else {
      console.log("Poll Gmail succeeded:", await res.text());
    }
  } catch (err) {
    console.error("Poll Gmail error:", err);
  }
}

console.log(`Starting Gmail polling every 15 minutes at ${API_URL}`);
setInterval(pollGmail, POLL_INTERVAL_MS);
pollGmail(); // Run immediately on start 