// api/check-ip.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // AWS 서비스를 이용해 현재 Vercel 서버의 공인 IP 확인
    const res = await fetch('https://checkip.amazonaws.com');
    const ip = await res.text();

    return response.status(200).json({
      success: true,
      current_outbound_ip: ip.trim(),
      env: "Vercel Serverless Function (Vite Project)"
    });
  } catch (error) {
    return response.status(500).json({ success: false, error: "IP 조회 실패" });
  }
}
