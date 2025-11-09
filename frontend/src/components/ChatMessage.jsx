import React from "react";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-start gap-3 max-w-[70%] ${
          message.type === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center 
          ${
            message.type === "user"
              ? "bg-pink-500/20 border-2 text-2x border-pink-400/50"
              : "bg-blue-500/20 border-2 border-blue-400/50"
          }`}
        >
          {message.type === "user" ? (
            <User size={25} className="text-pink-400" />
          ) : (
            <div className="relative">
              <Bot size={30} className="text-blue-400" />
              <span className="absolute -top-2 -right-2 text-lg">
                {message.emoji}
              </span>
            </div>
          )}
        </div>
        <div
          className={`rounded-2xl p-4 ${
            message.type === "user"
              ? "bg-pink-500/20 text-pink-100 border-2 border-pink-400/30"
              : "bg-blue-500/20 text-blue-100 border-2 border-blue-400/30"
          } shadow-lg hover:shadow-xl transition-shadow`}
        >
          {message.type === "ai" ? (
            <ReactMarkdown 
              className="text-sm font-medium prose prose-invert prose-sm max-w-none"
              components={{
                p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                li: ({children}) => <li className="mb-1">{children}</li>,
                strong: ({children}) => <strong className="font-bold text-blue-200">{children}</strong>
              }}
            >
              {message.content.replace(/&#39;/g, "'").replace(/&amp;/g, "&")}
            </ReactMarkdown>
          ) : (
            <p className="text-sm font-medium">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
