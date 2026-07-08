import React from "react";
import { X, RefreshCw, Loader2, MessageSquare, Send } from "lucide-react";
import type { Message } from "../types/index.js";
import { useChatStore } from "../stores/useChatStore.js";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  chatHistory: Message[];
  loadingChat: boolean;
  sendingMessage: boolean;
  chatMessage: string;
  setChatMessage: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  refetchChat: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  currentUser: any;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  listing,
  chatHistory,
  loadingChat,
  sendingMessage,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  refetchChat,
  chatEndRef,
  currentUser,
}) => {
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  if (!isOpen || !listing) return null;

  const isOnline = onlineUsers.includes(listing.seller.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-gray-800 rounded-2xl max-w-lg w-full h-[550px] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#0b0f19] border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {listing.seller.avatar ? (
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {listing.seller.name.charAt(0).toUpperCase()}
                </div>
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-slate-950" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-white">{listing.seller.name}</h3>
                {isOnline && (
                  <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-1 py-0.2 rounded">
                    <span>online</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 block leading-none mt-0.5 line-clamp-1">
                regarding: {listing.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetchChat}
              title="Refresh Chat"
              className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#0c111e]/30">
          {loadingChat ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : !chatHistory || chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5">
              <MessageSquare className="w-10 h-10 text-gray-600" />
              <p className="text-sm text-gray-400 font-semibold">Start the conversation</p>
              <p className="text-xs text-gray-500 max-w-[250px]">
                Send a message to ask about the account details, trade terms, or transfer details.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isOwn = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-800 text-gray-200 rounded-bl-none border border-gray-700/50"
                    }`}
                  >
                    <p className="break-words leading-relaxed">{msg.content}</p>
                    <span
                      className={`text-[9px] block mt-1.5 ${
                        isOwn ? "text-blue-200" : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="bg-[#0b0f19] border-t border-gray-800 p-4 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            disabled={sendingMessage}
            className="flex-grow bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 text-sm text-white px-4 py-2.5 rounded-xl disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sendingMessage || !chatMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 text-white p-2.5 rounded-xl transition-colors shrink-0"
          >
            {sendingMessage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
