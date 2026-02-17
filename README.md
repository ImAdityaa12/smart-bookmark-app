# 🔖 Smart Bookmark App

A modern, fast, and secure bookmark management application built with Next.js 15 and Supabase. Organize your favorite links with ease, featuring quick access, search, and seamless Google authentication.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

## ✨ Features

-   **🔐 Secure Authentication**: Integrated with Supabase Auth for seamless Google Sign-In.
-   **⚡ Server Actions**: Utilizes Next.js Server Actions for fast, type-safe data mutations.
-   **🔍 Powerful Search**: Real-time search functionality to find your bookmarks instantly.
-   **📌 Quick Access**: Pin your most-used bookmarks for rapid navigation.
-   **📱 Responsive Design**: A beautiful, mobile-first UI built with Tailwind CSS and Framer Motion animations.
-   **📄 Pagination**: Efficiently manage large collections of bookmarks with server-side pagination.
-   **🛡️ Row Level Security**: Your data is protected by Supabase RLS, ensuring users only access their own bookmarks.

## 🚀 Tech Stack

-   **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Icons**: Lucide React (via custom SVG implementations)

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Supabase Setup

1.  Create a new project at [database.new](https://database.new).
2.  Go to the **SQL Editor** and run the contents of `database.sql` to create the `bookmarks` table and set up RLS policies.
3.  Enable **Google Auth** in the Supabase Dashboard under `Auth > Providers`.
4.  Add your production URL and `http://localhost:3000` to the **Redirect URIs** in the Supabase Auth settings.

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📁 Project Structure

-   `app/`: Next.js App Router (Pages, API routes, and Server Actions).
-   `components/`: Reusable UI components.
-   `hooks/`: Custom React hooks for state management.
-   `utils//supabase/`: Supabase client and middleware configurations.
-   `types/`: TypeScript type definitions.
-   `database.sql`: SQL schema and RLS policies.

## 🐛 Troubleshooting

### Problem 1: Production Login Redirects to Localhost

**Issue**: After successful Google authentication in production, users were redirected back to `http://localhost:3000` instead of the production domain.

**Root Cause**: The OAuth redirect URL was being determined server-side using `process.env.NEXT_PUBLIC_APP_URL`, which wasn't set in production, causing it to fall back to the hardcoded localhost default.

**Solution**: 
1. Modified `signInWithGoogle()` in `app/actions.ts` to accept an optional `redirectOrigin` parameter
2. Updated `components/google-sign-in-button.tsx` to pass `window.location.origin` from the client side
3. This ensures the OAuth flow uses the actual domain where the login was initiated

```typescript
// In google-sign-in-button.tsx
const origin = window.location.origin
const url = await signInWithGoogle(origin)
```

**Additional Steps**:
- Set `NEXT_PUBLIC_APP_URL` environment variable in your production deployment
- Add your production URL to Supabase Auth → URL Configuration → Redirect URLs: `https://yourdomain.com/auth/callback`

### Problem 2: Using Legacy Anon Key Instead of Modern Keys

**Issue**: The application was using the deprecated `SUPABASE_ANON_KEY` which is now in legacy mode.

**Root Cause**: Supabase has moved to a new key system with separate publishable and secret keys for better security.

**Solution**:
1. Updated all Supabase client configurations to use the new key system:
   - **Client-side** (`utils/supabase/client.ts`): Uses `NEXT_PUBLIC_SUPABASE_KEY` (publishable key)
   - **Server-side** (`utils/supabase/server.ts`): Uses `SUPABASE_SECRET_KEY` (secret key)
   - **Middleware** (`utils/supabase/middleware.ts`): Uses `SUPABASE_SECRET_KEY` (secret key)

2. Updated `.env.local` with the new key names:
```env
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

**Why This Matters**: The new key system provides better security by separating client-facing keys from server-only keys, preventing accidental exposure of sensitive credentials.

### Problem 3: Google OAuth Not Working in Production

**Common Causes & Solutions**:

1. **Missing Redirect URLs in Supabase**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add both development and production callback URLs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`

2. **Google Cloud Console Configuration**:
   - Ensure your Google OAuth app has the Supabase callback URL in Authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

3. **Missing Environment Variables**:
   - Verify all required environment variables are set in your production environment
   - Double-check that `NEXT_PUBLIC_APP_URL` matches your actual production domain

## 📝 License

This project is open source. Feel free to use and modify it as you wish.
