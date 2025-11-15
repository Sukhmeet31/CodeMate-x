import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode, Sparkles, X, Download, Scroll, BookOpen } from "lucide-react";
import CodeSnippets from "./CodeSnippets";

export default function CodeEditor({ code, setCode, theme = "light" }) {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [viewMode, setViewMode] = useState("split"); // split, editor, output
  const [showSnippets, setShowSnippets] = useState(false);
  const editorRef = useRef(null);
  const outputRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Output limit to prevent token exhaustion (max 2000 characters)
  const MAX_OUTPUT_LENGTH = 2000;
  const isDark = theme === "dark";
  const editorTheme = isDark ? "vs-dark" : "vs-light";

  const handleExplain = async () => {
    setLoading(true);
    setOutput("");
    try {
      const res = await axios.post("http://localhost:5000/api/explain", { 
        code: code.substring(0, 5000) // Limit input to prevent token exhaustion
      });
      let text = res.data.explanation || "No explanation found.";
      
      // Limit output length to prevent token exhaustion
      if (text.length > MAX_OUTPUT_LENGTH) {
        text = text.substring(0, MAX_OUTPUT_LENGTH) + "\n\n... (Response truncated to prevent token exhaustion)";
      }
      
      typeResponse(text);
    } catch {
      setOutput("❌ Error: Could not get explanation.");
    } finally {
      setLoading(false);
    }
  };

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (outputRef.current) {
        setScrollPosition(outputRef.current.scrollTop);
      }
    };

    const outputElement = outputRef.current;
    if (outputElement) {
      outputElement.addEventListener("scroll", handleScroll);
      return () => outputElement.removeEventListener("scroll", handleScroll);
    }
  }, [output]);

  const exportCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertSnippet = (snippetCode) => {
    setCode(code + "\n" + snippetCode);
    setShowSnippets(false);
  };

  function typeResponse(text) {
    let i = 0;
    setOutput("");
    const interval = setInterval(() => {
      setOutput((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`flex flex-col h-full backdrop-blur-xl rounded-2xl border shadow-xl p-4 relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-slate-900/80 border-slate-700 text-slate-100"
          : "bg-white/80 border-blue-200 text-gray-900"
      }`}
    >
      {/* Dynamic Background Effect */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1), transparent)",
            "radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.1), transparent)",
            "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1), transparent)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 -z-10 pointer-events-none"
      />
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isDark ? "border-slate-700" : "border-blue-200"}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileCode className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-800"}`}>Code Editor</h2>
          </div>
          {/* View Mode Toggle */}
          <div className={`flex items-center space-x-1 rounded-lg p-1 ${isDark ? "bg-slate-800" : "bg-blue-50"}`}>
            {["split", "editor", "output"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === mode
                    ? "bg-blue-600 text-white shadow-md"
                    : isDark
                      ? "text-slate-300 hover:text-blue-400"
                      : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleExplain}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Explaining..." : "Explain Code"}</span>
          </motion.button>

          <motion.button
            onClick={exportCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-md flex items-center space-x-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>

          <motion.button
            onClick={() => setShowSnippets(!showSnippets)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center space-x-2 text-sm font-medium ${
              showSnippets
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : isDark
                  ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-blue-400"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Snippets</span>
          </motion.button>
        </div>
      </div>

      {/* Code Snippets Panel */}
      <AnimatePresence>
        {showSnippets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <CodeSnippets onInsertSnippet={insertSnippet} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor with Dynamic View - Made Larger */}
      <AnimatePresence mode="wait">
        {(viewMode === "split" || viewMode === "editor") && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`${viewMode === "split" ? "flex-1 min-h-[70vh]" : "w-full h-[80vh]"} rounded-lg overflow-hidden border border-blue-200 shadow-inner bg-gray-900 relative`}
          >
            {/* Scroll Indicator */}
            {scrollPosition > 50 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 right-4 z-10 bg-blue-600/80 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1"
              >
                <Scroll className="w-3 h-3" />
                <span>Scrolling...</span>
              </motion.div>
            )}
            <Editor
              height="100%"
              theme={editorTheme}
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={(editor) => {
                editorRef.current = editor;
                // Smooth scroll effect
                editor.onDidScrollChange(() => {
                  const scrollTop = editor.getScrollTop();
                  setScrollPosition(scrollTop);
                });
              }}
              options={{
                fontSize: 16,
                minimap: { enabled: true },
                scrollBeyondLastLine: true,
                automaticLayout: true,
                wordWrap: "on",
                lineNumbers: "on",
                roundedSelection: false,
                cursorStyle: "line",
                readOnly: false,
                tabSize: 2,
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                quickSuggestions: true,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                padding: { top: 20, bottom: 20 },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation Output with Scroll Effect */}
      {output && (viewMode === "split" || viewMode === "output") && (
        <motion.div
          ref={outputRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        className={`${viewMode === "split" ? "mt-4 w-full max-h-[50vh]" : "w-full h-[70vh]"} ${
          isDark ? "bg-slate-900/90 border-slate-700 text-slate-100" : "bg-white/90 border-blue-200"
        } shadow-lg rounded-xl p-6 backdrop-blur-md overflow-y-auto transition-colors duration-500`}
          style={{
            scrollBehavior: "smooth",
            maxHeight: viewMode === "output" ? "60vh" : "auto"
          }}
        >
          <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold flex items-center space-x-2 ${isDark ? "text-blue-200" : "text-blue-800"}`}>
            <Sparkles className={`w-4 h-4 ${isDark ? "text-blue-300" : "text-blue-600"}`} />
            <span>Explanation</span>
            </h3>
            <button
              onClick={() => setOutput("")}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-100" : "bg-blue-100 hover:bg-blue-200 text-blue-700"}`}
            >
            <X className="w-4 h-4" />
            </button>
          </div>
          <div
          className={`leading-relaxed tracking-wide text-sm md:text-base ${isDark ? "text-slate-200" : "text-gray-900"}`}
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.8",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {output}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}