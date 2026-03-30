import { useToastStore } from "@/stores/toast";
import { X } from "lucide-react";

const colors = { success: "bg-accent text-white", error: "bg-red text-white", info: "bg-surface2 text-text-p" };

export function Toast() {
  const { message, type, visible, hide } = useToastStore();
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg ${colors[type]}`}>
        <span className="text-sm font-medium">{message}</span>
        <button onClick={hide} className="opacity-70 hover:opacity-100"><X size={16} /></button>
      </div>
    </div>
  );
}
