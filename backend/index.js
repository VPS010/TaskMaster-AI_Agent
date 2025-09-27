const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connectdb");
const { TodoAIChat } = require("./ai_agent/agent");
const { todo } = require("./db/modle");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

dotenv.config();
const app = express();
const server = http.createServer(app);
connectDB();
app.use(express.json());

app.use(cors({
    origin: true,
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST"]
    }
});


// Session storage
const sessions = new Map();

//TodoAIChat instance
const todoAI = new TodoAIChat();

// WebSocket connection
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Initialize session
    sessions.set(socket.id, {
        history: [],
        todoState: []
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        sessions.delete(socket.id);
    });

    // In the socket.io message handler:
    socket.on("message", async (message) => {
        try {
            const session = sessions.get(socket.id);
            const chat = await todoAI.createNewChat(session.history);

            // Send user message
            const result = await chat.sendMessage([{
                text: JSON.stringify({
                    type: "user_input",
                    content: { message: message }
                })

            }]);

            console.log("User message:", message);// for debugging
            console.log("Model response:", result.response.candidates[0].content); //for debugging 

            // Process initial response
            const { finalOutput, requiresUpdate } = await todoAI.processResponse(
                chat,
                result.response,
                (response) => {
                    // Send intermediate responses to client
                    socket.emit("response", {
                        type: "response",
                        content: response
                    });
                }
            );

            // Store history with proper roles
            session.history.push({
                role: "user",
                content: message
            });
            session.history.push({
                role: "model",
                content: finalOutput
            });

            // Send final response

            if (requiresUpdate) {
                const todos = await todo.find({});
                io.emit("todoUpdated", todos);
            }
        } catch (error) {
            console.error("Error:", error);
            socket.emit("response", {
                type: "error",
                content: "My circuits are a bit fried... Try again?"
            });
        }
    });
});

// Routes
app.get("/todos", async (req, res) => {
    try {
        const todos = await todo.find({});
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

app.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await todo.deleteOne({ _id: id });
        const todos = await todo.find({});
        io.emit("todoUpdated", todos);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete todo" });
    }
});

app.put("/done/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const todoItem = await todo.findOne({ _id: id });
        todoItem.done = !todoItem.done;
        await todoItem.save();
        const todos = await todo.find({});
        io.emit("todoUpdated", todos);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle todo" });
    }
});



server.listen(3000, () => {
    console.log(">> Server running on port 3000");
});