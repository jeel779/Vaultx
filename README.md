# VaultX - Secure Gaming & Social Account Marketplace

**VaultX** is a secure, premium, and feature-rich digital marketplace platform designed for trading, selling, and buying gaming accounts (e.g., PUBG, Valorant, Clash of Clans etc) and social media profiles and other accountes etc. Built with a modern, high-performance tech stack, VaultX ensures trust and quality via a robust admin moderation workflow, direct real-time seller-to-buyer messaging, and advanced search filters.

---

## 🌟 Key Features

### 👤 User Authentication & Profile
- **Secure Auth:** JWT-based user registration and login with cookie-based session management.
- **Password Protection:** Secure password hashing using `bcrypt`.
- **Profiles:** Custom profiles with support for user avatars uploaded via Cloudinary.

### 🎮 Listing Management
- **Listing Creation:** Detail-rich listings featuring title, description, price (in ₹ INR), category, platform, account level, country, and multiple image uploads.
- **Image Hosting:** Seamless image handling using `multer` and `Cloudinary`.
- **Listing Statuses:** Workflow states including `DRAFT`, `PENDING`, `VERIFIED`, `REJECTED`, and `SOLD`.

### 🛡️ Admin Moderation Dashboard
- **Verification Queue:** Admins can inspect newly submitted listings.
- **Approval System:** Approve listings to make them public or reject them with a custom feedback reason (e.g., "invalid screenshots" or "suspicious level info").
- **Platform Management:** Full administrative control over active listings and registered user accounts.

### 💬 Real-Time Messaging (Socket.io)
- **Instant Chat:** Direct communication channel between buyers and sellers, pinned to specific listings.
- **Online/Offline Indicators:** Live reactive indicators showing whether a buyer/seller is currently online.
- **Instant Messaging Delivery:** WebSockets push notifications immediately to the active chat history without manual refresh page pulls.

### 🔍 Advanced Exploration & Discovery
- **Live Search & Filter:** Powerful exploration page to query listings by platform, category, level, country, price range, and date.
- **Zustand State Stores:** Fast, highly structured, modular local stores for auth, listings, admin operations, and active chat states.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (v19) with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router (v7)
- **State Management:** Zustand (Modular Stores)
- **API Communication:** Axios HTTP Client
- **Real-Time Layer:** Socket.io-client
- **Icons:** Lucide React

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma ORM
- **Database:** PostgreSQL (via `pg` & `@prisma/adapter-pg`)
- **File Storage:** Cloudinary & Multer
- **WebSocket Engine:** Socket.io Server
- **Security & Validation:** JWT, Cookie-Parser, bcrypt, and Zod

---

## 📂 Project Structure

```
vaultx/
├── backend/
│   ├── prisma/             # Prisma Schema & Migrations
│   ├── src/
│   │   ├── controllers/    # Route handler controllers
│   │   ├── lib/            # Prisma connection & Socket.io server configuration
│   │   ├── middlewares/    # Authentication & upload middlewares
│   │   ├── routes/         # Express API endpoints mapping
│   │   ├── utils/          # Schemas, Cloudinary config, helper methods
│   │   ├── app.ts          # App configuration
│   │   └── index.ts        # Server entry point
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/         # App graphics & static assets
│   │   ├── components/     # Reusable UI subcomponents (Toasts, Modals, Filters, Chat Layouts)
│   │   ├── helpers/        # API communication wrapper methods
│   │   ├── lib/            # Axios API config
│   │   ├── pages/          # Home, Explore, Listing Details, Dashboards, Auth
│   │   ├── stores/         # Zustand Modular stores (useAuthStore, useListingStore, useChatStore, useAdminStore)
│   │   ├── types/          # Common TypeScript definitions
│   │   ├── App.tsx         # Root component, routing & global socket lifecycle hook
│   │   └── main.tsx        # React DOM mounting
│   ├── tsconfig.json
│   └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database
- Cloudinary Account (for image uploads)

### Setup & Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/vaultx.git
   cd vaultx
   ```

2. **Backend Configuration:**
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Create a `.env` file based on your database and Cloudinary credentials:
     ```env
     PORT=8000
     CORS_ORIGIN=http://localhost:5173
     JWT_SECRET="your_jwt_secret_here"
     ADMIN_SECRET_KEY="your_admin_secret_key"
     DATABASE_URL="postgresql://user:password@localhost:5432/vaultx_db?sslmode=require"
     
     # Cloudinary Configuration
     CLOUDINARY_CLOUD_NAME="your_cloud_name"
     CLOUDINARY_API_KEY="your_api_key"
     CLOUDINARY_API_SECRET="your_api_secret"
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Run database migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Run the backend development server:
     ```bash
     npm run dev
     ```

3. **Frontend Configuration:**
   - Open a new terminal and navigate to the `frontend` directory:
     ```bash
     cd ../frontend
     ```
   - Create a `.env` file in the frontend root:
     ```env
     VITE_API_URL=http://localhost:8000/api/v1
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Run the frontend development server:
     ```bash
     npm run dev
     ```
   - Open `http://localhost:5173` in your browser.

---

## 🔒 Security Practices
- Session tokens are stored in secure HTTP-only cookies to prevent XSS attacks.
- Inputs are validated strictly on both the frontend and backend using Zod schemas.
- Route protection guards sensitive actions (creating listings, messaging, admin controls) against unauthenticated or unauthorized users.

## 📝 License
This project is licensed under the ISC License. See the [package.json](file:///c:/Users/Jeelp/Desktop/vaultx/backend/package.json) details for more info.
