"use client";

import { useEffect, useRef, useState } from "react";
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

interface Message {
  id?: string;
  sender: string;
  content: string;
  created_at: string;
  chat_id: string;
  sender_avatar_url?: string | null;
}

interface Props {
  chatId: string | null;
  chatName?: string | null;
}

const userIcons = [
  FaUserAlt,
  FaUserNinja,
  FaUserSecret,
  FaUserAstronaut,
  FaRobot,
  FaUserTie,
];

const getUserIcon = (email: string) => {
  const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return userIcons[hash % userIcons.length];
};

export default function ChatWindow({ chatId, chatName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [resolvedChatName, setResolvedChatName] = useState<string>("Chat");
  const [chatAvatarUrl, setChatAvatarUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatName && chatId) setResolvedChatName(chatName);

    if (chatId) {
      const fetchChatDetails = async () => {
        const { data } = await supabase
          .from("chats")
          .select("name, avatar_url")
          .eq("id", chatId)
          .single();

        if (data) {
          setResolvedChatName(data.name ?? "Chat");
          setChatAvatarUrl(data.avatar_url || null);
        }
      };

      fetchChatDetails();
    }
  }, [chatId, chatName]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user?.email || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at");
      if (data) setMessages(data);
    };

    fetchMessages();
  }, [chatId]);

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
            const alreadyExists = prev.some(
              (msg) => msg.id === newMessage.id
            );
            return alreadyExists ? prev : [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

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
            <FaUserAlt className={styles.chatAvatarFallback} />
          )}
          <h2 className={styles.chatTitle}>{resolvedChatName}</h2>
        </div>
      </div>

      <div className={styles.messagesList}>
        {!messages.length && (
          <p className={styles.noMessagesText}>No messages yet</p>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender === currentUser;
          const isSupabaseImage =
            msg.content.includes("https://") &&
            msg.content.match(/attachments\/.*\.(jpg|jpeg|png|gif|webp)$/i);
          const isVideo =
            msg.content.endsWith(".mp4") || msg.content.endsWith(".webm");
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
                    <Icon />
                  )}
                </div>
              )}
              <div
                className={`${styles.messageBubble} ${
                  isMe ? styles.meBubble : styles.themBubble
                }`}
              >
                {isSupabaseImage ? (
                  <a
                    href={msg.content}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={msg.content}
                      alt="attachment"
                      className={styles.image}
                    />
                  </a>
                ) : isVideo ? (
                  <video controls className={styles.video} src={msg.content} />
                ) : (
                  <p>{msg.content}</p>
                )}
                <span className={styles.timestamp}>
                  {formatTimestamp(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

     
      <MessageInput chatId={chatId} />
    </div>
  );
}
