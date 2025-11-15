import { motion } from "framer-motion";
import { Folder, Code2, Calendar, Star, GitBranch, Plus, Search, Filter } from "lucide-react";
import { useState } from "react";

export default function Projects() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "React Dashboard",
      description: "Modern dashboard built with React and TypeScript",
      language: "TypeScript",
      lastModified: "2 hours ago",
      stars: 12,
      branches: 3,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      name: "Python API Server",
      description: "RESTful API server using FastAPI",
      language: "Python",
      lastModified: "1 day ago",
      stars: 8,
      branches: 2,
      color: "from-green-500 to-green-600"
    },
    {
      id: 3,
      name: "Node.js Microservice",
      description: "Scalable microservice architecture",
      language: "JavaScript",
      lastModified: "3 days ago",
      stars: 15,
      branches: 5,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: 4,
      name: "Vue.js E-commerce",
      description: "Full-stack e-commerce application",
      language: "Vue",
      lastModified: "1 week ago",
      stars: 24,
      branches: 7,
      color: "from-emerald-500 to-emerald-600"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-12 relative transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1), transparent)",
              "radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.1), transparent)",
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1), transparent)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                My Projects
              </h1>
              <p className="text-gray-600 dark:text-slate-300">Manage and organize your coding projects</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </motion.button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-blue-200 rounded-lg bg-white/80 flex items-center space-x-2"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Filter</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} p-3 flex items-center justify-center`}>
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">{project.stars}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Code2 className="w-4 h-4" />
                    <span>{project.language}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{project.lastModified}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <GitBranch className="w-4 h-4" />
                  <span className="text-xs">{project.branches}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

