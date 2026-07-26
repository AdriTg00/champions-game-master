import { useEffect, useRef } from "react";
import { playSound, initAudio } from "../utils/sounds";

const SOUND_MAP = {
  "sound-click": "click",
  "sound-nav": "nav",
  "sound-select": "select",
  "sound-vote": "vote",
  "sound-add": "add",
  "sound-remove": "remove",
  "sound-success": "success",
  "sound-error": "error",
  "sound-tierdrop": "tierdrop",
};

export default function SoundProvider({ children }) {
  const inited = useRef(false);

  useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest("[data-sound]");
      if (!el) return;
      const sound = el.getAttribute("data-sound");
      if (sound && SOUND_MAP[sound]) {
        playSound(SOUND_MAP[sound]);
      }
    };

    const init = () => {
      if (!inited.current) {
        initAudio();
        inited.current = true;
      }
    };

    document.addEventListener("click", handler, { passive: true });
    document.addEventListener("touchstart", init, { once: true });
    document.addEventListener("click", init, { once: true });

    return () => document.removeEventListener("click", handler);
  }, []);

  return children;
}
