import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { amount, points } = await req.json();
    
    const EPAY_MCHID = process.env.EPAY_MCHID;
    const EPAY_KEY = process.env.EPAY_KEY;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.vercel.app';
    
    if (!EPAY_MCHID || !EPAY_KEY) {
      return NextResponse.json({ error: '支付未配置' }, { status: 500 });
    }
    
    const orderId = `QZ${Date.now()}${Math.random().toString(36).substr(2, 6)}`;
    
    const params: any = {
      mch_id: EPAY_MCHID,
      out_trade_no: orderId,
      total_fee: amount * 100,
      body: `刷题本积分充值 ${points}点`,
      notify_url: `${BASE_URL}/api/payment/callback`,
      return_url: `${BASE_URL}/recharge?success=1`,
      timestamp: Math.floor(Date.now() / 1000),
    };
    
    const signStr = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + `&key=${EPAY_KEY}`;
    params.sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
    
    return NextResponse.json({
      success: true,
      orderId,
      params,
      message: '请配置易支付 API 地址后使用',
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
