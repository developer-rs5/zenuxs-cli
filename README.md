# 🚀 create-zenuxs-app  
A powerful CLI tool to scaffold modern, production-ready web applications using the **Zenuxs ecosystem**.  
Whether you're building a frontend, backend, or a complete full-stack powerhouse — this CLI has your back.

---

## ✨ Features

### 🔹 Frontend
- React + Vite  
- Next.js  
- Optional TailwindCSS  
- Optional TypeScript  
- Pre-built authentication UI (JWT-based)

### 🔹 Backend
- Express or Fastify  
- MongoDB (Easy-Mongoo), MySQL, PostgreSQL  
- Authentication (Access + Refresh tokens)  
- Logging, rate limiting & structured project setup  

### 🔹 Full-Stack
- Auto-connected frontend ↔ backend integration  
- Shared auth flow  
- Optional Docker containerization  
- Seamless developer experience  

---

## 🚀 Quick Start

### Using NPX
```bash
npx create-zenuxs-app my-project
```

### Or install globally
```bash
npm install -g create-zenuxs-app
create-zenuxs-app my-project
```

---

## 📖 Usage

### Basic
```bash
create-zenuxs-app <project-name>
```

### Options
```bash
# Frontend only
create-zenuxs-app my-app --frontend

# Backend only
create-zenuxs-app my-api --backend

# Full-stack project
create-zenuxs-app my-fullstack --fullstack

# Show version
create-zenuxs-app --version
```

---

## 🎯 Project Types

### 1. Frontend
- **React + Vite** → Fast dev, optimized builds  
- **Next.js** → Full framework with routing, SSR/SSG  
- Extra options: TailwindCSS, TypeScript, Auth UI

### 2. Backend
- **Express** → Community favorite  
- **Fastify** → High-performance alternative  
- Features:
  - JWT Authentication  
  - Easy-Mongoo / MySQL / PostgreSQL setup  
  - Request logging, validation, rate limits  

### 3. Full-Stack
- Ready-made frontend + backend  
- API auto-wiring  
- Shared configuration  
- Optional Docker support  

---

## 🗂️ Project Structure

```
my-project/
├── frontend/          # Frontend app
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Backend app
│   ├── src/
│   ├── config/
│   └── package.json
├── docker-compose.yml # Optional Docker setup
└── README.md          # Project documentation
```

---

## 🔧 Technologies

### Frontend
React • Next.js • Vite • TailwindCSS • TypeScript  

### Backend  
Express • Fastify • Easy-Mongoo  

### Databases  
MongoDB • MySQL • PostgreSQL  

### Auth  
JWT • Refresh tokens • bcrypt  

### Tooling  
ESLint • Prettier • Docker  

---

## 🔗 Zenuxs Ecosystem

- **Zenuxs Accounts:** https://zenuxs.in  
- **Easy-Mongoo:** https://easy-mongoo.zenuxs.in  
- **HMAX Security:** https://hmax.zenuxs.in  
- **Docs:** https://docs.zenuxs.in  

---

## 🤝 Contributing

Contributions are welcome!  
Please check out the **Contributing Guide** before submitting PRs.

---

## 📄 License
Released under the **MIT License**.

---

## 📞 Support

- **Issues:** GitHub Issues  
- **Email:** support@zenuxs.in  
- **Discord:** Join our community  

---

### Made with ❤️ by the Zenuxs Team
