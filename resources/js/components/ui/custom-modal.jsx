import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { cn } from "@/lib/utils";

export default function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  modalSize = "max-w-[500px]",
  modalHeight = "",
  description,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-0 overflow-hidden", // Reset padding for custom scroll area control if needed
          modalSize, 
          modalHeight ? modalHeight : "max-h-[85vh]"
        )}
      >
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
           {description && (
             <DialogDescription>{description}</DialogDescription>
           )}
        </DialogHeader>
        
        <div className={cn("p-6 overflow-y-auto", modalHeight ? "h-full" : "")}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
