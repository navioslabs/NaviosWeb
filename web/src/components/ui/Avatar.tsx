import { User } from "lucide-react";

const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16" };

export function Avatar({ src, size = "md", className = "" }: { src?: string | null; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-surface2 ${sizes[size]} ${className}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : (
        <div className="flex h-full w-full items-center justify-center text-muted">
          <User size={size === "sm" ? 14 : size === "md" ? 18 : 28} />
        </div>
      )}
    </div>
  );
}
