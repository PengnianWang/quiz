import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { status } = body;
    
    if (status === '1') {
      // 支付成功，给用户加积分
      // 实际应查询 Supabase 并更新余额
      return NextResponse.json({ code: 'success' });
    }
    
    return NextResponse.json({ code: 'fail' });
    
  } catch {
    return NextResponse.json({ code: 'fail' });
  }
}
