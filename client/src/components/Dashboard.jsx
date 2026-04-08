import { motion } from "framer-motion";
import {
  MessageSquare,
  FileCode,
  Sparkles,
  ArrowRight,
  BookOpen,
  Settings,
  Folder,
  BarChart3,
  Activity,
} from "lucide-react";
import AnimatedGridBackground from "./AnimatedGridBackground";

export default function Dashboard({ onNavigate }) {
  return (
    <div className="min-h-screen pb-12 relative">
      <AnimatedGridBackground />

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400 opacity-15 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-indigo-400 opacity-15 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8 overflow-hidden rounded-b-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-6 py-16 text-white shadow-2xl md:px-12"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4 flex items-center space-x-3"
          >
            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold md:text-5xl">Workspace</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 text-xl text-blue-100 md:text-2xl"
          >
            Open a tool to start working. Activity, projects, and analytics will appear here once real data is available.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => onNavigate("chat")}
              className="flex items-center space-x-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg transition-all hover:scale-105 hover:bg-blue-50 hover:shadow-xl"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Open Chat</span>
            </button>
            <button
              onClick={() => onNavigate("editor")}
              className="flex items-center space-x-2 rounded-xl border-2 border-white/30 bg-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/30"
            >
              <FileCode className="h-5 w-5" />
              <span>Open Editor</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:px-12 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl lg:col-span-2"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Tools</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button
              onClick={() => onNavigate("chat")}
              className="group rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-left text-white transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between">
                <MessageSquare className="h-8 w-8" />
                <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Chat</h3>
              <p className="text-sm text-white/80">Ask questions and work with the assistant.</p>
            </button>

            <button
              onClick={() => onNavigate("editor")}
              className="group rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-left text-white transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between">
                <FileCode className="h-8 w-8" />
                <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Editor</h3>
              <p className="text-sm text-white/80">Write code and request explanations.</p>
            </button>

            <button
              onClick={() => onNavigate("docs")}
              className="group rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-left text-white transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between">
                <BookOpen className="h-8 w-8" />
                <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Docs</h3>
              <p className="text-sm text-white/80">Browse guides for the current features.</p>
            </button>

            <button
              onClick={() => onNavigate("projects")}
              className="group rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-left text-white transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between">
                <Folder className="h-8 w-8" />
                <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Projects</h3>
              <p className="text-sm text-white/80">View your project list when real data is connected.</p>
            </button>

            <button
              onClick={() => onNavigate("analytics")}
              className="group rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-left text-white transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between">
                <BarChart3 className="h-8 w-8" />
                <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Analytics</h3>
              <p className="text-sm text-white/80">Metrics will appear here once they are backed by real data.</p>
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className="group rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 p-6 text-left text-white transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between">
                <Settings className="h-8 w-8" />
                <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 text-xl font-semibold">Settings</h3>
              <p className="text-sm text-white/80">Adjust the local workspace preferences.</p>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center space-x-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Activity</h2>
          </div>
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-6 text-center">
            <p className="font-semibold text-gray-800">No activity yet.</p>
            <p className="mt-2 text-sm text-gray-600">
              Recent activity will appear here when the app stores real project, chat, or analytics history.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
