import React from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";

const Background = ({ command }) => {
  const action = command?.action || "idle";

  // Background gradients
  const gradients = {
    idle: "linear-gradient(180deg, #f0f4f8, #d9e2ec)",
    expressHappiness: "linear-gradient(180deg, #ffe066, #ffcc00)",
    expressSadness: "linear-gradient(180deg, #3a7ca5, #2a5d82)",
    expressLove: "linear-gradient(180deg, #ff6699, #ff3366)",
  };

  // Particle effects for specific emotions
  const particleConfigs = {
    expressHappiness: {
      particles: {
        number: { value: 20 },
        size: { value: 5 },
        move: { speed: 2 },
      },
    },
    expressSadness: {
      particles: {
        number: { value: 15 },
        size: { value: 3 },
        move: { speed: 1, direction: "bottom" },
      },
    },
    expressLove: {
      particles: {
        number: { value: 10 },
        shape: {
          type: "image",
          image: {
            src: "heart.png",
            width: 32,
            height: 32,
          },
        },
      },
    },
  };

  const currentGradient = gradients[action] || gradients.idle;
  const currentParticles = particleConfigs[action] || null;

  return (
    <motion.div
      className="absolute inset-0 z-[-1]"
      style={{ background: currentGradient }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {currentParticles && <Particles options={currentParticles} />}
    </motion.div>
  );
};

export default Background;
