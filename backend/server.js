const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const vinylRoutes = require("./routes/vinylRoutes");
const soldRoutes = require("./routes/soldRoutes");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Attach io to app (Ensures Socket.io works inside routes)
app.set("io", io);

// CORS Configuration
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.use("/api/soldRecords", soldRoutes); // ✅ Add Sold Records Route


// ✅ Register API Routes
app.use("/api/vinyl", vinylRoutes);
app.use("/api/sold", soldRoutes);

// ✅ Serve Frontend Static Files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ✅ Ensure API requests don’t return HTML by handling unknown API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found." });
});

// ✅ Serve `index.html` only for non-API routes
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ Socket.io Connection Handling
io.on("connection", (socket) => {
    console.log("🔌 A user connected");

    socket.on("newVinyl", () => {
        io.emit("updateVinyls");
    });

    socket.on("newSale", () => {
        io.emit("updateSoldRecords");
    });

    socket.on("disconnect", () => {
        console.log("🔌 A user disconnected");
    });
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
