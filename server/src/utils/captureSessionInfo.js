import axios from "axios";

export async function captureSessionInfo(req) {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const userAgent = req.headers["user-agent"] || "Unknown Device";

  let location = "Unknown Location";
  try {
    if (ipAddress && ipAddress !== "::1") {
      // Ignore localhost
      const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
      if (response.data.status === "success") {
        location = `${response.data.city}, ${response.data.country}`;
      }
    }
  } catch (error) {
    console.error("IP Lookup failed:", error.message);
  }

  return {
    ipAddress,
    deviceInfo: userAgent,
    location,
  };
}
