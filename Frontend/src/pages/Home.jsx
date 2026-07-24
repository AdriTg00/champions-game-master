import { motion } from "framer-motion";
import { Swords, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Home({ onStart }) {
  const { user } = useAuthStore();

  return (
    <div className="home-root">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="home-card-new"
      >
        <div className="home-icon">
          <Swords size={20} />
        </div>
        <h1 className="home-title">Choose Your Game</h1>
        <p className="home-desc">
          Welcome{user?.username ? `, ${user.username}` : ""}! Build your personal game ranking through head-to-head comparisons.
        </p>
        <button onClick={onStart} className="home-btn">
          Start Comparing
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}
