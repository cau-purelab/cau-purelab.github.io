// app/api/check-ip/route.ts
export const dynamic = 'force-dynamic'; // 캐싱 방지

export async function GET() {
  try {
    // 공인 IP를 텍스트로 반환해주는 신뢰할 수 있는 서비스들
    // 1. https://checkip.amazonaws.com (AWS 제공)
    // 2. https://api.ipify.org (가장 유명한 서비스)
    const response = await fetch('https://checkip.amazonaws.com');
    const ip = await response.text();

    return Response.json({ 
      success: true,
      current_outbound_ip: ip.trim(), // 화이트스페이스 제거
      note: "이 IP는 Vercel의 유동 IP이므로 요청 시점에 따라 변경될 수 있습니다."
    });
  } catch (error) {
    return Response.json({ success: false, error: "IP 조회 실패" }, { status: 500 });
  }
}
