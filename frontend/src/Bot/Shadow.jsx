import React from "react";
import { motion } from "framer-motion";

const Shadow = ({ bodyYPosition = 0 }) => {
  // Calculate shadow scale based on bodyYPosition
  // As the robot moves up (negative bodyYPosition), shadow gets smaller
  // As the robot moves down (positive bodyYPosition), shadow gets larger
  const getShadowProperties = () => {
    // Base values when robot is at neutral position
    const baseScaleX = 4;
    const baseScaleY = 0.8;

    // Calculate size factor based on robot height
    // Higher = smaller shadow, Lower = larger shadow
    const heightModifier = Math.max(0.7, 1 - Math.abs(bodyYPosition) * 0.03);
    const distanceModifier = bodyYPosition > 0 ? 1 + bodyYPosition * 0.02 : 1;

    return {
      scaleX: baseScaleX * heightModifier * distanceModifier,
      scaleY: baseScaleY * heightModifier * distanceModifier,
    };
  };

  const shadowProps = getShadowProperties();

  return (
    <motion.div
      className="absolute left-0 right-0 mx-auto bg-gray-400 rounded-full"
      style={{
        height: "16px",
        width: "18px",
        bottom: "-32px",
        opacity: 0.35, // Fixed opacity as requested
      }}
      animate={{
        scaleX: shadowProps.scaleX,
        scaleY: shadowProps.scaleY,
        y: bodyYPosition * 0.2, // Shadow also moves slightly with robot
      }}
      transition={{
        duration: 0.1,
        ease: "easeOut",
      }}
    />
  );
};

export default Shadow;
