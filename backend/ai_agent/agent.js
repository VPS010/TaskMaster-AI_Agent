const { GoogleGenerativeAI } = require("@google/generative-ai");
const todoTools = require("../tools/aiTools");
const SYSTEM_PROMPT = require("../tools/sysPrompt");

const validTools = ['getalltodos', 'createtodo', 'searchtodo', 'deletetodo', 'toggletodo'];

class TodoAIChat {

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.initializeModel();
        this.tools = this.setupTools();
    }

    initializeModel() {
        return this.genAI.getGenerativeModel({
            // FIXED: Use the correct model name
            model: "gemini-2.5-flash", // Changed from "gemini-1.5-flash"
            // Alternative options:
            // model: "gemini-1.5-flash-001",
            // model: "gemini-1.5-flash-002", 
            // model: "gemini-pro", // If flash models aren't available
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE",
                },
            ],
        });
    }

    setupTools() {
        return [
            {
                functionDeclarations: [
                    {
                        name: "getalltodos",
                        description: "Retrieve all todo items",
                    },
                    {
                        name: "createtodo",
                        description: "Create a new todo item",
                        parameters: {
                            type: "object",
                            properties: {
                                todoText: {
                                    type: "string",
                                    description: "The text content of the todo item",
                                },
                            },
                            required: ["todoText"],
                        },
                    },
                    {
                        name: "searchtodo",
                        description: "Search todo items",
                        parameters: {
                            type: "object",
                            properties: {
                                search: {
                                    type: "string",
                                    description: "Search query string",
                                },
                            },
                            required: ["search"],
                        },
                    },
                    {
                        name: "deletetodo",
                        description: "Delete a todo item",
                        parameters: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string",
                                    description: "MongoDB _id of the todo to delete",
                                },
                            },
                            required: ["id"],
                        },
                    },
                    {
                        name: "toggletodo",
                        description: "Toggle the completion status of a todo item",
                        parameters: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string",
                                    description: "MongoDB _id of the todo to toggle",
                                },
                            },
                            required: ["id"],
                        },
                    },
                ],
            },
        ];
    }

    createObservation(toolName, result) {
        const observations = {
            getalltodos: {
                type: "observation",
                content: {
                    source: "getalltodos",
                    count: result.data?.length || 0,
                    todos: result.data || []
                }
            },
            toggletodo: {
                type: "observation",
                content: {
                    source: "toggletodo",
                    todo: result.data || {}
                }
            },
            createtodo: {
                type: "observation",
                content: {
                    source: "createtodo",
                    createdId: result.data?.id || 'unknown'
                }
            },
            deletetodo: {
                type: "observation",
                content: {
                    source: "deletetodo",
                    deletedId: result.data || 'unknown'
                }
            }
        };

        return observations[toolName] || {
            type: "observation",
            content: result
        };
    }

    sanitizeResult(result) {
        // Handle array results
        if (result.data && Array.isArray(result.data)) {
            return {
                ...result,
                data: result.data.map(item => ({
                    ...item,
                    _id: item._id ? item._id.toString() : 'invalid-id',
                    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
                    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined
                }))
            };
        }

        // Handle single object results
        if (result.data && typeof result.data === 'object') {
            return {
                ...result,
                data: {
                    ...result.data,
                    _id: result.data._id ? result.data._id.toString() : 'invalid-id',
                    createdAt: result.data.createdAt ? new Date(result.data.createdAt).toISOString() : undefined,
                    updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt).toISOString() : undefined
                }
            };
        }

        return result;
    }

    async handleFunctionCall(chat, name, args) {
        console.log(`⚙️ Calling function: ${name}`, args);
        try {
            if (!validTools.includes(name)) {
                throw new Error(`Invalid function call: ${name}`);
            }

            const result = await todoTools[name](args);
            console.log(`✅ Function result:`, result);

            // Add validation for result
            if (!result || (typeof result !== 'object')) {
                throw new Error(`Invalid result from function ${name}`);
            }

            // Convert MongoDB data to plain objects
            const sanitizedResult = this.sanitizeResult(result);

            // Create observation message
            const observation = this.createObservation(name, sanitizedResult);

            // Ensure observation is valid and has content
            if (!observation || typeof observation !== 'object') {
                throw new Error("Invalid observation generated");
            }

            // Convert observation to string and validate it's not empty
            const observationText = JSON.stringify(observation);
            if (!observationText || observationText.trim() === '') {
                throw new Error("Empty observation text generated");
            }

            // Send observation to continue conversation
            const response = await chat.sendMessage([{
                text: observationText
            }]);

            return response;
        } catch (error) {
            console.error(`❌ Function error:`, error);
            // Ensure error message is not empty
            const errorMessage = {
                type: "error",
                content: { message: error.message || "Unknown error occurred" }
            };

            await chat.sendMessage([{
                text: JSON.stringify(errorMessage)
            }]);
            throw error;
        }
    }

    async processResponse(chat, response, onPartialResponse) {
        let finalOutput = '';
        let requiresUpdate = false;

        try {
            const processPart = async (part) => {
                if (part.text) {
                    // Validate and clean text before parsing
                    const cleanText = this.decodeAllHtmlEntities(part.text);
                    
                    // Check if response contains HTML entities and log warning
                    if (part.text !== cleanText) {
                        console.warn("⚠️ HTML entities detected and cleaned:", part.text.substring(0, 100));
                    }
                    
                    const parsedResponses = this.parseResponse(cleanText);
                    for (const parsed of parsedResponses) {
                        if (parsed.type === "output") {
                            finalOutput = parsed.content.message;
                            onPartialResponse?.(parsed.content);
                            requiresUpdate = true;
                        }

                        if (parsed.type === "action" && parsed.content.tool) {
                            const result = await this.handleFunctionCall(
                                chat,
                                parsed.content.tool,
                                parsed.content.parameters
                            );
                            requiresUpdate = true;

                            if (result && result.response) {
                                const subResponse = await this.processResponse(
                                    chat,
                                    result.response,
                                    onPartialResponse
                                );
                                finalOutput = subResponse.finalOutput || finalOutput;
                            }
                        }
                    }
                }
            };

            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                // Handle function calls directly from parts
                if (part.functionCall) {
                    const result = await this.handleFunctionCall(
                        chat,
                        part.functionCall.name,
                        part.functionCall.args
                    );
                    requiresUpdate = true;

                    // Process subsequent responses recursively
                    if (result && result.response) {
                        const subResponse = await this.processResponse(
                            chat,
                            result.response,
                            onPartialResponse
                        );
                        finalOutput = subResponse.finalOutput || finalOutput;
                    }
                } else {
                    await processPart(part);
                }
            }

        } catch (error) {
            console.error('🚨 Response Processing Error:', error);
            finalOutput = "Yikes! Something went sideways. Maybe try a different approach?";
        }

        return { finalOutput, requiresUpdate };
    }

    async processUserInput(input, history) {
        // Validate input        
        if (!input || typeof input !== 'string' || input.trim() === '') {
            console.error("Invalid input: input must be a non-empty string");
            return {
                message: "Please provide a valid input.",
                requiresUpdate: false
            };
        }
        try {
            const chat = await this.createNewChat(history);

            const sanitizedInput = input.trim();
            if (sanitizedInput.length > 0) {
                const result = await chat.sendMessage([{
                    text: JSON.stringify({
                        type: "user_input",
                        content: { message: sanitizedInput }
                    })
                }]);

                const response = await this.processResponse(chat, result.response);
                return {
                    message: response.finalOutput,
                    requiresUpdate: response.requiresUpdate
                };
            }
        } catch (error) {
            console.error("Processing error:", error);
            return {
                message: "Let me try that again... What was that you wanted?",
                requiresUpdate: false
            };
        }
    }

    async createNewChat(history) {
        // Convert stored history to proper role structure
        const rebuiltHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        return this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System: ${SYSTEM_PROMPT}` }]
                },
                {
                    role: "model",
                    parts: [{ text: JSON.stringify({ type: "start", content: { status: "initialized" } }) }]
                },
                ...rebuiltHistory
            ],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.9 },
            tools: this.tools
        });
    }

    decodeAllHtmlEntities(text) {
        if (!text || typeof text !== 'string') return text;
        
        return text
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/&#x60;/g, '`')
            .replace(/&#x3D;/g, '=');
    }

    parseResponse(text) {
        try {
            if (!text || typeof text !== 'string' || text.trim() === '') {
                return [{ type: "error", content: { message: "Empty response received" } }];
            }

            // Decode ALL HTML entities first
            let cleanText = this.decodeAllHtmlEntities(text)
                .replace(/```(json)?/g, "")
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .trim();

            const results = [];
            
            // Split by newlines and try each line
            const lines = cleanText.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
                    try {
                        results.push(JSON.parse(trimmedLine));
                        continue;
                    } catch (e) {}
                }
            }

            // If no line parsing worked, try extracting JSON blocks
            if (results.length === 0) {
                // More aggressive JSON extraction
                let depth = 0;
                let start = -1;
                
                for (let i = 0; i < cleanText.length; i++) {
                    if (cleanText[i] === '{') {
                        if (depth === 0) start = i;
                        depth++;
                    } else if (cleanText[i] === '}') {
                        depth--;
                        if (depth === 0 && start !== -1) {
                            const jsonStr = cleanText.substring(start, i + 1);
                            try {
                                results.push(JSON.parse(jsonStr));
                            } catch (e) {
                                console.error("JSON parse failed:", jsonStr.substring(0, 100) + "...");
                            }
                            start = -1;
                        }
                    }
                }
            }

            return results.length > 0 ? results : [{
                type: "error",
                content: { message: "No valid JSON found" }
            }];
        } catch (error) {
            console.error("Parse error:", error);
            return [{ type: "error", content: { message: "Parse failed" } }];
        }
    }

    // Optional: Add a method to list available models for debugging
    async listAvailableModels() {
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
            const data = await response.json();
            console.log("Available models:", data.models?.map(m => m.name));
            return data.models;
        } catch (error) {
            console.error("Failed to list models:", error);
        }
    }
}

module.exports = { TodoAIChat }