import { Achievement } from "@/lib/achievements";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface BadgeCardProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeCard({ achievement, size = 'md' }: BadgeCardProps) {
  const Icon = achievement.icon;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} relative`}>
        <div
          className={`absolute inset-0 rounded-full ${
            achievement.unlocked
              ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/40'
              : 'bg-white/5 border-2 border-white/10'
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {achievement.unlocked ? (
            <Icon className={`${iconSizes[size]} ${achievement.color}`} />
          ) : (
            <Lock className={`${iconSizes[size]} text-white/30`} />
          )}
        </div>
      </div>
      <div className="text-center">
        <p className={`text-xs font-semibold ${achievement.unlocked ? 'text-white' : 'text-white/40'}`}>
          {achievement.title}
        </p>
      </div>
    </div>
  );
}

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 max-w-sm"
      onClick={onClose}
    >
      <div className="bg-gradient-to-br from-emerald-900/95 to-cyan-900/95 backdrop-blur-xl border-2 border-emerald-400/50 rounded-2xl p-4 shadow-2xl cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center border-2 border-emerald-400/50">
            <Icon className={`h-8 w-8 ${achievement.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-1">
              Achievement Unlocked!
            </p>
            <p className="text-white font-bold text-lg">{achievement.title}</p>
            <p className="text-white/70 text-sm">{achievement.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressCircle({ percentage, size = 120, strokeWidth = 8 }: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{percentage}%</span>
        <span className="text-xs text-white/60">Complete</span>
      </div>
    </div>
  );
}

interface BadgeGridProps {
  achievements: Achievement[];
  maxDisplay?: number;
}

export function BadgeGrid({ achievements, maxDisplay }: BadgeGridProps) {
  const displayedAchievements = maxDisplay 
    ? achievements.slice(0, maxDisplay) 
    : achievements;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Achievements</h3>
        <span className="text-sm text-white/70">
          {unlockedCount} / {totalCount} Unlocked
        </span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {displayedAchievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <BadgeCard achievement={achievement} size="md" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
