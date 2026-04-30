import React from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";



const ThemeSwitcher = () => {

    const { theme, setTheme } = useTheme();



    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                ) : (
                    <Sun className="h-5 w-5" />
                )}
            </motion.div>
        </Button>
    )
}

export default ThemeSwitcher
