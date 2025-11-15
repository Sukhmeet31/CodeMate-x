import { motion, AnimatePresence } from "framer-motion";
import { Code2, Menu, X, User, Settings, LogOut, Sparkles, LayoutDashboard, MessageSquare, FileCode, BookOpen, Folder, BarChart3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Navbar({ resetApp, loggedIn, onLogout, currentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 flex justify-between items-center px-6 md:px-8 py-4 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-lg border-b border-blue-400/30 shadow-lg"
    >
      {/* Logo Section */}
      <motion.div
        className="flex items-center space-x-3 cursor-pointer group"
        onClick={resetApp}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide flex items-center">
          CodeMate X
          <Sparkles className="w-5 h-5 ml-2 text-yellow-300" />
        </h1>
      </motion.div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {loggedIn ? (
          <>
            <motion.button
              onClick={() => onNavigate("dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                currentView === "dashboard"
                  ? "bg-white/30 text-white shadow-lg"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate("chat")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                currentView === "chat"
                  ? "bg-white/30 text-white shadow-lg"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate("editor")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                currentView === "editor"
                  ? "bg-white/30 text-white shadow-lg"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Editor</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate("docs")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                currentView === "docs"
                  ? "bg-white/30 text-white shadow-lg"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Docs</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate("projects")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                currentView === "projects"
                  ? "bg-white/30 text-white shadow-lg"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Projects</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate("analytics")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                currentView === "analytics"
                  ? "bg-white/30 text-white shadow-lg"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </motion.button>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Account</span>
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-blue-100 overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        onNavigate("profile");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("settings");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        onLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <motion.button
            onClick={resetApp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-md"
          >
            Get Started
          </motion.button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="absolute top-full left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 backdrop-blur-lg border-b border-blue-400/30 shadow-xl md:hidden"
        >
          <div className="px-6 py-4 space-y-3">
            {loggedIn ? (
              <>
                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left text-white hover:text-blue-200 transition-colors py-2 flex items-center space-x-2 ${
                    currentView === "dashboard" ? "text-blue-200 font-semibold" : ""
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate("chat");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left text-white hover:text-blue-200 transition-colors py-2 flex items-center space-x-2 ${
                    currentView === "chat" ? "text-blue-200 font-semibold" : ""
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate("editor");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left text-white hover:text-blue-200 transition-colors py-2 flex items-center space-x-2 ${
                    currentView === "editor" ? "text-blue-200 font-semibold" : ""
                  }`}
                >
                  <FileCode className="w-5 h-5" />
                  <span>Editor</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate("docs");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left text-white hover:text-blue-200 transition-colors py-2 flex items-center space-x-2 ${
                    currentView === "docs" ? "text-blue-200 font-semibold" : ""
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Documentation</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate("projects");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left text-white hover:text-blue-200 transition-colors py-2 flex items-center space-x-2 ${
                    currentView === "projects" ? "text-blue-200 font-semibold" : ""
                  }`}
                >
                  <Folder className="w-5 h-5" />
                  <span>Projects</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate("analytics");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left text-white hover:text-blue-200 transition-colors py-2 flex items-center space-x-2 ${
                    currentView === "analytics" ? "text-blue-200 font-semibold" : ""
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </button>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-white hover:text-red-200 transition-colors py-2 flex items-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <motion.button
                onClick={() => {
                  resetApp();
                  setMobileMenuOpen(false);
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
              >
                Get Started
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
