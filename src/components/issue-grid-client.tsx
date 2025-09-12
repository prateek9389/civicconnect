
"use client";

import { motion } from "framer-motion";
import { IssueCard } from "./issue-card";

type Issue = {
  id: string; // Changed from number to string to match Firestore ID
  reporter: string;
  avatarUrl: string | null;
  time: string;
  imageUrl: string;
  title:string;
  district: string;
  category: string;
  status: "Pending" | "Confirmation" | "Acknowledgment" | "Resolution";
  description: string;
  aiHint: string;
  createdAt: string; // Changed from Timestamp to string
};

export function IssueGridClient({ issues }: { issues: Issue[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {issues.map((issue) => (
        <motion.div key={issue.id} variants={itemVariants}>
          <IssueCard issue={issue} />
        </motion.div>
      ))}
    </motion.div>
  );
}
