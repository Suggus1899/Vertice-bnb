"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, Badge, Spinner } from "@vetice/ui";
import { useChatSocket } from "@/hooks/use-chat-socket";

interface Conversation {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  property?: {
    id: string;
    title: string;
    images: { url: string }[];
  };
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  propertyId?: string;
  readAt?: string;
  createdAt: string;
  sender?: {
    studentProfile?: { firstName: string; lastName: string; avatar?: string };
    hostProfile?: { firstName: string; lastName: string; avatar?: string };
  };
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<
    string | null
  >(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [onlineUsers, setOnlineUsers] = React.useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = React.useState<Set<string>>(new Set());

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { connected, sendMessage, markAsRead, startTyping, stopTyping } =
    useChatSocket({
      onMessageReceived: (message) => {
        // Agregar mensaje recibido
        setMessages((prev) => [...prev, message]);

        // Marcar como leído automáticamente
        if (message.senderId === selectedConversation) {
          markAsRead([message.id]);
        }
      },
      onUserOnline: (data) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (data.online) {
            next.add(data.userId);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      },
      onUserTyping: (data) => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(data.userId);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      },
    });

  // Cargar conversaciones
  React.useEffect(() => {
    loadConversations();
  }, []);

  // Cargar mensajes cuando se selecciona una conversación
  React.useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Scroll al último mensaje
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${otherUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);

        // Marcar mensajes como leídos
        const unreadIds = data.data
          .filter(
            (m: Message) =>
              m.receiverId === localStorage.getItem("user") && !m.readAt,
          )
          .map((m: Message) => m.id);

        if (unreadIds.length > 0) {
          markAsRead(unreadIds);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      await sendMessage(selectedConversation, newMessage.trim());
      setNewMessage("");
      stopTyping(selectedConversation);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (selectedConversation) {
      startTyping(selectedConversation);
    }
  };

  const getUserName = (conv: Conversation) => {
    return `${conv.firstName} ${conv.lastName}` || conv.email;
  };

  const getOtherUser = (message: Message) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return message.senderId === user.id ? message.receiverId : message.senderId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Lista de Conversaciones */}
      <Card className="w-80 flex-shrink-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Mensajes</h2>
          <p className="text-sm text-muted-foreground">
            {connected ? "🟢 Conectado" : "🔴 Desconectado"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No tienes conversaciones
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedConversation(conv.userId)}
                className={`w-full p-4 text-left border-b hover:bg-muted/50 transition-colors ${
                  selectedConversation === conv.userId ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-vertice-primary flex items-center justify-center text-white font-semibold">
                      {conv.firstName?.[0]}
                      {conv.lastName?.[0]}
                    </div>
                    {onlineUsers.has(conv.userId) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {getUserName(conv)}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge className="mt-1">{conv.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Área de Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-vertice-primary flex items-center justify-center text-white font-semibold">
                    {
                      conversations.find(
                        (c) => c.userId === selectedConversation,
                      )?.firstName?.[0]
                    }
                    {
                      conversations.find(
                        (c) => c.userId === selectedConversation,
                      )?.lastName?.[0]
                    }
                  </div>
                  {onlineUsers.has(selectedConversation) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {getUserName(
                      conversations.find(
                        (c) => c.userId === selectedConversation,
                      )!,
                    )}
                  </h3>
                  {typingUsers.has(selectedConversation) ? (
                    <p className="text-sm text-vertice-primary">
                      escribiendo...
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {onlineUsers.has(selectedConversation)
                        ? "En línea"
                        : "Desconectado"}
                    </p>
                  )}
                </div>
              </div>
              {conversations.find((c) => c.userId === selectedConversation)
                ?.property && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prop = conversations.find(
                      (c) => c.userId === selectedConversation,
                    )?.property;
                    if (prop) router.push(`/properties/${prop.id}`);
                  }}
                >
                  🏠 Ver Propiedad
                </Button>
              )}
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((message) => {
                const isOwn =
                  message.senderId ===
                  JSON.parse(localStorage.getItem("user") || "{}").id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwn
                          ? "bg-vertice-primary text-vertice-primary-foreground"
                          : "bg-card text-card-foreground"
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${isOwn ? "text-vertice-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                        {isOwn && message.readAt && " ✓✓"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t flex gap-2"
            >
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Escribe un mensaje..."
                disabled={isSending || !connected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={isSending || !newMessage.trim() || !connected}
              >
                {isSending ? "Enviando..." : "Enviar"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">
                Selecciona una conversación
              </h3>
              <p>Elige un contacto para comenzar a chatear</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
