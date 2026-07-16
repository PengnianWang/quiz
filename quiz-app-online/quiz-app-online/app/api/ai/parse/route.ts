import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 });
    }
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的教育助手，帮助解析题目并给出详细答案和解析。请用中文回答。'
          },
          {
            role: 'user',
            content: `请解析以下题目：\n\n${question}\n\n请给出：1. 正确答案 2. 详细解析 3. 相关知识点`
          }
        ],
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    const pointsCost = Math.max(50, Math.ceil(totalTokens * 0.05));
    
    return NextResponse.json({
      success: true,
      answer: data.choices?.[0]?.message?.content,
      tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
      pointsCost,
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
