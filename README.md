# 🟢 Periskope Chat App

A sleek, real-time group chat application built with **Next.js 15**, **Supabase**, and **Tailwind CSS** — featuring secure login, media sharing, presence indicators, and responsive design inspired by modern messaging apps.

---

## 🚀 Features

- 🔐 Supabase Auth for user login (email/password)
- 💬 Real-time messaging with Supabase Realtime
- 🖼 Upload & send images/videos (Supabase Storage)
- 🧑‍🤝‍🧑 Group presence UI with avatars
- 📱 Responsive design for mobile and desktop
- 🌗 Light & dark UI support
- 🧠 Intelligent timestamp formatting
- ✅ Shows sender identity and profile icon

---

## 📸 Screenshots

> 📌 **Note:** Login screen looks best in **browser light mode**.

### 💡 Login Screen (Light Mode Recommended)
![Login UI Light Mode](./public/demo-login.png) <!-- Replace with your screenshot -->

### 💬 Group Chat UI
![Chat UI](./public/demo-chat.png) <!-- Replace with your screenshot -->



## 🧑‍💻 Local Development Setup

- **Clone the repository**
  ```bash
  git clone https://github.com/your-username/periskope-chat-app.git
- **Navigate to the project directory**
  ```bash
  cd periskope-chat-app
- **Install dependencies**
  ```bash
  npm install
- **Create a .env.local file in the root of the project and add your Supabase credentials**
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
- **Start the development server**
  ```bash
  npm run dev
- Your app should now be running at http://localhost:3000 🚀
---
## 🗃 Supabase Setup Guide

### 📦 Tables

#### `chats`

| Column       | Type   | Description           |
|--------------|--------|-----------------------|
| `id`         | UUID   | Primary key           |
| `name`       | string | Chat/group name       |
| `avatar_url` | string | (Optional) Avatar URL |

#### `messages`

| Column       | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| `id`         | UUID      | Primary key                              |
| `chat_id`    | UUID      | Foreign key referencing `chats` table     |
| `sender`     | string    | Email of the sender                      |
| `content`    | text      | Message content or media URL             |
| `created_at` | timestamp | Timestamp of the message                 |



## 🗃 Supabase Setup Guide

### 📦 Tables

#### `chats`

| Column       | Type   | Description           |
|--------------|--------|-----------------------|
| `id`         | UUID   | Primary key           |
| `name`       | string | Chat/group name       |
| `avatar_url` | string | (Optional) Avatar URL |

#### `messages`

| Column       | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| `id`         | UUID      | Primary key                              |
| `chat_id`    | UUID      | Foreign key referencing `chats` table     |
| `sender`     | string    | Email of the sender                      |
| `content`    | text      | Message content or media URL             |
| `created_at` | timestamp | Timestamp of the message                 |

---

### 📂 Storage

- **Bucket Name**: `attachments`
- **Access**: `public`
- **Usage**: Used for uploading images and videos via the `MessageInput` component.

---

### 🔐 Auth

- **Enabled Method**: `Email/Password`
- **Steps**:
  1. Go to Supabase Dashboard
  2. Navigate to **Authentication → Email**
  3. Enable **Email sign-in**
---

### 🌐 Deployment

- **Deployed using **Vercel**.**
  ```bash
  # To deploy the project
  vercel deploy

---

### 🛠 Tips

- If images or videos don't show:

  --- Ensure the attachments bucket exists in Supabase Storage
  
  --- Set bucket access to public
  
  --- Confirm the uploaded file URLs are valid
  
  --- For best login screen appearance, view the app in light mode (browser theme)
     


