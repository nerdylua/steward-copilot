"use client";
import { OpenMetadataIconPaths } from "@/components/openmetadata-icon";
import { motion } from "framer-motion";
interface HeroStewardBlockProps {
    id?: string;
    className?: string;
}
export function HeroStewardBlock({ className }: HeroStewardBlockProps) {
    return (<>
      <motion.g id="steward-block" className={className} initial={{ y: 0 }} animate={{ y: -10 }} transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
        }}>
        <g transform="translate(443 181) scale(0.078)">
          <OpenMetadataIconPaths />
        </g>
      </motion.g>
      <path d="M598.605 177.583 670.849 130.173" stroke="#fff"/>
    </>);
}
