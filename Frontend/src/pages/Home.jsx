import { motion } from "framer-motion";
import { Swords, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useLang } from "../i18n/useTranslations";

export default function Home({ onStart }) {
  const { user } = useAuthStore();
  const { t } = useLang();

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
        <h1 className="home-title">{t("home.title")}</h1>
        <p className="home-desc">
          {t("home.welcome", { username: user?.username ? `, ${user.username}` : "" })}
        </p>
        <button onClick={onStart} className="home-btn">
          {t("home.start")}
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}
