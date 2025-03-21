import React from "react";
import Robot from "./DigitalWaiter2";
import { motion } from "framer-motion";

function Bot_run({
  expression = "idle",
  message = "Ready to assist you!",
  parameters = null,
}) {
  // Define default expression parameters in a separate object, mapped by expression name
  const defaultExpressionParameters = {
    idle: {
      eyes: { shape: "neutral", color: "#00FFFF", blinkInterval: 5000 },
      mouth: { shape: "smallSmile" },
      head: { hoverAmplitude: 3, hoverSpeed: 2 },
    },
    expressGreeting: {
      eyes: { shape: "smile", color: "#33CCFF" },
      mouth: { shape: "wideSmile", width: 1.2 },
      head: { nod: true },
    },
    expressHappiness: {
      eyes: { shape: "smile", color: "#00FFFF" },
      mouth: { shape: "wideSmile", width: 1.2 },
      head: { tilt: 5, bounce: true },
    },
    expressThinking: {
      eyes: { shape: "focused", animation: "scanLeftRight" },
      mouth: { shape: "line", pulsate: true },
      head: { tilt: 3, hoverAmplitude: 2 },
    },
    expressSurprise: {
      eyes: { shape: "wide", color: "#FFFF00" },
      mouth: { shape: "wideO", width: 1.1 },
      head: { tilt: -5, shake: true },
    },
    expressExcitement: {
      eyes: { shape: "excited", color: "#00FF99" },
      mouth: { shape: "bigSmile", width: 1.4 },
      head: { bounce: true, tilt: -2 },
    },
    expressConfusion: {
      eyes: {
        shape: "focused",
        animation: "circularScan",
        color: "#CC99FF",
        blinkInterval: 3000,
      },
      mouth: {
        shape: "confused",
        width: 1.2,
        pulsate: true,
      },
      head: {
        tilt: 12,
        shake: true,
        hoverAmplitude: 5,
        hoverSpeed: 3,
      },
    },
    expressSadness: {
      eyes: {
        shape: "sleepy",
        color: "#3A7CA5",
        blinkInterval: 8000,
      },
      mouth: {
        shape: "sadFrown",
        width: 1.3,
      },
      head: {
        tilt: 15,
        hoverAmplitude: 1,
        hoverSpeed: 1,
      },
    },
    expressLove: {
      eyes: { shape: "smile", color: "#FF6699" },
      mouth: { shape: "bigSmile", width: 1.2 },
      head: { tilt: 5 },
    },
    expressPlayful: {
      eyes: { shape: "wink", color: "#FF99CC" },
      mouth: { shape: "smirk", width: 1.2 },
      head: { tilt: -8, bounce: true },
    },
    expressThankfulness: {
      eyes: {
        shape: "smile",
        color: "#66FF99",
        blinkInterval: 4000,
      },
      mouth: {
        shape: "bigSmile",
        width: 1.3,
        pulsate: true,
      },
      head: {
        nod: true,
        tilt: 3,
        bounce: true,
      },
    },
    expressShyness: {
      eyes: {
        shape: "shy",
        color: "#FF99CC",
        blinkInterval: 3000,
      },
      mouth: {
        shape: "shy",
        width: 0.8,
      },
      head: {
        tilt: 15,
        hoverAmplitude: 2,
        hoverSpeed: 3,
      },
    },
    expressApology: {
      eyes: {
        shape: "sleepy",
        color: "#3A7CA5",
        blinkInterval: 2500,
      },
      mouth: {
        shape: "sadFrown",
        width: 1.1,
        pulsate: true,
      },
      head: {
        tilt: 15,
        hoverAmplitude: 4,
        hoverSpeed: 3,
        nod: true,
      },
    },
    expressAnger: {
      eyes: { shape: "narrow", color: "#FF3300" },
      mouth: { shape: "line", width: 1.3 },
      head: { hoverAmplitude: 6, hoverSpeed: 1.5 },
    },
  };

  // Function to get a human-readable name for the current expression
  const getExpressionName = (expressionType) => {
    const expressionNames = {
      idle: "Idle",
      expressHappiness: "Happy",
      expressSurprise: "Surprised",
      expressThinking: "Thinking",
      expressExcitement: "Excited",
      expressGreeting: "Greeting",
      expressConfusion: "Confused",
      expressSadness: "Sad",
      expressPlayful: "Playful",
      expressLove: "Loving",
      expressThankfulness: "Thankful",
      expressShyness: "Shy",
      expressApology: "Apologetic",
      expressAnger: "Anger",
    };
    return expressionNames[expressionType] || expressionType;
  };

  // Build the full command object based on current expression
  const buildCommandObject = (expressionType, customParameters) => {
    // If custom parameters are provided, use them. Otherwise, fall back to default parameters
    const finalParameters =
      customParameters ||
      defaultExpressionParameters[expressionType] ||
      defaultExpressionParameters.idle;

    return {
      action: expressionType, // This is the key change - setting action to expressionType
      parameters: finalParameters,
    };
  };

  // Generate the full command with parameters for the Robot component
  const command = buildCommandObject(expression, parameters);

  return (
    <div className="items-start flex flex-col z-50 justify-center">
      <div className="flex-1 flex items-center justify-center">
        <Robot command={command} message={message} />
      </div>
      <div className="mt-12 justify-center text-center">
        <motion.p
          className="text-gray-600 max-w-md mx-auto"
          key={expression}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Current expression:{" "}
          <span className="font-semibold">{getExpressionName(expression)}</span>
        </motion.p>
      </div>
    </div>
  );
}

export default Bot_run;
