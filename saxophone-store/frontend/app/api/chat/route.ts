import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "Thiếu OPENAI_API_KEY trong file .env.local." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("API KEY:", process.env.OPENAI_API_KEY);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là nhân viên tư vấn bán Saxophone chuyên nghiệp của NhomTTTN Music. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({
      reply:
        completion.choices[0].message.content ||
        "Xin lỗi, tôi chưa có câu trả lời phù hợp.",
    });
  } catch (error) {
    console.error("Lỗi API Chat:", error);

    return NextResponse.json(
      {
        reply:
          "AI chưa kết nối được. Hãy kiểm tra API key, tài khoản OpenAI API hoặc terminal.",
      },
      { status: 500 }
    );
  }
}