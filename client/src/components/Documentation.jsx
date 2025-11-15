import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  MessageSquare,
  FileCode,
  Zap,
  HelpCircle,
  ChevronRight,
  Terminal,
  Settings,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function Documentation({ onNavigate }) {
  const sections = [
    {
      icon: Code2,
      title: "Getting Started",
      description: "Learn the basics of CodeMate X",
      color: "from-blue-500 to-blue-600",
      items: [
        "Create your account",
        "Navigate the dashboard",
        "Understand the interface",
        "First steps with AI assistant"
      ]
    },
    {
      icon: MessageSquare,
      title: "AI Chat",
      description: "Master the chat interface",
      color: "from-indigo-500 to-indigo-600",
      items: [
        "Ask coding questions",
        "Get code explanations",
        "Debug your code",
        "Best practices for prompts"
      ]
    },
    {
      icon: FileCode,
      title: "Code Editor",
      description: "Write and edit code efficiently",
      color: "from-purple-500 to-purple-600",
      items: [
        "Using the Monaco editor",
        "Syntax highlighting",
        "Code formatting",
        "Keyboard shortcuts"
      ]
    },
    {
      icon: Zap,
      title: "AI Features",
      description: "Leverage AI-powered tools",
      color: "from-green-500 to-green-600",
      items: [
        "Auto-fix code errors",
        "Code explanations",
        "Code suggestions",
        "Performance optimization"
      ]
    }
  ];

  const quickStart = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your free account in seconds",
      action: "Get Started"
    },
    {
      step: 2,
      title: "Explore Dashboard",
      description: "Familiarize yourself with the interface",
      action: "View Dashboard"
    },
    {
      step: 3,
      title: "Start Coding",
      description: "Use the editor or chat to begin",
      action: "Open Editor"
    }
  ];

  const faqs = [
    {
      question: "Is CodeMate X free?",
      answer: "Yes! CodeMate X is completely free to use forever. No credit card required."
    },
    {
      question: "What programming languages are supported?",
      answer: "CodeMate X supports all major programming languages including Python, JavaScript, Java, C++, and many more."
    },
    {
      question: "How does the AI assistant work?",
      answer: "Our AI assistant uses advanced language models to understand your code and provide helpful explanations, fixes, and suggestions."
    },
    {
      question: "Can I use CodeMate X offline?",
      answer: "CodeMate X requires an internet connection to access the AI features, but you can use the code editor offline for basic editing."
    },
    {
      question: "Is my code secure?",
      answer: "Yes, we take security seriously. Your code and conversations are encrypted and kept private."
    }
  ];

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-4"
          >
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Documentation & Guide</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 max-w-3xl"
          >
            Everything you need to know to get the most out of CodeMate X. From getting started to advanced features.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12">
        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span>Quick Start Guide</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickStart.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <button
                  onClick={() => {
                    if (item.step === 1) onNavigate("dashboard");
                    else if (item.step === 2) onNavigate("dashboard");
                    else if (item.step === 3) onNavigate("editor");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                >
                  <span>{item.action}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Documentation Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} p-3 mb-4 flex items-center justify-center`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Guide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Terminal className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Code Editor</h3>
              <p className="text-gray-600 text-sm">
                Powerful Monaco editor with syntax highlighting, auto-completion, and multiple language support.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <MessageSquare className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Chat</h3>
              <p className="text-gray-600 text-sm">
                Chat with our AI assistant to get explanations, debug code, and learn programming concepts.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Zap className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-Fix</h3>
              <p className="text-gray-600 text-sm">
                Automatically detect and fix common code errors with AI-powered suggestions.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Settings className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Customizable</h3>
              <p className="text-gray-600 text-sm">
                Customize your workspace, themes, and preferences to match your coding style.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-xl p-6 shadow-md border border-blue-100"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-6">Start coding with AI assistance today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => onNavigate("editor")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg"
            >
              Open Editor
            </motion.button>
            <motion.button
              onClick={() => onNavigate("chat")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-white/30"
            >
              Start Chatting
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

