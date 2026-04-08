import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
            Profile
          </h1>
          <p className="text-gray-600">Profile details will appear here when real account data is available.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-blue-100 bg-white/80 p-10 text-center shadow-lg backdrop-blur-xl"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">No profile data yet.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
            Connect this screen to real authentication or account storage before rendering personal details.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
