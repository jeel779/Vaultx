import React from "react";
import { Loader2, MessageSquare, RefreshCw, Send } from "lucide-react";
import type { Conversation, Message } from "../types/index.js";
import { useChatStore } from "../stores/useChatStore.js";

interface DashboardConversationsProps {
  loadingConversations: boolean;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conv: Conversation | null) => void;
  refetchChat: () => void;
  loadingChat: boolean;
  chatHistory: Message[];
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: (e: React.FormEvent) => void;
  chatMessage: string;
  setChatMessage: (val: string) => void;
  sendingMessage: boolean;
  currentUser: any;
}

const DashboardConversations: React.FC<DashboardConversationsProps> = ({
  loadingConversations,
  conversations,
  selectedConversation,
  setSelectedConversation,
  refetchChat,
  loadingChat,
  chatHistory,
  chatEndRef,
  handleSendMessage,
  chatMessage,
  setChatMessage,
  sendingMessage,
  currentUser,
}) => {
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  if (loadingConversations) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-800 bg-slate-900/10 rounded-2xl">
        <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">No chat conversations yet.</p>
        <p className="text-xs text-gray-500 mt-1">When buyers contact you about listings, the chats will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-855 bg-[#111827]/10 rounded-2xl overflow-hidden h-[500px]">
      {/* Threads Sidebar */}
      <div className="col-span-1 border-r border-gray-855 overflow-y-auto divide-y divide-gray-855 bg-slate-955/10">
        {conversations.map((conv) => {
          const isSelected = selectedConversation?.otherUser.id === conv.otherUser.id && selectedConversation?.listing.id === conv.listing.id;
          const isOnline = onlineUsers.includes(conv.otherUser.id);
          return (
            <button
              key={`${conv.otherUser.id}-${conv.listing.id}`}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full text-left p-4 flex gap-3 transition-colors ${
                isSelected ? "bg-slate-900/70 border-l-4 border-l-blue-500" : "hover:bg-slate-900/25"
              }`}
            >
              <div className="relative shrink-0">
                {conv.otherUser.avatar ? (
                  <img src={conv.otherUser.avatar} alt={conv.otherUser.name} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    {conv.otherUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c101d]" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-white truncate">{conv.otherUser.name}</h4>
                  <span className="text-[9px] text-gray-500 shrink-0">
                    {new Date(conv.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5">Re: {conv.listing.title}</p>
                <p className="text-xs text-gray-400 truncate mt-1">{conv.content}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat messages box */}
      <div className="col-span-2 flex flex-col justify-between h-full bg-[#0c111e]/10">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-[#0b0f19]/70 border-b border-gray-850 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{selectedConversation.otherUser.name}</h3>
                  {onlineUsers.includes(selectedConversation.otherUser.id) ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-gray-500 bg-slate-800/40 border border-slate-700/20 px-1.5 py-0.5 rounded">
                      <span>Offline</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-blue-400 leading-none block mt-1">
                  Listing: {selectedConversation.listing.title} (₹{selectedConversation.listing.price})
                </span>
              </div>
              <button
                onClick={refetchChat}
                title="Refresh Messages"
                className="text-gray-400 hover:text-white p-1 rounded-md"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {loadingChat ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                chatHistory?.map((msg) => {
                  const isOwn = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-slate-800 text-gray-200 rounded-bl-none border border-gray-700/50"
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <span className={`text-[8px] block mt-1.5 text-right ${isOwn ? "text-blue-200" : "text-gray-550"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Form Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-855 bg-[#0b0f19]/70 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={sendingMessage}
                className="flex-grow bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 text-sm text-white px-4 py-2.5 rounded-xl disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sendingMessage || !chatMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors shrink-0 flex items-center justify-center"
              >
                {sendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-2">
            <MessageSquare className="w-12 h-12 text-gray-700" />
            <p className="font-semibold text-sm">Select a Conversation</p>
            <p className="text-xs text-gray-600">Select a chat thread from the left list to read messages and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardConversations;
