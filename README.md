# create-zenuxs-app 🚀

A powerful CLI tool to scaffold modern web applications using the **Zenuxs ecosystem**.  
Clean structure, fast setup, and flexible customization for any modern stack.

---

## ✨ Features

- **Frontend**: React + Vite or Next.js  
- **Backend**: Express or Fastify  
- **Database Support**:  
  - MongoDB (with optional Easy-Mongoo integration)  
  - MySQL  
  - PostgreSQL  
- **Authentication**: JWT-based authentication template  
- **Styling**: Optional TailwindCSS setup  
- **Type Safety**: TypeScript support  
- **Full-Stack Mode**: Auto-configures both frontend + backend folders  

---

## 🚀 Quick Start

Run the CLI:

```bash
npx create-zenuxs-app my-project
```

Or directly:

```bash
create-zenuxs-app <project-name>
```

The CLI will guide you through:

1. Project type → **Frontend**, **Backend**, **Full-Stack**  
2. Framework selection  
3. Database options  
4. Optional features (TS, Tailwind, Auth, etc.)

---

## 📁 Project Structure

### **Frontend (React + Vite)**

```
my-project/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── ZenuxsPage.jsx
│   └── styles/
├── public/
├── package.json
└── vite.config.js
```

---

### **Backend (Express)**

```
my-project/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   └── config/
├── server.js
├── package.json
└── .env
```

---

### **Full-Stack Layout**

```
my-project/
├── frontend/  (React or Next.js)
├── backend/   (Express or Fastify)
└── README.md
```

---

## 🌐 Zenuxs Ecosystem

- Zenuxs Accounts: https://zenuxs.in  
- Easy-Mongoo: https://easy-mongoo.zenuxs.in  
- HMAX Security: https://hmax.zenuxs.in  

---

## 🛠️ Development Setup

Clone the repository:

```bash
git clone <repository>
cd create-zenuxs-app
npm install
```

Link globally:

```bash
npm link
```

Test locally:

```bash
create-zenuxs-app test-project
# or
node index.js my-project
```

---

## 📦 Installation & Testing

1. Install dependencies:

```bash
npm install
```

2. Link globally:

```bash
npm link
```

3. Test the CLI:

```bash
create-zenuxs-app my-test-project
```

---

## 📄 License

**MIT License**

Built with ❤️ by the **Zenuxs Team**  
