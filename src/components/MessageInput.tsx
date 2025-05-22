"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaPaperclip, FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import styles from "@/styles/MessageInput.module.css";

type Props = {
  chatId: string | null;
  onNewMessage?: (msg: {
    chat_id: string;
    sender: string;
    content: string;
    created_at: string;
  }) => void;
};

export default function MessageInput({ chatId }: Props) {  // removed onNewMessage from props
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSend = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!chatId || !message.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) {
      console.warn("No user or email found");
      return;
    }

    const newMessage = {
      chat_id: chatId,
      sender: user.email,
      content: message.trim(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("messages").insert(newMessage);
    if (error) {
      console.error("Failed to send message:", error.message);
    } else {
      setMessage(""); // clear input on success
      // Removed: onNewMessage?.(newMessage);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!chatId || !e.target.files?.length) return;

    const file = e.target.files[0];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;

    const ext = file.name.split(".").pop();
    const filePath = `${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("attachments")
      .upload(filePath, file);
    if (uploadErr) {
      console.error("Upload error:", uploadErr.message);
      return;
    }

    const { data } = supabase.storage
      .from("attachments")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error("Could not get public URL for the uploaded file");
      return;
    }

    const newMessage = {
      chat_id: chatId,
      sender: user.email,
      content: data.publicUrl,
      created_at: new Date().toISOString(),
    };

    const { error: insertErr } = await supabase.from("messages").insert(newMessage);
    if (insertErr) {
      console.error("Insert message error:", insertErr.message);
    }
    // Removed: onNewMessage?.(newMessage);
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  if (!chatId) return null;

  return (
    <div className={styles.container}>
      {showEmoji && (
        <div ref={emojiPickerRef} className={styles.emojiPicker}>
          <EmojiPicker onEmojiClick={handleEmojiClick} height={320} />
        </div>
      )}

      <form onSubmit={handleSend} className={styles.form}>
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className={styles.iconBtn}
          aria-label="Toggle emoji picker"
        >
          <FaSmile />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={styles.iconBtn}
          aria-label="Attach file"
        >
          <FaPaperclip />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className={styles.input}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              await handleSend(e);
            }
          }}
        />

        <button type="submit" className={styles.sendBtn} aria-label="Send message">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
