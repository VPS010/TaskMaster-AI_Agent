# TaskMaster AI

TaskMaster AI is an AI-powered to-do manager built with **React and Node.js**. Designed to explore the capabilities of large language models (LLMs) without relying on specialized AI agent frameworks, it helps users manage tasks while delivering witty, sarcastic responses. 

It leverages the **gemini-2.5-flash** model developed by Google.
This fast and versatile multimodal model supports an input context window of up to 1,048,576 tokens and can generate up to 8,192 tokens in a single request, making it highly efficient for diverse AI tasks. 
Best of all, access to the Gemini API is available free of charge through Google AI Studio and Vertex AI.

It also leverages [Socket.IO](https://socket.io) for real-time communication between clients and the server. Each client connection is assigned a unique `socket.id`, which is used to track individual sessions, including chat history and the current to-do state.

When a new client connects, a session is created and stored using their unique `socket.id`. This allows the server to manage personalized chat history and task data. When a client disconnects, its session is automatically removed.

## Features
- **Real-time task management:** Create, delete, categorize, and prioritize tasks.
- **AI-driven responses:** Enjoy humorous, sarcastic interactions while managing your to-dos.
- **Chat history & session management:** Each user connection is tracked individually for personalized interactions.
- **Global task storage:** Todos are shared across users (since no user authentication implemented yet).

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Real-time Communication:** Socket.IO
- **AI Model Integration:** Gemini 1.5 Flash-002

## 📦 Installation
### Clone the Repository
```bash
 git clone https://github.com/VPS010/TaskMaster-AI_Agent
 cd TaskMaster-AI_Agent
```

### Install Dependencies and run Backend and frontend
#### Backend
```bash
cd backend
npm install
```
#### Frontend
```bash
cd frontend
npm install
```

### Run the Application
#### Start Backend Server
```bash
cd backend
npm start
```
#### Start Frontend Client
```bash
cd frontend
npm run dev
```
Could also use docker-compose to start the mongodb container insted of using MongodbAtlas link in Backend.
