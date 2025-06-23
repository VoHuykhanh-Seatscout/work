// components/BackButton.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.back()}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 text-sm font-medium group"
    >
      <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-primary" />
      <span className="text-primary/80 group-hover:text-primary transition-all">Back to dashboard</span>
    </motion.button>
  );
}
