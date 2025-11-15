import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import { Bot, Loader2 } from "lucide-react";

export default function AssistantPanel({ code, theme = "light" }) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const MAX_OUTPUT_LENGTH = 2000; // Limit to prevent token exhaustion
  const isDark = theme === "dark";

  const handleAsk = async () => {
    if (!question.trim() && !code) return;
    setLoading(true);
    setResponse("");

    try {
      const endpoint = question.includes("function") || question.includes("def") || question.includes("explain")
        ? "/api/explain"
        : "/api/chat";

      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        code: code ? code.substring(0, 5000) : question.substring(0, 5000), // Limit input
        query: question.substring(0, 500) // Limit query length
      });

      let responseText = res.data.explanation || res.data.reply || "No response.";
      
      // Limit output length to prevent token exhaustion
      if (responseText.length > MAX_OUTPUT_LENGTH) {
        responseText = responseText.substring(0, MAX_OUTPUT_LENGTH) + "\n\n... (Response truncated to prevent token exhaustion)";
      }

      setResponse(responseText);
    } catch (e) {
      setResponse("⚠️ Error: Could not get response from AI. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`h-full flex flex-col rounded-2xl backdrop-blur-xl border p-4 shadow-xl transition-colors duration-500 ${
        isDark ? "bg-slate-900/70 border-slate-700 text-slate-100" : "bg-white/70 border-indigo-100"
      }`}
    >
      <h2 className={`text-lg font-semibold mb-3 ${isDark ? "text-blue-300" : "text-indigo-600"}`}>
        AI Assistant
      </h2>

      <textarea
        placeholder="Ask a question about your code, request explanations, or get help..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleAsk();
          }
        }}
        className={`w-full p-3 h-28 mb-3 rounded-lg border resize-none transition-colors ${
          isDark
            ? "border-slate-600 bg-slate-800/70 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            : "border-indigo-200 bg-white/60 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        }`}
      />
      <p className="text-xs text-gray-500 mb-3">Press Ctrl+Enter to send</p>

      <motion.button
        onClick={handleAsk}
        disabled={loading || (!question.trim() && !code)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mb-4 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed w-full font-medium"
      >
        {loading ? "Analyzing..." : "Ask AI Assistant"}
      </motion.button>

      <div className={`flex-1 overflow-y-auto rounded-lg p-4 text-sm border transition-colors ${
        isDark
          ? "bg-slate-900/60 border-slate-700 text-slate-200"
          : "bg-white/60 border-indigo-100 text-gray-700"
      }`}>
        {loading ? (
          <div className="flex items-center justify-center space-x-2 text-indigo-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        ) : response ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className={`w-4 h-4 ${isDark ? "text-blue-300" : "text-indigo-600"}`} />
              <span className={`font-semibold ${isDark ? "text-blue-200" : "text-indigo-700"}`}>AI Response:</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{response}</div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Bot className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-blue-300" : "text-indigo-300"}`} />
            <p className={`${isDark ? "text-slate-300" : "text-gray-500"}`}>Ask a question about your code above</p>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-gray-400"}`}>or use the Explain Code button in the editor</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
