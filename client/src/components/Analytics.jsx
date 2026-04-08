import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="min-h-screen pb-12 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Analytics stays empty until the app is connected to a real data source.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-blue-100 bg-white/80 p-10 text-center shadow-lg backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">No analytics data yet.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 dark:text-slate-300">
            Connect real tracking or persistence before showing usage metrics, charts, or activity summaries.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
