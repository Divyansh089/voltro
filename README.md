# ⚡ Voltro — Next-Gen D2C Consumer Electronics Platform

Voltro is a modern, high-performance Direct-to-Consumer (D2C) e-commerce storefront and site management engine built specifically for next-generation hardware and consumer electronics. 

Combining futuristic glassmorphism design aesthetics with a resilient multi-tenant Node.js/Express backend and PostgreSQL relational architecture, Voltro simplifies inventory management, order processing, dynamic homepage merchandising, and customer support into a single unified platform.

---

## 🛠️ Tech Stack

### **Frontend**
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=feather&logoColor=white)

### **Backend & Database**
![Node.js](https://img.shields.io/badge/Node.js_v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM_v6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Zod](https://img.shields.io/badge/Zod_Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### **Infrastructure, Storage & Tooling**
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Swagger](https://img.shields.io/badge/OpenAPI_3.0_/_Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Pino](https://img.shields.io/badge/Pino_Logger-006600?style=for-the-badge&logo=pnpm&logoColor=white)

---

## 🖼️ Platform Preview / Screenshots

### 🌟 Storefront Bento Showcase
![Storefront Bento Showcase](./frontend/public/Screenshot/Screenshot01.png)

### 📊 Admin & Analytics Dashboard
![Admin Dashboard](./frontend/public/Screenshot/Screenshot02.png)

### 📱 Product Management Admin
![Product Management](./frontend/public/Screenshot/Screenshot03.png)

---

## 🏛️ System Architecture

Voltro follows a decoupled **Client-Server Architecture** designed for high throughput, low latency, and robust security.

```
                  ┌─────────────────────────────────────────┐
                  │          Voltro Web Client              │
                  │   (Next.js / React / TypeScript)        │
                  └────────────────────┬────────────────────┘
                                       │
                              HTTPS / REST APIs
                                       │
                  ┌────────────────────▼────────────────────┐
                  │          Voltro Backend Engine          │
                  │  (Node.js / Express 5 / TypeScript)     │
                  └────────┬───────────┬───────────┬────────┘
                           │           │           │
         ┌─────────────────┘           │           └─────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  PostgreSQL DB   │         │    Redis Cache   │         │  Cloudinary SDK  │
│  (Prisma ORM)    │         │ (Rate-Limiting)  │         │  (Media Storage) │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

### Architectural Principles:
1. **Decoupled Monolith / API-First**: The Node.js/Express backend operates cleanly as a standalone REST API service with Zod schema validation and rate limiting.
2. **Relational Database Integrity**: Powered by **Prisma ORM** over **PostgreSQL**, guaranteeing ACID compliance for orders, inventory adjustments, and user RBAC permissions.
3. **Optimized Media Pipeline**: Automated Cloudinary media upload and image dynamic resizing keep frontend bundle sizes minimal and page loads under 1.1s.
4. **Portal-Aware UI Component System**: Custom UI components (e.g. `CustomSelect` dropdowns, responsive gallery viewports) ensure smooth interactions on mobile and desktop devices.

---

## ✨ Key Features & Capabilities

### 🛍️ Storefront & Customer Experience
- **Dynamic Bento Grid Showcases**: Eye-catching homepage product feature cards with custom pricing, white drop-shadow typography, and image orientation auto-detection.
- **Adaptive Product Detail Gallery**: Amazon-style vertical thumbnail column with edge-to-edge fills (`object-cover`) paired with zero-crop main viewports (`object-contain`).
- **Granular Search & Filtering**: Multi-attribute product filtering by category, price range, ratings, and instant live search.
- **Seamless Cart & Checkout Workflow**: Full-featured shopping cart state management with coupon discount validation and instant order placement.
- **Customer Reviews & Ratings**: Verified customer product reviews, star rating distributions, and feedback interactions.
- **Order Tracking & Account History**: Personal user dashboard to inspect past orders, current shipping status, and profile preferences.

### 🛠️ Management & Staff Dashboard
Voltro provides a powerful administration interface with **4-Tier Role-Based Access Control (RBAC)**:
- **`ADMIN`**: Full platform control, user/staff management, analytics overview, and system role configuration.
- **`PRODUCT_MANAGER`**: Catalog creation, category hierarchy, bulk price/inventory updates, and homepage banner merchandising.
- **`CUSTOMER_SUPPORT`**: Order status updates, customer refund request approvals/rejections, and ticket responses.
- **`CUSTOMER`**: Standard storefront shopping profile.

### ⚡ Ease of Site Management
Managing an e-commerce platform shouldn't require code deployments for daily updates. Voltro empowers store managers to:
- **Link Live Products in Seconds**: Easily link homepage showcase cards directly to live database product UUIDs via centralized mapping configuration.
- **Automated Stock Syncing**: Real-time inventory tracking automatically updates product availability states across the entire storefront upon order placement.
- **Declarative Database Seeding**: Run `npx prisma db push` and `npm run seed` to initialize roles, permissions, categories, and sample products seamlessly.

---

## 🤝 Contributing

Contributions make the open-source and developer community an amazing place to learn, inspire, and create. Any contributions you make to **Voltro** are **greatly appreciated**!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💬 Closing Note & License

Voltro was created with a passion for high-performance web applications and beautiful Direct-to-Consumer hardware commerce. Whether you are scaling an electronics store or customizing the architecture for your own brand, we hope Voltro provides a solid, modern foundation.

Distributed under the **MIT License**. See `LICENSE` for more information.

*Happy Building! 🚀*
