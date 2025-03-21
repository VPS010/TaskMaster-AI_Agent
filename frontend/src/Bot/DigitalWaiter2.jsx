import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Shadow from "./Shadow";

const Robot = ({ command, message }) => {
  const [blinking, setBlinking] = useState(false);
  const [eyeAnimation, setEyeAnimation] = useState({});
  const blinkTimeoutRef = useRef(null);
  const armAnimationCompleteRef = useRef(false);
  const [speechBubble, setSpeechBubble] = useState(null);

  const currentCommand = command || {
    action: "idle",
    parameters: {
      eyes: { shape: "neutral", color: "#00FFFF", blinkInterval: 5000 },
      mouth: { shape: "smallSmile" },
      head: { hoverAmplitude: 3, hoverSpeed: 2 },
    },
  };

  const {
    eyes: eyeParams = {},
    mouth: mouthParams = {},
    head: headParams = {},
  } = currentCommand.parameters;
  const eyeColor = eyeParams.color || "#00FFFF";
  const eyeShape = eyeParams.shape || "neutral";
  const blinkInterval = eyeParams.blinkInterval || 5000;
  const eyeAnimationType = eyeParams.animation || null;

  const mouthShape = mouthParams.shape || "smallSmile";
  const mouthWidth = mouthParams.width || 1;
  const mouthPulsate = mouthParams.pulsate || false;

  const action = currentCommand.action || "idle";
  const bounce = headParams.bounce || false;
  const tilt = headParams.tilt || 0;
  const headShake = headParams.shake || false;
  const nod = headParams.nod || false;

  useEffect(() => {
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlinking(true);
      blinkTimeoutRef.current = setTimeout(() => setBlinking(false), 200);
    }, blinkInterval);
    return () => clearInterval(blinkTimer);
  }, [blinkInterval]);

  useEffect(() => {
    if (eyeAnimationType === "scanLeftRight") {
      setEyeAnimation({ translateX: [0, 3, -3, 0] });
    } else if (eyeAnimationType === "scanUpDown") {
      setEyeAnimation({ translateY: [0, 2, -2, 0] });
    } else if (eyeAnimationType === "circularScan") {
      setEyeAnimation({
        translateX: [0, 2, 0, -2, 0],
        translateY: [0, -2, 0, 2, 0],
      });
    } else {
      setEyeAnimation({});
    }
  }, [eyeAnimationType]);

  useEffect(() => {
    armAnimationCompleteRef.current = false;
  }, [action]);

  // Speech bubble messages - now using the message parameter if provided
  useEffect(() => {
    // If a custom message is provided, use it
    if (message) {
      setSpeechBubble(message);
      const timer = setTimeout(() => setSpeechBubble(null), 10000);
      return () => clearTimeout(timer);
    } else {
      // Otherwise use default messages based on action
      let defaultMessage = "";
      defaultMessage = "No message found";

      if (defaultMessage) {
        setSpeechBubble(defaultMessage);
        const timer = setTimeout(() => setSpeechBubble(null), 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [action, message]);

  const getEyeAnimation = () => {
    if (blinking) return { scaleY: 0.1 };
    switch (eyeShape) {
      case "smile":
        return { borderRadius: "100% 100% 0 0", height: "10px" };
      case "wide":
        return { scaleY: 1.2, scaleX: 1.1 };
      case "narrow":
        return { scaleY: 0.6 };
      case "focused":
        return { scaleY: 0.8, scaleX: 1.1 };
      case "angry":
        return { scaleY: 0.7, rotate: 15, translateY: 2 };
      case "sleepy":
        return { scaleY: 0.4, translateY: 2 };
      case "excited":
        return { scaleY: 1.3, scaleX: 1.2 };
      case "wink":
        return {};
      case "shy":
        return { scaleY: 0.5, translateY: 3, rotate: -3 };
      default:
        return {};
    }
  };

  const getMouthStyle = () => {
    switch (mouthShape) {
      case "wideSmile":
        return {
          width: `${12 * mouthWidth}px`,
          height: "6px",
          borderRadius: "0 0 100px 100px",
        };
      case "bigSmile":
        return {
          width: `${16 * mouthWidth}px`,
          height: "10px",
          borderRadius: "0 0 100px 100px",
        };
      case "frown":
        return {
          width: `${10 * mouthWidth}px`,
          height: "5px",
          borderRadius: "100px 100px 0 0",
        };
      case "sadFrown":
        return {
          width: `${14 * mouthWidth}px`,
          height: "8px",
          borderRadius: "100px 100px 0 0",
        };
      case "oShape":
        return {
          width: `${8 * mouthWidth}px`,
          height: `${8 * mouthWidth}px`,
          borderRadius: "100%",
        };
      case "wideO":
        return {
          width: `${10 * mouthWidth}px`,
          height: `${12 * mouthWidth}px`,
          borderRadius: "100%",
        };
      case "line":
        return {
          width: `${14 * mouthWidth}px`,
          height: "2px",
          borderRadius: "1px",
        };
      case "smirk":
        return {
          width: `${12 * mouthWidth}px`,
          height: "4px",
          borderRadius: "0 0 100px 50px",
          transform: "rotate(-5deg) translateX(1px)",
        };
      case "confused":
        return {
          width: `${10 * mouthWidth}px`,
          height: "2px",
          borderRadius: "1px",
          transform: "rotate(8deg)",
        };
      case "shy":
        return {
          width: `${8 * mouthWidth}px`,
          height: "3px",
          borderRadius: "0 0 100px 100px",
          transform: "translateY(2px)",
        };
      case "tongueOut":
        return {
          width: `${10 * mouthWidth}px`,
          height: "6px",
        };
      case "smallSmile":
      default:
        return {
          width: "10px",
          height: "5px",
          borderRadius: "0 0 100px 100px",
        };
    }
  };

  const getArmAnimation = () => {
    switch (action) {
      case "expressHappiness":
      case "expressExcitement":
        return {
          left: { rotate: [0, -25, 0, -25, 0] },
          right: { rotate: [0, 25, 0, 25, 0] },
          duration: 1.5,
          repeat: 2,
        };
      case "expressGreeting":
        return {
          left: {
            transformOrigin: "80% 40%",
            rotate: [0, 230, 160, 230, 160, 0],
            x: [0, -10, -10, -10, -10, 0],
            y: [0, -80, -80, -80, -80, 0],
          },
          right: { rotate: 0 },
          duration: 2.5,
          repeat: 0,
        };
      case "takeOrder":
        return {
          left: { rotate: 0 },
          right: {
            transformOrigin: "20% 40%",
            rotate: [0, -45, -45, -45, 0],
            y: [0, -30, -30, -30, 0],
          },
          duration: 2,
          repeat: 0,
        };
      case "pointToMenu":
        return {
          left: {
            transformOrigin: "80% 40%",
            rotate: [0, 45, 45, 45, 0],
            y: [0, -30, -30, -30, 0],
          },
          right: { rotate: 0 },
          duration: 2,
          repeat: 0,
        };
      case "expressSurprise":
        return {
          left: { rotate: [0, -30, -15, 0] },
          right: { rotate: [0, 30, 15, 0] },
          duration: 0.8,
          repeat: 1,
        };
      case "expressSadness":
        return {
          left: { rotate: [0, 15, 0], y: [0, 5, 0] },
          right: { rotate: [0, -15, 0], y: [0, 5, 0] },
          duration: 1,
          repeat: 0,
        };
      case "expressApology":
        return {
          // One hand over heart gesture
          left: {
            transformOrigin: "80% 40%",
            rotate: [0, 45, 45, 45, 45, 0],
            x: [0, 15, 15, 15, 15, 0],
            y: [0, -5, -5, -5, -5, 0],
          },
          // Other hand slightly up in apologetic gesture
          right: {
            transformOrigin: "20% 40%",
            rotate: [0, -30, -25, -30, -25, 0],
            y: [0, -15, -10, -15, -10, 0],
          },
          duration: 2,
          repeat: 1,
        };

      case "expressThinking":
        return {
          left: { rotate: 0 },
          right: {
            transformOrigin: "20% 40%",
            rotate: [0, -200, -200, -200, -200, 0],
            x: [0, 20, 20, 20, 20, 0],
            y: [0, -100, -100, -100, -100, 0],
          },
          duration: 3.5,
          repeat: 0,
        };
      case "expressConfusion":
        return {
          left: { rotate: [0, 10, 0, -10, 0] },
          right: { rotate: [0, -10, 0, 10, 0] },
          duration: 2,
          repeat: 1,
        };
      case "expressRecommendation":
        return {
          left: {
            transformOrigin: "80% 40%",
            rotate: [0, 60, 60, 60, 0],
            y: [0, -40, -40, -40, 0],
          },
          right: { rotate: 0 },
          duration: 2,
          repeat: 0,
        };
      default:
        return {
          left: { rotate: 0, x: 0, y: 0 },
          right: { rotate: 0, x: 0, y: 0 },
          duration: 1,
          repeat: 0,
        };
    }
  };

  const getHeadAnimation = () => {
    const amplitude = headParams.hoverAmplitude || 8;
    const speed = headParams.hoverSpeed || 3;
    let animation = { y: [0, -amplitude, 0] };
    let transition = {
      y: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: speed,
        ease: "easeInOut",
      },
      rotate: { duration: 0.5 },
    };

    if (action === "expressThinking") {
      animation = {
        y: [0, -12, 0],
        rotateX: [-5, -15, -5],
        rotate: tilt || -10,
      };
      transition = {
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 4,
          ease: "easeInOut",
        },
        rotateX: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 4,
          ease: "easeInOut",
        },
        rotate: { duration: 0.5 },
      };
    } else if (action === "expressShyness") {
      animation = {
        y: [0, -2, 0],
        rotate: [tilt, tilt - 2, tilt],
        rotateX: [0, 5, 0],
      };
      transition = {
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3,
          ease: "easeInOut",
        },
        rotate: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3,
          ease: "easeInOut",
        },
        rotateX: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 4,
          ease: "easeInOut",
        },
      };
    } else if (headShake) {
      animation.rotate = [tilt, tilt - 5, tilt + 5, tilt];
      transition.rotate = { duration: 0.5, repeat: 3, repeatType: "reverse" };
    } else if (nod) {
      animation.rotateX = [0, 15, 0, 15, 0];
      transition.rotate = { duration: speed > 2 ? 1.5 : 1, repeat: 1 };
    } else {
      animation.rotate = tilt;
    }
    return { animation, transition };
  };

  const armAnimation = getArmAnimation();
  const headAnimation = getHeadAnimation();
  const mouthStyle = getMouthStyle();

  const bodyYPositionRef = useRef(0);
  const onBodyUpdate = (latest) => {
    bodyYPositionRef.current = latest.y || 0;
  };

  const handleArmAnimationComplete = (arm) => {
    if (
      arm === "both" ||
      (arm === "right" && armAnimationCompleteRef.current)
    ) {
      armAnimationCompleteRef.current = false;
    } else if (arm === "left") {
      armAnimationCompleteRef.current = true;
    }
  };

  // Helper to determine if blush marks should be visible
  const shouldShowBlush = () => {
    return (
      action === "expressShyness" ||
      action === "expressLove" ||
      action === "expressApology"
    );
  };

  return (
    <div className="relative w-64 h-96">
      {/* Speech bubble */}
      {speechBubble && (
        <motion.div
          className="absolute -top-24 left-2/3 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ width: "max-content", maxWidth: "200px" }}
        >
          <div className="text-center text-gray-800 text-sm font-medium">
            {speechBubble}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
        </motion.div>
      )}

      <motion.div
        className="relative w-64"
        animate={headAnimation.animation}
        onUpdate={onBodyUpdate}
        transition={headAnimation.transition}
      >
        {/* Waiter bowtie */}
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-16 h-4 bg-red-500 rounded-sm"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-3 bg-black rounded-sm"></div>
        </div>

        <motion.div
          className="relative w-48 h-40 mx-auto"
          animate={{ y: bounce ? [0, -5, 0] : 0 }}
          transition={{ y: bounce ? { repeat: Infinity, duration: 0.8 } : {} }}
        >
          <div className="bg-gray-50 w-48 h-36 rounded-3xl shadow-md">
            <div className="absolute -top-3 left-0 right-0 mx-auto bg-gray-300 w-12 h-5 rounded-full"></div>
            <div className="absolute -left-4 top-12 bg-gray-300 w-6 h-14 rounded-l-xl"></div>
            <div className="absolute -right-4 top-12 bg-gray-300 w-6 h-14 rounded-r-xl"></div>
            <div
              className="absolute top-6 left-8 right-8 bottom-6 rounded-2xl overflow-hidden shadow-lg"
              style={{
                background: `linear-gradient(135deg, #29564b 0%, #0f241e 100%)`,
                boxShadow: `inset 0 0 20px rgba(245, 240, 225, 0.15), 0 5px 15px rgba(0, 0, 0, 0.3)`,
              }}
            >
              <div className="flex justify-center space-x-12 mt-4">
                {eyeShape === "heart" ? (
                  <svg className="w-7 h-4" viewBox="0 0 24 24">
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill={eyeColor}
                    />
                  </svg>
                ) : (
                  <motion.div
                    className="w-7 h-4 rounded-t-full"
                    style={{ backgroundColor: eyeColor }}
                    animate={
                      eyeShape === "wink"
                        ? { scaleY: 0.1 }
                        : { ...getEyeAnimation(), ...eyeAnimation }
                    }
                    transition={{ duration: 0.2 }}
                  />
                )}
                {eyeShape === "heart" ? (
                  <svg className="w-7 h-4" viewBox="0 0 24 24">
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill={eyeColor}
                    />
                  </svg>
                ) : (
                  <motion.div
                    className="w-7 h-4 rounded-t-full"
                    style={{ backgroundColor: eyeColor }}
                    animate={getEyeAnimation()}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
              {/* Anime-style blush marks */}
              {shouldShowBlush() && (
                <div className="flex justify-between mx-8 mt-2">
                  <motion.div
                    className="h-1 rounded-full bg-pink-400"
                    style={{
                      width: action === "expressShyness" ? "10px" : "7px",
                    }}
                    animate={{
                      opacity:
                        action === "expressShyness"
                          ? [0.7, 0.9, 0.7]
                          : [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                    }}
                  />
                  <motion.div
                    className="h-1 rounded-full bg-pink-400"
                    style={{
                      width: action === "expressShyness" ? "10px" : "7px",
                    }}
                    animate={{
                      opacity:
                        action === "expressShyness"
                          ? [0.7, 0.9, 0.7]
                          : [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                    }}
                  />
                </div>
              )}
              <div className="flex justify-center mt-8">
                {mouthShape === "tongueOut" ? (
                  <div
                    style={{
                      position: "relative",
                      width: `${10 * mouthWidth}px`,
                      height: "6px",
                    }}
                  >
                    <motion.div
                      style={{
                        backgroundColor: eyeColor,
                        width: "100%",
                        height: "3px",
                        borderRadius: "0 0 100px 100px",
                      }}
                    />
                    <motion.div
                      style={{
                        backgroundColor: "#FF6699",
                        width: "4px",
                        height: "4px",
                        position: "absolute",
                        bottom: "-2px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        borderRadius: "50%",
                      }}
                      animate={{
                        y: [0, 1, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                      }}
                    />
                  </div>
                ) : (
                  <motion.div
                    style={{ backgroundColor: eyeColor, ...mouthStyle }}
                    animate={mouthPulsate ? { scale: [1, 1.1, 1, 1.1, 1] } : {}}
                    transition={
                      mouthPulsate ? { repeat: Infinity, duration: 1.5 } : {}
                    }
                  />
                )}
              </div>
              {(action === "expressHappiness" ||
                action === "expressExcitement" ||
                action === "expressThankfulness") && (
                <>
                  <div className="absolute left-4 bottom-4 w-3 h-3 bg-pink-300 rounded-full opacity-50"></div>
                  <div className="absolute right-4 bottom-4 w-3 h-3 bg-pink-300 rounded-full opacity-50"></div>
                </>
              )}
            </div>
          </div>
        </motion.div>
        <div className="relative mx-auto -mt-3 z-0">
          <div className="relative w-40 h-60 mx-auto">
            {/* Waiter outfit - deep green with gold accents */}
            <div className="absolute top-0 w-40 h-24 bg-green-800 rounded-t-3xl"></div>
            <div className="absolute top-20 w-40 h-20 bg-green-800"></div>
            <div className="absolute top-36 w-40 h-24 bg-green-800 rounded-b-full"></div>

            {/* Beige shirt frontal part */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-40 bg-yellow-50 rounded-t-xl"></div>

            {/* Pocket square - maroon */}
            <div className="absolute top-12 left-8 w-5 h-2 bg-red-900 rounded-sm"></div>
            <div className="absolute top-12 left-11 w-2 h-3 bg-red-900 rounded-sm"></div>

            {/* Buttons - gold */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-600 rounded-full"></div>
            <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-600 rounded-full"></div>
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-600 rounded-full"></div>

            {/* Robo Heart - gold accent */}
            <motion.div
              className="absolute top-12 left-0 right-0 mx-auto w-6 h-6 rounded-full"
              style={{ backgroundColor: "#bc8bf0" }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.9, 0.7] }}
              transition={{
                repeat: Infinity,
                duration:
                  action === "expressHappiness" ||
                  action === "expressExcitement"
                    ? 0.5
                    : action === "expressSadness" || action === "expressApology"
                    ? 2
                    : action === "expressShyness"
                    ? 0.7
                    : 1,
              }}
            />

            {/* Arms with waiter uniform cuffs - deep green with metallic gray cuffs */}
            <motion.div
              className="absolute top-14 -left-8 bg-green-800 w-6 h-24 rounded-full"
              animate={armAnimation.left}
              transition={{
                repeat: armAnimation.repeat,
                duration: armAnimation.duration,
                repeatType: "loop",
              }}
              onAnimationComplete={() => handleArmAnimationComplete("left")}
            >
              {/* Metallic gray cuff */}
              <div className="absolute bottom-0 w-6 h-5 bg-gray-100 rounded-b-full"></div>
            </motion.div>

            <motion.div
              className="absolute top-14 z-4 -right-8 bg-green-800 w-6 h-24 rounded-full"
              animate={armAnimation.right}
              transition={{
                repeat: armAnimation.repeat,
                duration: armAnimation.duration,
                delay: 0.1,
                repeatType: "loop",
              }}
              onAnimationComplete={() => handleArmAnimationComplete("right")}
            >
              {/* Metallic gray cuff */}
              <div className="absolute bottom-0 w-6 h-5 bg-gray-100 rounded-b-full"></div>

              {/* Digital notepad when taking orders - gold accent */}
              {(action === "takeOrder" || action === "expressThinking") && (
                <motion.div
                  className="absolute -right-8 bottom-6 w-10 h-14 bg-yellow-50 rounded-md shadow-md"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="absolute top-1 left-1 right-1 h-6 bg-yellow-100 rounded-sm"></div>
                  <div className="absolute top-4 left-2 w-6 h-1 bg-yellow-600 rounded-sm"></div>
                  <div className="absolute top-6 left-2 w-6 h-1 bg-yellow-600 rounded-sm"></div>
                  <div className="absolute top-8 left-2 w-6 h-1 bg-yellow-600 rounded-sm"></div>
                  <div className="absolute top-10 left-2 w-4 h-1 bg-yellow-600 rounded-sm"></div>
                </motion.div>
              )}
            </motion.div>
            {/* <div className="absolute top-44 left-1/3 text-yellow-600 text-xs ">
              DineBuddy
            </div> */}
          </div>
        </div>
      </motion.div>
      <Shadow bodyYPosition={bodyYPositionRef.current} />
    </div>
  );
};

export default Robot;