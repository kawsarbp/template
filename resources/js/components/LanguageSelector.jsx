import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage"; 

// --- Flag Icons ---
const USFlag = () => (
  <svg className="w-5 h-5 rounded-full object-cover border border-border" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path fill="#BD3D44" d="M0 0h36v36H0z"/><path fill="#FFF" d="M0 3.6h36v3.6H0zM0 10.8h36v3.6H0zM0 18h36v3.6H0zM0 25.2h36v3.6H0zM0 32.4h36v3.6H0z"/><path fill="#192F5D" d="M0 0h18v19.8H0z"/><path fill="#FFF" d="M2.3 2.3h1.7v1.7H2.3zM7.3 2.3h1.7v1.7H7.3zM12.3 2.3h1.7v1.7H12.3zM4.8 4.8h1.7v1.7H4.8zM9.8 4.8h1.7v1.7H9.8zM14.8 4.8h1.7v1.7H14.8zM2.3 7.3h1.7v1.7H2.3zM7.3 7.3h1.7v1.7H7.3zM12.3 7.3h1.7v1.7H12.3zM4.8 9.8h1.7v1.7H4.8zM9.8 9.8h1.7v1.7H9.8zM14.8 9.8h1.7v1.7H14.8zM2.3 12.3h1.7v1.7H2.3zM7.3 12.3h1.7v1.7H7.3zM12.3 12.3h1.7v1.7H12.3zM4.8 14.8h1.7v1.7H4.8zM9.8 14.8h1.7v1.7H9.8zM14.8 14.8h1.7v1.7H14.8zM2.3 17.3h1.7v1.7H2.3zM7.3 17.3h1.7v1.7H7.3zM12.3 17.3h1.7v1.7H12.3z"/></svg>
);

const SAFlag = () => (
  <svg className="w-5 h-5 rounded-full object-cover border border-border" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <path fill="#006C35" d="M0 0h36v36H0z"/>
    <path fill="#FFF" d="M10 24h16v2H10z"/> 
    <path fill="#FFF" d="M12 14h12v4H12z"/>
  </svg>
);

const languages = [
  { code: "en", label: "English", icon: USFlag },
  { code: "ar", label: "Arabic", icon: SAFlag }, 
];

export const LanguageSelector = ({ className }) => {
  const { language, setLanguage } = useLanguage();

  const selectedLang = languages.find(lang => lang.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "bg-success/10 hover:bg-success/20 text-foreground border border-success/20 rounded-full pl-2 pr-3 h-9 gap-2 transition-all outline-none",
          className
        )}
      >
        <selectedLang.icon />
        <span className="text-sm font-semibold">{selectedLang.label}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-37.5 rounded-xl border-border bg-card">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="gap-2 cursor-pointer font-medium text-foreground focus:bg-muted focus:text-foreground"
          >
            <lang.icon />
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};