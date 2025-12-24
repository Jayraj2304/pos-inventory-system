# 🛒 POS - Point of Sale with Inventory Management

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A full-stack Point of Sale application with comprehensive inventory management, sales tracking, and automated low-stock alerts.**

[Demo Video](#-demo) • [Features](#-features) • [Tech Stack](#-technology-stack) • [API Docs](#-api-endpoints)

</div>

---

## 📋 Project Overview

The **POS (Point of Sale) with Inventory Management** system is a complete retail solution that handles:

- 💳 **Billing & Checkout** - Process sales with cart management
- 📦 **Inventory Tracking** - Manage stock levels with recipes/ingredients
- 📧 **Email Notifications** - Automated alerts for low stock
- 📊 **Sales Analytics** - Track revenue and sales history

---

## 🎬 Demo

📹 **Video Walkthrough**: [Watch on YouTube](https://youtu.be/7f1qxKQ9Uhk)

The demo showcases:
- Adding products and defining ingredient recipes
- Processing a sale through the billing interface
- Automatic inventory deduction after sale
- Low stock alerts and "To Buy" list generation

---

## 🛠️ Technology Stack

### Frontend
| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| **React 19**       | UI framework with hooks      |
| **Vite**           | Fast build tool & dev server |
| **TailwindCSS**    | Utility-first styling        |
| **React Router 7** | Client-side routing          |
| **Axios**          | HTTP client for API calls    |

### Backend
| Technology     | Purpose             |
| -------------- | ------------------- |
| **Node.js**    | Runtime environment |
| **Express 5**  | Web framework       |
| **MongoDB**    | NoSQL database      |
| **Mongoose 9** | ODM for MongoDB     |
| **Nodemailer** | Email notifications |

---

## ✨ Features

### 🛍️ Billing & Checkout
- Product dropdown with search
- Shopping cart with quantity management
- Price calculation with totals
- **Inventory validation** before checkout
- Customer email capture for receipts

### 📦 Inventory Management
- Add/Edit/Delete inventory items
- Set minimum stock thresholds
- Automatic low-stock detection
- Quantity tracking per ingredient

### 🍕 Product & Recipe Management
- Create products with multiple ingredients
- Define ingredient quantities per product
- Automatic inventory deduction on sale

### 📧 Smart Notifications
- Email alerts when stock falls below minimum
- "To Buy" list for restocking

### 📊 Sales Analytics
- Sales history with timestamps
- Customer information tracking
- Revenue tracking per transaction

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Billing  │  │Inventory │  │Products  │  │  Sales   │        │
│  │  Page    │  │  Page    │  │  Page    │  │ History  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│       └─────────────┴──────┬──────┴─────────────┘                │
│                            │                                     │
│                      ┌─────▼─────┐                               │
│                      │  api.js   │  (Axios)                      │
│                      └─────┬─────┘                               │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP
┌────────────────────────────┼─────────────────────────────────────┐
│                      ┌─────▼─────┐                               │
│                      │ Express   │                               │
│                      │  Server   │                               │
│                      └─────┬─────┘                               │
│                            │                                     │
│  ┌──────────┐  ┌──────────┼──────────┐  ┌──────────┐            │
│  │ Billing  │  │ Inventory│ Products │  │  Sales   │            │
│  │ Routes   │  │  Routes  │  Routes  │  │  Routes  │            │
│  └────┬─────┘  └────┬─────┴────┬─────┘  └────┬─────┘            │
│       │             │          │             │                   │
│       └─────────────┴────┬─────┴─────────────┘                   │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │Controllers│                                 │
│                    └─────┬─────┘                                 │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │  Models   │                                 │
│                    │(Mongoose) │                                 │
│                    └─────┬─────┘                                 │
│                          │                         BACKEND       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │
                    │  Database   │
                    └─────────────┘
```

---

## 📁 Project Structure

```
POS/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BillingPage.jsx      # Checkout & cart
│   │   │   ├── InventoryPage.jsx    # Stock management
│   │   │   ├── SalesPage.jsx        # Sales overview
│   │   │   ├── SalesHistory.jsx     # Transaction history
│   │   │   └── ToBuyList.jsx        # Low stock items
│   │   ├── components/              # Reusable components
│   │   ├── api.js                   # API configuration
│   │   └── App.jsx                  # Main app & routing
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express Backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── billingController.js     # Checkout logic
│   │   └── posController.js         # POS operations
│   ├── models/
│   │   ├── Inventory.js             # Inventory schema
│   │   ├── Product.js               # Product schema
│   │   └── Sale.js                  # Sales schema
│   ├── routes/
│   │   ├── billingRoutes.js         # /api/billing
│   │   ├── inventoryRoutes.js       # /api/inventory
│   │   ├── productRoutes.js         # /api/products
│   │   └── salesRoutes.js           # /api/sales
│   ├── utils/
│   │   └── mailer.js                # Email utility
│   ├── server.js                    # Entry point
│   └── package.json
│
└── README.md                    # Documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pos-system.git
cd pos-system
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Start the server:
```bash
node server.js
# or with nodemon for development
npx nodemon server.js
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📡 API Endpoints

### Inventory Routes (`/api/inventory`)
| Method | Endpoint     | Description             |
| ------ | ------------ | ----------------------- |
| GET    | `/`          | Get all inventory items |
| POST   | `/`          | Add new inventory item  |
| PUT    | `/:id`       | Update inventory item   |
| DELETE | `/:id`       | Delete inventory item   |
| GET    | `/low-stock` | Get items below minimum |

### Product Routes (`/api/products`)
| Method | Endpoint | Description                    |
| ------ | -------- | ------------------------------ |
| GET    | `/`      | Get all products               |
| POST   | `/`      | Create new product with recipe |
| PUT    | `/:id`   | Update product                 |
| DELETE | `/:id`   | Delete product                 |

### Billing Routes (`/api/billing`)
| Method | Endpoint    | Description                     |
| ------ | ----------- | ------------------------------- |
| POST   | `/checkout` | Process sale & deduct inventory |

### Sales Routes (`/api/sales`)
| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| GET    | `/`      | Get all sales history     |
| GET    | `/:id`   | Get specific sale details |

---

## 🔧 React Hooks Used

| Hook        | Usage                                            |
| ----------- | ------------------------------------------------ |
| `useState`  | Managing cart items, form inputs, inventory list |
| `useEffect` | Fetching data on component mount, API calls      |

---

## 📊 Database Models

### Inventory Model
```javascript
{
  name: String,
  quantity: Number,
  unit: String,
  minimumStock: Number
}
```

### Product Model
```javascript
{
  name: String,
  price: Number,
  ingredients: [{
    inventoryItem: ObjectId,
    quantity: Number
  }]
}
```

### Sale Model
```javascript
{
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  customerEmail: String,
  createdAt: Date
}
```

---

## 🔑 Key Business Logic

### Checkout Flow
1. Customer adds products to cart
2. System validates inventory availability
3. **Check**: Will any ingredient fall below minimum?
4. If yes → Alert user, prevent checkout
5. If no → Process sale, deduct inventory, save transaction
6. Optional: Send email notification for low stock

---

## 📜 License

This project is built for educational and demonstration purposes.

---

<div align="center">

**Author**: Jayra  
**Date**: December 2024

</div>
