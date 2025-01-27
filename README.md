# Vinyl Flooring Records System

A web-based **Vinyl Flooring Records Management System** with **real-time updates** using:
- **Backend:** Node.js, Express.js, MongoDB, Socket.io
- **Frontend:** HTML, CSS, JavaScript

## 🚀 Features
✅ **Manage Vinyl Rolls** - Add, Edit, Delete vinyl records  
✅ **Real-time Updates** - Uses **Socket.io** for instant data updates  
✅ **Search Functionality** - Search by **vinyl name, type, color, length, width, entry date**  
✅ **Sell Records** - Mark vinyl rolls as **sold** with customer details  
✅ **REST API** - Built with **Node.js & Express.js**  
✅ **Database** - Uses **MongoDB** for storing records  

---

## 📂 Project Structure
```
/backend
    ├── models/            # Mongoose Models
    ├── routes/            # API Routes
    ├── config/            # Database & App Configs
    ├── socket/            # Socket.io Handlers
    ├── server.js          # Main Backend Server

/frontend
    ├── css/               # Stylesheets
    ├── js/                # Frontend Scripts
    ├── index.html         # Dashboard
    ├── soldRecords.html   # Sold Vinyl Records Page
```

---

## ⚡ Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/vinyl-flooring-records.git
cd vinyl-flooring-records
```

### **2️⃣ Install Dependencies**
```sh
cd backend
npm install
```

### **3️⃣ Configure Environment Variables**
Create a `.env` file inside the `/backend` folder and add:
```
MONGO_URI=mongodb://localhost:27017/vinylDB
PORT=5000
```

### **4️⃣ Start the Backend Server**
```sh
npm start
```

### **5️⃣ Open the Frontend**
Simply open `index.html` in your browser.

---

## 🖥️ API Endpoints

### **Vinyl Rolls**
| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| `GET`  | `/api/vinyl`           | Fetch all vinyl rolls |
| `POST` | `/api/vinyl`           | Add a new vinyl roll |
| `PUT`  | `/api/vinyl/:id`       | Update a vinyl roll |
| `DELETE` | `/api/vinyl/:id`     | Delete a vinyl roll |

### **Sold Records**
| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| `GET`  | `/api/sold`            | Fetch sold records |
| `POST` | `/api/sold/sell`       | Mark a vinyl as sold |

---

## 📡 WebSockets (Real-time Updates)
This project uses **Socket.io** for **real-time notifications**.

### **Socket Events**
| Event Name           | Description |
|----------------------|-------------|
| `updateVinyls`      | Broadcasts when a vinyl is added/updated/deleted |
| `updateSoldRecords` | Broadcasts when a vinyl is sold |

---

## 🎯 Future Enhancements
🚀 **User Authentication** (Login/Signup for Admin)  
🚀 **Export to Excel/PDF** (Download reports)  
🚀 **Mobile-Friendly UI** (Better responsiveness)  

---

## 🛠️ Built With
- **Node.js** (Backend)
- **Express.js** (REST API)
- **MongoDB** (Database)
- **Socket.io** (Real-time updates)
- **HTML, CSS, JavaScript** (Frontend)

---

## 🤝 Contributing
Want to improve this project?  
1. **Fork** the repository
2. **Create a new branch** (`git checkout -b feature-name`)
3. **Commit changes** (`git commit -m "Added new feature"`)
4. **Push to GitHub** (`git push origin feature-name`)
5. **Create a Pull Request** 🎉

---

## 📝 License
This project is **open-source** and available under the **MIT License**.

---

### ⭐ **Give this project a star if you found it useful!** 🌟

