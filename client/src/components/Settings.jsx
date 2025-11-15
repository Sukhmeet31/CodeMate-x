import { motion } from "framer-motion";
import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, Globe, Palette, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function Settings({ theme = "light", onThemeChange = () => {} }) {
  const [settings, setSettings] = useState({
    theme,
    notifications: true,
    autoSave: true,
    fontSize: 14,
    language: "python",
    privacy: "public"
  });

  useEffect(() => {
    setSettings((prev) => ({ ...prev, theme }));
  }, [theme]);

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem("codemate-settings", JSON.stringify({ ...settings, theme }));
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-slate-300">Customize your CodeMate X experience</p>
            </div>
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center space-x-2 shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Theme</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      onThemeChange("light");
                      setSettings((prev) => ({ ...prev, theme: "light" }));
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.theme === "light" 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange("dark");
                      setSettings((prev) => ({ ...prev, theme: "dark" }));
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.theme === "dark" 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editor Font Size: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({...settings, fontSize: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Editor Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Editor</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Default Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full px-4 py-2 border border-blue-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Auto Save</label>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Automatically save your code</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, autoSave: !settings.autoSave})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.autoSave ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.autoSave ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Notifications</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Enable Notifications</label>
                <p className="text-xs text-gray-500 dark:text-slate-400">Receive updates and alerts</p>
              </div>
              <button
                onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Privacy</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Code Visibility</label>
              <select
                value={settings.privacy}
                onChange={(e) => setSettings({...settings, privacy: e.target.value})}
                className="w-full px-4 py-2 border border-blue-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

