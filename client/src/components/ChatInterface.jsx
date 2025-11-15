import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { from: "ai", text: "👋 Hi! I'm CodeMate X — ask me anything about code. I can help you understand, debug, and improve your code!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const MAX_OUTPUT_LENGTH = 2000; // Limit to prevent token exhaustion

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { from: "user", text: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/explain", {
        code: userMessage.substring(0, 5000), // Limit input
      });
      let responseText = res.data.explanation || "No response 🤖";
      
      // Limit output length to prevent token exhaustion
      if (responseText.length > MAX_OUTPUT_LENGTH) {
        responseText = responseText.substring(0, MAX_OUTPUT_LENGTH) + "\n\n... (Response truncated to prevent token exhaustion)";
      }
      
      setMessages([
        ...newMessages,
        { from: "ai", text: responseText },
      ]);
    } catch {
      setMessages([...newMessages, { from: "ai", text: "❌ Error getting answer. Please try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center flex-1 px-4 md:px-6 py-6 w-full"
    >
      <div className="w-full max-w-4xl h-[75vh] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-blue-200 dark:border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-blue-100">Ready to help with your code</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900/60 dark:to-slate-900">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-3 ${
                  msg.from === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.from === "ai"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200"
                    : "bg-indigo-600 text-white"
                }`}>
                  {msg.from === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <motion.div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    msg.from === "ai"
                      ? "bg-white border border-blue-200 text-gray-800 shadow-sm dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-100"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-blue-200 dark:border-slate-700 rounded-b-3xl transition-colors">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask something about code..."
              className="flex-1 p-3 rounded-xl border-2 border-blue-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50 dark:bg-slate-800/70 dark:text-slate-100 transition-all"
              disabled={loading}
            />
            <motion.button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </motion.div>
  );
}
