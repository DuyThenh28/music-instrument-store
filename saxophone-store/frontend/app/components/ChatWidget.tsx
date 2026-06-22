"use client";

import { useState } from "react";

interface ChatMessage {
  text: string;
  sender: "user" | "bot";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Xin chào! Shop có thể hỗ trợ gì cho bạn?",
      sender: "bot",
    },
    {
      text: "Bạn cần tư vấn loại Saxophone nào?",
      sender: "bot",
    },
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        text: userMessage,
        sender: "user",
      },
    ]);

    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          text: data.reply,
          sender: "bot",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "Xin lỗi, hiện tại không thể kết nối AI.",
          sender: "bot",
        },
      ]);
    }
  };

  return (
    <>
      <button
        className="chat-floating-btn"
        onClick={() => setOpen(!open)}
      >
        💬
        <span>1</span>
      </button>

      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <strong>Hỗ trợ khách hàng</strong>

            <button onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <p
                key={index}
                className={
                  msg.sender === "user"
                    ? "user-msg"
                    : "bot-msg"
                }
              >
                {msg.text}
              </p>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}