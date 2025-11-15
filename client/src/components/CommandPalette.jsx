import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette({ open, setOpen, runCommand }) {
  useHotkeys("ctrl+k", () => setOpen(!open), [open]);

  const commands = [
    { name: "Explain Code", action: "explain" },
    { name: "Fix Code", action: "fix" },
    { name: "Optimize Code", action: "optimize" },
    { name: "Summarize", action: "summarize" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-80"
          >
            <h2 className="text-lg font-semibold mb-3 text-indigo-600">Command Palette</h2>
            {commands.map((cmd) => (
              <button
                key={cmd.action}
                onClick={() => { runCommand(cmd.action); setOpen(false); }}
                className="block w-full text-left px-3 py-2 mb-2 rounded-lg hover:bg-indigo-100"
              >
                {cmd.name}
              </button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
