import { motion } from "framer-motion";
import { Code2, Copy, Check, Star, Search, Plus } from "lucide-react";
import { useState } from "react";

export default function CodeSnippets({ onInsertSnippet, theme = "light" }) {
  const [snippets, setSnippets] = useState([
    {
      id: 1,
      title: "Python Hello World",
      code: "print('Hello, World!')",
      language: "python",
      favorite: true,
      tags: ["basic", "hello-world"]
    },
    {
      id: 2,
      title: "React Component",
      code: "function MyComponent() {\n  return <div>Hello</div>;\n}",
      language: "javascript",
      favorite: false,
      tags: ["react", "component"]
    },
    {
      id: 3,
      title: "Async Function",
      code: "async function fetchData() {\n  const res = await fetch(url);\n  return res.json();\n}",
      language: "javascript",
      favorite: true,
      tags: ["async", "fetch"]
    },
    {
      id: 4,
      title: "Python List Comprehension",
      code: "squares = [x**2 for x in range(10)]",
      language: "python",
      favorite: false,
      tags: ["python", "list"]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filteredSnippets = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (id) => {
    setSnippets(snippets.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s));
  };

  const isDark = theme === "dark";

  return (
    <div className={`h-full backdrop-blur-xl rounded-2xl border shadow-xl p-4 flex flex-col transition-colors duration-500 ${
      isDark ? "bg-slate-900/80 border-slate-700 text-slate-100" : "bg-white/80 border-blue-200"
    }`}>
      <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isDark ? "border-slate-700" : "border-blue-200"}`}>
        <div className="flex items-center space-x-2">
          <Code2 className={`w-5 h-5 ${isDark ? "text-blue-300" : "text-blue-600"}`} />
          <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-800"}`}>Code Snippets</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors ${
            isDark ? "border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500" : "border-blue-200 bg-white/80 text-gray-800"
          }`}
        />
      </div>

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredSnippets.map((snippet, index) => (
          <motion.div
            key={snippet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg p-3 border transition-all ${
              isDark
                ? "bg-slate-900/70 border-slate-700 hover:border-blue-400"
                : "bg-blue-50 border-blue-100 hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-800"}`}>{snippet.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-blue-500/30 text-blue-200" : "bg-blue-200 text-blue-700"}`}>
                    {snippet.language}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {snippet.tags.map((tag, i) => (
                    <span key={i} className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>#{tag}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(snippet.id)}
                className={`p-1 ${snippet.favorite ? "text-yellow-500" : isDark ? "text-slate-500" : "text-gray-400"}`}
              >
                <Star className={`w-4 h-4 ${snippet.favorite ? "fill-current" : ""}`} />
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">
              {snippet.code}
            </pre>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => copyToClipboard(snippet.code, snippet.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium flex items-center justify-center space-x-1"
              >
                {copiedId === snippet.id ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={() => onInsertSnippet && onInsertSnippet(snippet.code)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium"
              >
                Insert
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

