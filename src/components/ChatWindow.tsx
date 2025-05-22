"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  FaUserAlt,
  FaUserNinja,
  FaUserSecret,
  FaUserAstronaut,
  FaRobot,
  FaUserTie,
} from "react-icons/fa";
import MessageInput from "@/components/MessageInput";
import styles from "@/styles/ChatWindow.module.css";

type Props = {
  chatId: string | null;
  chatName?: string | null;
};

type Message = {
  id?: string;
  sender: string;
  content: string;
  created_at: string;
  chat_id: string;
  sender_avatar_url?: string | null;
};

const userIcons = [
  FaUserAlt,
  FaUserNinja,
  FaUserSecret,
  FaUserAstronaut,
  FaRobot,
  FaUserTie,
];

// Memoize the getUserIcon to avoid recalculating on every render
const getUserIcon = (email: string) => {
  const hash = email
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return userIcons[hash % userIcons.length];
};

export default function ChatWindow({ chatId, chatName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [resolvedChatName, setResolvedChatName] = useState<string>("Chat");
  const [chatAvatarUrl, setChatAvatarUrl] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [errorLoadingMessages, setErrorLoadingMessages] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch chat details (name, avatar)
  useEffect(() => {
    if (chatName && chatId) {
      setResolvedChatName(chatName);
    }

    if (chatId) {
      const fetchChatDetails = async () => {
        const { data, error } = await supabase
          .from("chats")
          .select("name, avatar_url")
          .eq("id", chatId)
          .single();

        if (!error && data) {
          setResolvedChatName(data.name ?? "Chat");
          setChatAvatarUrl(data.avatar_url || null);
        }
      };

      fetchChatDetails();
    }
  }, [chatId, chatName]);

  // Get current authenticated user email
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user?.email || null);
    };

    fetchUser();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial messages for the chat
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setErrorLoadingMessages(null);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) {
        setErrorLoadingMessages(error.message);
        setMessages([]);
      } else if (data) {
        setMessages(data);
      }
      setLoadingMessages(false);
    };

    fetchMessages();
  }, [chatId]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Handler for new messages from MessageInput
  const handleLocalMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Format time nicely, including showing date if not today
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  if (!chatId) {
    return (
      <div className={styles.noChatSelected}>
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className={styles.chatWindowContainer}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          {chatAvatarUrl ? (
            <img
              src={chatAvatarUrl}
              alt={`${resolvedChatName} Avatar`}
              className={styles.chatAvatar}
              onError={(e) =>
                ((e.target as HTMLImageElement).src = "/default-avatar.png")
              }
            />
          ) : (
            <FaUserAlt
              className={styles.chatAvatarFallback}
              aria-label="Chat avatar placeholder"
            />
          )}
          <h2 className={styles.chatTitle}>{resolvedChatName}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesList}>
        {loadingMessages && <p>Loading messages...</p>}
        {errorLoadingMessages && (
          <p className={styles.errorText}>Error: {errorLoadingMessages}</p>
        )}
        {!loadingMessages && !messages.length && (
          <p className={styles.noMessagesText}>No messages yet</p>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender === currentUser;
          const isImage = msg.content.match(/\.(jpeg|jpg|png|gif)$/i);
          const isVideo = msg.content.match(/\.(mp4|webm)$/i);
          const Icon = getUserIcon(msg.sender);

          return (
            <div
              key={msg.id || idx}
              className={`${styles.messageRow} ${isMe ? styles.me : styles.them}`}
            >
              {!isMe && (
                <div className={styles.avatar} title={msg.sender}>
                  {msg.sender_avatar_url ? (
                    <img
                      src={msg.sender_avatar_url}
                      alt={`Avatar of ${msg.sender}`}
                      className={styles.avatarImage}
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = "/default-avatar.png")
                      }
                    />
                  ) : (
                    <Icon aria-label="User icon" />
                  )}
                </div>
              )}
              <div
                className={`${styles.messageBubble} ${
                  isMe ? styles.meBubble : styles.themBubble
                }`}
              >
                {isImage ? (
                  <img src={msg.content} alt="Image attachment" className={styles.image} />
                ) : isVideo ? (
                  <video controls className={styles.video} src={msg.content} />
                ) : (
                  <p>{msg.content}</p>
                )}
                <span className={styles.timestamp}>{formatTimestamp(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput chatId={chatId} onNewMessage={handleLocalMessage} />
    </div>
  );
}
