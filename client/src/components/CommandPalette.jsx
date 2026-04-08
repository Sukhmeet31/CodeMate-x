import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette({ open, setOpen }) {
  useHotkeys("ctrl+k", () => setOpen(!open), [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-80 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="mb-3 text-lg font-semibold text-indigo-600">Command Palette</h2>
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-4 py-6 text-center">
              <p className="font-medium text-slate-800">No commands available yet.</p>
              <p className="mt-2 text-sm text-slate-600">
                Add real command handlers before exposing shortcuts here.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
