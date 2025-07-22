import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  chatId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserImage?: string;
  onClose?: () => void;
}

export default function ChatInterface({ 
  chatId, 
  otherUserId, 
  otherUserName = "User", 
  otherUserImage,
  onClose 
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", chatId],
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", "/api/messages", {
        chatId,
        receiverId: otherUserId,
        body: message,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", chatId] });
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.chatId === chatId) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", chatId] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [chatId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Send message via API
    sendMessageMutation.mutate(newMessage);

    // Send real-time notification via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        chatId,
        senderId: user?.id,
        receiverId: otherUserId,
        body: newMessage,
        type: 'new_message'
      }));
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="bg-primary text-white p-4 flex items-center rounded-t-lg">
        {otherUserImage ? (
          <img 
            src={otherUserImage} 
            alt={otherUserName} 
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-3">
            <i className="fas fa-user text-primary"></i>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{otherUserName}</h3>
          <p className="text-blue-100 text-sm">
            {socket ? "Online" : "Offline"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white">
            <i className="fas fa-phone"></i>
          </Button>
          <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white">
            <i className="fas fa-video"></i>
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-blue-100 hover:text-white">
              <i className="fas fa-times"></i>
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start">
                <Skeleton className="w-8 h-8 rounded-full mr-2" />
                <Skeleton className="h-16 w-1/2 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;
              return (
                <div 
                  key={message.id} 
                  className={`flex items-start ${isOwnMessage ? 'justify-end' : ''}`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-slate-300 mr-2 mt-1 flex items-center justify-center">
                      <i className="fas fa-user text-slate-600 text-xs"></i>
                    </div>
                  )}
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    isOwnMessage 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                  }`}>
                    <p>{message.body}</p>
                    <span className={`text-xs mt-1 block ${
                      isOwnMessage ? 'text-blue-200' : 'text-slate-500'
                    }`}>
                      {new Date(message.createdAt!).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-500 mb-2">
              <i className="fas fa-comments text-2xl"></i>
            </div>
            <p className="text-slate-600">No messages yet. Start a conversation!</p>
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="border-t border-slate-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-paperclip"></i>
          </Button>
          <Input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 rounded-full"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            className="rounded-full p-2" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
