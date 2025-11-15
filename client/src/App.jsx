import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import CodeEditor from "./components/Editor";
import AssistantPanel from "./components/AssistantPanel";
import ChatInterface from "./components/ChatInterface";
import CommandPalette from "./components/CommandPalette";
import ParticlesBackground from "./components/ParticlesBackground";
import LoginPage from "./components/LoginPage";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Dashboard from "./components/Dashboard";
import ScrollToTop from "./components/ScrollToTop";
import LandingPage from "./components/LandingPage";
import Documentation from "./components/Documentation";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Projects from "./components/Projects";
import Analytics from "./components/Analytics";

// 🔥 Firebase imports
import { auth } from "./main";
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";


export default function App() {
  const [currentView, setCurrentView] = useState("landing"); 
  const [code, setCode] = useState("// Start coding here...\n# Welcome to CodeMate X\n# Write your code below\n");
  const [loggedIn, setLoggedIn] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("codemate-theme") || "light";
  });

  // Smooth scroll on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  // Theme handler
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("codemate-theme", theme);
  }, [theme]);

  // 🔥 Firebase listener (main auth control for entire app)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        setCurrentView("dashboard");
      } else {
        setLoggedIn(false);
        setCurrentView("landing"); 
      }
    });
    return () => unsub();
  }, []);

  // Reset app state
  function resetApp() {
    setLoggedIn(false);
    setCurrentView("landing");
  }

  // 🔥 Firebase Login Handler
 async function handleLogin(email, password, isSignUp = false) {
  setIsLoading(true);

  try {
    if (isSignUp) {
      // 🔥 Signup
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      // 🔥 Login
      await signInWithEmailAndPassword(auth, email, password);
    }

    // Auth listener will handle redirect

  } catch (error) {
    alert(error.message);
  }

  setIsLoading(false);
}

async function handleLogout() {
  setIsLoading(true);
  await signOut(auth);
  setIsLoading(false);
}



  function handleNavigate(view) {
    setCurrentView(view);
  }

  const appClassName =
    theme === "dark"
      ? "relative min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden transition-colors duration-500"
      : "relative min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-100 text-gray-900 overflow-x-hidden transition-colors duration-500";

  return (
    <div className={appClassName}>
      {isLoading && <Loader fullScreen={true} />}

      {/* 🔥 If NOT logged in → show Landing or Login */}
      {!loggedIn ? (
        <>
          {currentView === "landing" ? (
            <LandingPage onGetStarted={() => setCurrentView("login")} theme={theme} />
          ) : (
            <LoginPage onLogin={handleLogin} theme={theme} />
          )}
        </>
      ) : (
        <>
          <ParticlesBackground />

          <Navbar
            resetApp={resetApp}
            loggedIn={loggedIn}
            onLogout={handleLogout}
            currentView={currentView}
            onNavigate={handleNavigate}
          />

          <main className="flex-1">
            <AnimatePresence mode="wait">
              {currentView === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Dashboard onNavigate={handleNavigate} />
                </motion.div>
              )}

              {currentView === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="min-h-[calc(100vh-200px)] py-8"
                >
                  <ChatInterface />
                </motion.div>
              )}

              {currentView === "editor" && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-1 overflow-hidden p-4 md:p-6 gap-4 h-[calc(100vh-80px)]"
                >
                  <div className="flex-1 min-w-0">
                    <CodeEditor code={code} setCode={setCode} />
                  </div>
                  <div className="w-[35%] min-w-[350px] max-w-[450px]">
                    <AssistantPanel code={code} theme={theme} />
                  </div>
                </motion.div>
              )}

              {currentView === "docs" && (
                <motion.div
                  key="docs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Documentation onNavigate={handleNavigate} />
                </motion.div>
              )}

              {currentView === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <Profile />
                </motion.div>
              )}

              {currentView === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <Settings />
                </motion.div>
              )}

              {currentView === "projects" && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Projects />
                </motion.div>
              )}

              {currentView === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <Analytics />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <CommandPalette
            open={paletteOpen}
            setOpen={setPaletteOpen}
            runCommand={(cmd) => alert(`Running: ${cmd}`)}
          />

          <ScrollToTop />
        </>
      )}

      {loggedIn && <Footer />}
    </div>
  );
}
