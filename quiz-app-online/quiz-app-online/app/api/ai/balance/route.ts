import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    platform: 'deepseek',
    balance: null,
    message: 'DeepSeek 暂不提供余额查询接口。平台会根据实际调用扣减你的积分。',
  });
}
