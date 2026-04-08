import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("CodeMate X Gemini backend is running 🚀");
});

app.post("/api/explain", async (req, res) => {
  const { code } = req.body;
  try {
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required." });
    }

    // If user entered a normal question instead of code
    const isCode =
      code.includes("function") ||
      code.includes("def") ||
      code.includes(";") ||
      code.includes("{") ||
      code.includes("=");

    const prompt = isCode
      ? `Explain this code in simple terms:\n\n${code}`
      : `You are CodeMate X, a friendly AI assistant for programmers.
         Answer this naturally and helpfully:\n\n${code}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Send only one clean response
    return res.json({ explanation: text });
  } catch (error) {
    console.error("Error in /api/explain:", error.message);
    if (!res.headersSent)
      return res.status(500).json({ error: "Failed to explain." });
  }
});


app.post("/api/chat", async (req, res) => {
  const { messages, query, code } = req.body;
  try {
    const normalizedMessages = Array.isArray(messages)
      ? messages
          .filter((message) => message?.content)
          .map((message) => ({
            role: typeof message.role === "string" ? message.role : "user",
            content: String(message.content),
          }))
      : [];

    if (!normalizedMessages.length) {
      const synthesizedPrompt = [query, code].filter(Boolean).join("\n\n");
      if (!synthesizedPrompt.trim()) {
        return res.status(400).json({ error: "A chat message is required." });
      }

      normalizedMessages.push({ role: "user", content: synthesizedPrompt });
    }

    const conversation = normalizedMessages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join("\n\n");
    const result = await model.generateContent(conversation);
    res.json({ reply: result.response.text() });
  } catch (e) {
    console.error("Error in /api/chat:", e.message);
    res.status(500).json({ error: "Chat failed" });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
