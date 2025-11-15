import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Code2, Clock, Zap, Activity, ArrowUp, ArrowDown } from "lucide-react";

export default function Analytics() {
  const stats = [
    { label: "Total Lines of Code", value: "12,458", change: "+12%", trend: "up", icon: Code2, color: "from-blue-500 to-blue-600" },
    { label: "Code Quality Score", value: "8.7/10", change: "+0.3", trend: "up", icon: TrendingUp, color: "from-green-500 to-green-600" },
    { label: "Average Response Time", value: "1.2s", change: "-0.3s", trend: "down", icon: Clock, color: "from-purple-500 to-purple-600" },
    { label: "AI Requests Today", value: "156", change: "+23%", trend: "up", icon: Zap, color: "from-orange-500 to-orange-600" },
  ];

  const chartData = [
    { day: "Mon", requests: 45, fixes: 12 },
    { day: "Tue", requests: 52, fixes: 15 },
    { day: "Wed", requests: 48, fixes: 18 },
    { day: "Thu", requests: 61, fixes: 20 },
    { day: "Fri", requests: 55, fixes: 16 },
    { day: "Sat", requests: 38, fixes: 10 },
    { day: "Sun", requests: 42, fixes: 14 },
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.requests, d.fixes)));

  return (
    <div className="min-h-screen pb-12 relative transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-slate-300">Track your coding activity and performance metrics</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 mb-4 flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-1">{stat.value}</h3>
              <p className="text-gray-600 dark:text-slate-300 text-sm mb-2">{stat.label}</p>
              <div className={`flex items-center space-x-1 text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 mb-8"
        >
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Weekly Activity</h2>
          </div>
          <div className="flex items-end justify-between h-64 space-x-2">
            {chartData.map((data, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="flex-1 flex flex-col items-center space-y-2"
              >
                <div className="w-full flex flex-col justify-end space-y-1 h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.requests / maxValue) * 100}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.fixes / maxValue) * 100}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">{data.day}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-slate-300">AI Requests</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Code Fixes</span>
            </div>
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {[
              { action: "Fixed Python syntax error", time: "2 minutes ago", type: "fix" },
              { action: "Explained React component", time: "15 minutes ago", type: "explain" },
              { action: "Optimized JavaScript function", time: "1 hour ago", type: "optimize" },
              { action: "Debugged API endpoint", time: "3 hours ago", type: "debug" },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

