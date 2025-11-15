import { motion } from "framer-motion";
import { 
  Code2, 
  MessageSquare, 
  FileCode, 
  Zap, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  ArrowRight,
  Sparkles,
  BookOpen,
  Settings,
  BarChart3,
  Activity,
  Folder
} from "lucide-react";
import AnimatedGridBackground from "./AnimatedGridBackground";

export default function Dashboard({ onNavigate }) {
  const stats = [
    { icon: FileCode, label: "Projects", value: "12", color: "from-blue-500 to-blue-600", change: "+3 this month" },
    { icon: MessageSquare, label: "Chats", value: "48", color: "from-indigo-500 to-indigo-600", change: "+12 today" },
    { icon: Zap, label: "AI Requests", value: "1.2K", color: "from-purple-500 to-purple-600", change: "+156 today" },
    { icon: Clock, label: "Time Saved", value: "24h", color: "from-green-500 to-green-600", change: "This week" },
  ];

  const quickActions = [
    { 
      icon: MessageSquare, 
      title: "Start Chat", 
      description: "Ask questions about code",
      color: "from-blue-500 to-indigo-600",
      action: () => onNavigate("chat")
    },
    { 
      icon: FileCode, 
      title: "Code Editor", 
      description: "Write and debug code",
      color: "from-indigo-500 to-purple-600",
      action: () => onNavigate("editor")
    },
    { 
      icon: BookOpen, 
      title: "Documentation", 
      description: "Browse guides and tutorials",
      color: "from-purple-500 to-pink-600",
      action: () => onNavigate("docs")
    },
    { 
      icon: Settings, 
      title: "Settings", 
      description: "Configure your workspace",
      color: "from-gray-500 to-gray-600",
      action: () => onNavigate("settings")
    },
    { 
      icon: Folder, 
      title: "Projects", 
      description: "Manage your coding projects",
      color: "from-emerald-500 to-teal-600",
      action: () => onNavigate("projects")
    },
    { 
      icon: BarChart3, 
      title: "Analytics", 
      description: "View your coding statistics",
      color: "from-orange-500 to-red-600",
      action: () => onNavigate("analytics")
    },
  ];

  const recentActivity = [
    { type: "chat", title: "Explained React Hooks", time: "2 hours ago", icon: MessageSquare },
    { type: "code", title: "Fixed Python function", time: "5 hours ago", icon: FileCode },
    { type: "chat", title: "Debugged JavaScript error", time: "1 day ago", icon: MessageSquare },
    { type: "code", title: "Created new project", time: "2 days ago", icon: FileCode },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pb-12 relative">
      {/* Devin-style Glowing Moving Lines Background */}
      <AnimatedGridBackground />
      
      {/* Additional Animated Background Elements */}
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
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
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
            delay: 0.5
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
        />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-6 md:px-12 rounded-b-3xl shadow-2xl mb-8"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center space-x-3 mb-4"
          >
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Welcome Back!</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl md:text-2xl text-blue-100 mb-6"
          >
            Your AI-powered coding companion is ready to help
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => onNavigate("chat")}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Chatting</span>
            </button>
            <button
              onClick={() => onNavigate("editor")}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all border-2 border-white/30 flex items-center space-x-2"
            >
              <FileCode className="w-5 h-5" />
              <span>Open Editor</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 mb-4 flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-blue-600 text-xs font-medium">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <span>Quick Actions</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={action.action}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl bg-gradient-to-br ${action.color} text-white text-left hover:shadow-xl transition-all group`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <action.icon className="w-8 h-8 mb-2" />
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{action.title}</h3>
                    <p className="text-white/80 text-sm">{action.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <span>Recent Activity</span>
                </h2>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg ${
                      activity.type === "chat" 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-indigo-100 text-indigo-600"
                    }`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-blue-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span>Key Features</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: "AI Chat", desc: "Get instant answers to your coding questions" },
              { icon: FileCode, title: "Code Editor", desc: "Write and debug code with AI assistance" },
              { icon: Zap, title: "Auto Fix", desc: "Automatically fix bugs and improve code quality" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
              >
                <feature.icon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

