import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  gradient?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function StatCard({ title, value, subtitle, icon, gradient, delay = 0, onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`rounded-xl p-5 transition-all duration-200 ${onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:ring-1 hover:ring-primary/30" : ""} ${gradient ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card shadow-card border"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gradient ? "bg-primary-foreground/15" : "bg-primary/10"}`}>
          {icon}
        </div>
        {subtitle && (
          <span className={`text-xs px-2 py-1 rounded-full ${gradient ? "bg-primary-foreground/15" : "bg-muted text-muted-foreground"}`}>
            {subtitle}
          </span>
        )}
      </div>
      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${gradient ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {title}
      </p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </motion.div>
  );
}
