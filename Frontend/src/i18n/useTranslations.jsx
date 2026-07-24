import { createContext, useContext, useState, useCallback, useMemo } from "react";
import en from "./en.js";
import es from "./es.js";

const langs = { en, es };

function resolve(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lang") || "en"; } catch { return "en"; }
  });

  const switchLang = useCallback((l) => {
    setLang(l);
    try { localStorage.setItem("lang", l); } catch {}
  }, []);

  const t = useCallback((key, vars) => {
    const value = resolve(langs[lang], key);
    if (value === undefined) {
      const fallback = resolve(langs.en, key);
      return fallback !== undefined ? interpolate(fallback, vars) : key;
    }
    return interpolate(value, vars);
  }, [lang]);

  const ctx = useMemo(() => ({ lang, switchLang, t }), [lang, switchLang, t]);

  return <LangContext.Provider value={ctx}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
