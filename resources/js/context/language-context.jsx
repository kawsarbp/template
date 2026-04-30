import translations from "@/i18n/language";
import { createContext, useState, useEffect } from "react";

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language");
      return storedLanguage || "en";
    }
    return "en";
  });

  const isRTL = language === "ar";


  const t = (key, options) => {
    let translation = translations[language][key] || key;
    if (options) {
      Object.keys(options).forEach((optionKey) => {
        translation = translation.replace(
          new RegExp(`{{${optionKey}}}`, "g"),
          options[optionKey]
        );
      });
    }
    return translation;
  };


  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };