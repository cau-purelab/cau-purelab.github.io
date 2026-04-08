export default async function handler(req, res) {
  try {
    const response = await fetch('https://checkip.amazonaws.com');
    const ip = await response.text();
    res.status(200).json({ current_outbound_ip: ip.trim() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch IP" });
  }
}
