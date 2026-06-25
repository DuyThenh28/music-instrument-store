import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";

// Khởi tạo SDK (Không cần hardcode credentials, Lambda tự nhận IAM Role)
const lexClient = new LexRuntimeV2Client({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event) => {
  try {
    // API Gateway truyền body dưới dạng chuỗi JSON
    const body = JSON.parse(event.body);
    const { text, sessionId } = body;

    // Chuẩn bị tham số gọi Amazon Lex V2
    const params = {
      botId: process.env.LEX_BOT_ID,           // Set ở Environment Variables của Lambda
      botAliasId: process.env.LEX_BOT_ALIAS_ID, // Set ở Environment Variables
      localeId: "en_US",                       // Hoặc "vi_VN" nếu bot hỗ trợ
      sessionId: sessionId || "default-user-session",
      text: text,
    };

    const command = new RecognizeTextCommand(params);
    const lexResponse = await lexClient.send(command);

    // Lấy danh sách câu trả lời từ Lex
    const messages = lexResponse.messages?.map((msg) => msg.content) || [];

    // Trả về response cho API Gateway (Luôn nhớ trả header CORS)
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },    
      body: JSON.stringify({ messages }),
    };
  } catch (error) {
    console.error("Lỗi khi gọi Amazon Lex:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Trợ lý hiện không thể phản hồi. Vui lòng thử lại sau." }),
    };
  }
};