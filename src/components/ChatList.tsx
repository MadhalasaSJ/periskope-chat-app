"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaUserCircle } from "react-icons/fa";
import styles from "@/styles/ChatList.module.css";

type Chat = {
  id: string;
  name: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageAt?: string | null;
};

type Props = {
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
};

export default function ChatList({ selectedChatId, onSelectChat }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select(`
          id,
          name,
          avatar_url,
          messages (
            content,
            created_at
          )
        `);

      if (!error && data) {
        const chatsWithLastMsg = data.map((chat: any) => {
          const messages = chat.messages || [];
          const lastMsgObj = messages.length ? messages[messages.length - 1] : null;
          return {
            id: chat.id,
            name: chat.name,
            avatar_url: chat.avatar_url,
            lastMessage: lastMsgObj?.content || "",
            lastMessageAt: lastMsgObj?.created_at || null,
          };
        });
        setChats(chatsWithLastMsg);
      }
    };

    fetchChats();
  }, []);

  const formatTimestamp = (isoDate: string | null | undefined) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  return (
    <div className={styles.chatListContainer}>
      <div className={styles.header}>
        <FaUserCircle size={24} className={styles.headerIcon} />
        <span className={styles.headerTitle}>Chats</span>
      </div>

      {chats.length === 0 ? (
        <div className={styles.noChats}>No chats available</div>
      ) : (
        <ul className={styles.chatItems}>
          {chats.map(({ id, name, avatar_url, lastMessage, lastMessageAt }) => {
            const isSelected = selectedChatId === id;

            return (
              <li
                key={id}
                onClick={() => onSelectChat(id)}
                className={`${styles.chatItem} ${isSelected ? styles.active : ""}`}
                tabIndex={0}
                aria-selected={isSelected}
                role="option"
              >
                <div
                  className={`${styles.avatarWrapper} ${isSelected ? styles.avatarSelected : ""}`}
                >
                  {avatar_url ? (
                    <img
                      src={avatar_url}
                      alt={name}
                      className={styles.avatarImage}
                    />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className={styles.chatInfo}>
                  <div className={styles.chatHeader}>
                    <span
                      className={`${styles.chatName} ${
                        isSelected ? styles.chatNameSelected : ""
                      }`}
                    >
                      {name}
                    </span>
                    <span className={styles.chatTime}>
                      {formatTimestamp(lastMessageAt)}
                    </span>
                  </div>
                  <p className={styles.lastMessage}>
                    {lastMessage || "No messages yet"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
