import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import Robot from "./Bot/Bot_run";

// Import Components
import ChatHeader from "./components/ChatHeader";
import ChatMessage from "./components/ChatMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import ChatInput from "./components/ChatInput";
import TodoHeader from "./components/TodoHeader";
import TodoList from "./components/TodoList";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(BASE_URL);

const TodoChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [botState, setBotState] = useState({
    expression: "idle",
    message: "Ready to assist you!",
    parameters: null,
  });
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchTodos();

    socket.on("response", (response) => {
      console.log("Backend Response Message:", response.content);
      if (!response.content.message) return;

      // First set loading to false as we received the response
      setLoading(false);

      // Process the bot expression data from the backend
      if (response.content.expression) {
        // Check if expression is an object with expression and parameters properties
        if (
          typeof response.content.expression === "object" &&
          response.content.expression.expression
        ) {
          // New format
          setBotState({
            expression: response.content.expression.expression,
            message: response.content.message,
            parameters: response.content.expression.parameters,
          });
        } else {
          // Old format (just the expression string)
          setBotState({
            expression: response.content.expression,
            message: response.content.message,
            parameters: null,
          });
        }
      } else {
        // If no expression is provided, set to idle
        setBotState({
          expression: "idle",
          message: response.content.message,
          parameters: null,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: response.content.message,
          emoji: [
            "🤖",
            "😒",
            "🙄",
            "😏",
            "😓",
            "🤨",
            "🫡",
            "🙄",
            "🤪",
            "😤",
            "😒",
          ][Math.floor(Math.random() * 11)],
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (response.content.requiresUpdate) {
        fetchTodos();
      }
    });

    socket.on("todoUpdated", (updatedTodos) => {
      setTodos(updatedTodos);
    });

    return () => {
      socket.off("response");
      socket.off("todoUpdated");
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    console.log("User Message:", userMessage);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Set loading to true first
    setLoading(true);

    // Set bot to thinking expression with specific parameters
    setBotState({
      expression: "expressThinking",
      message: "Let me think about that...",
      parameters: {
        eyes: {
          shape: "focused",
          animation: "scanLeftRight",
          color: "#00FFFF",
        },
        mouth: {
          shape: "line",
          pulsate: true,
          width: 1.0,
        },
        head: {
          tilt: 3,
          hoverAmplitude: 2,
          hoverSpeed: 2,
        },
      },
    });

    // Send the message to the server
    socket.emit("message", input);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/delete/${id}`);
      await fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`${BASE_URL}/done/${id}`);
      await fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 animate-gradient-x">
      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-6">
        {/* Mobile Toggle Button */}
        <button
          className="md:hidden w-full mb-2 py-2 px-4 bg-purple-600 text-white rounded-lg font-medium"
          onClick={() => setShowTodoList(!showTodoList)}
        >
          {showTodoList ? "Show Chat" : `Show Todo List (${todos.length})`}
        </button>

        {/* Chat Section */}
        <div
          className={`flex-1 flex flex-col bg-gray-900/80 rounded-2xl overflow-hidden border-2 border-purple-500/30 backdrop-blur-lg ${
            showTodoList ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatHeader />

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {loading && <LoadingIndicator />}
            <div ref={chatEndRef} />
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={loading}
          />
        </div>

        {/* Todo List Section */}
        <div
          className={`h-[90%] md:h-full  md:w-96 flex flex-col bg-gray-900/80 rounded-2xl border-2 border-green-400/30 backdrop-blur-lg ${
            showTodoList ? "flex" : "hidden md:flex"
          }`}
        >
          <TodoHeader todoCount={todos.length} />
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Robot positioned slightly left of center horizontally and centered vertically */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1/2 z-40 pointer-events-none">
        <Robot
          expression={botState.expression}
          message={botState.message}
          parameters={botState.parameters}
        />
      </div>
    </div>
  );
};

export default TodoChatApp;
