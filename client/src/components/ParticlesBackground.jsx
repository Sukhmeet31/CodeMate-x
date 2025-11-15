import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50"></div>
      
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0"
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: ["repulse", "bubble"] },
              onClick: { enable: true, mode: "push" },
              resize: true
            },
            modes: {
              repulse: { distance: 150, duration: 0.4 },
              bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8 }
            },
          },
          particles: {
            color: {
              value: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"]
            },
            links: {
              color: "#818cf8",
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1.5,
              triangles: {
                enable: true,
                opacity: 0.1
              }
            },
            move: {
              enable: true,
              speed: 1.5,
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "bounce" },
              attract: { enable: true, rotateX: 600, rotateY: 1200 }
            },
            number: {
              value: 80,
              density: { enable: true, area: 800 }
            },
            opacity: {
              value: { min: 0.3, max: 0.8 },
              animation: {
                enable: true,
                speed: 1,
                sync: false
              }
            },
            shape: {
              type: ["circle", "triangle"],
              options: {
                triangle: {
                  particles: {
                    size: {
                      value: { min: 1, max: 3 }
                    }
                  }
                }
              }
            },
            size: {
              value: { min: 1, max: 4 },
              animation: {
                enable: true,
                speed: 2,
                sync: false
              }
            },
            twinkle: {
              particles: {
                enable: true,
                frequency: 0.05,
                opacity: 1
              }
            }
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}
