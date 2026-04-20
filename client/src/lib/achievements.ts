import { Trophy, Leaf, Droplet, Sprout, TreePine, Zap, Award, Star, Crown, Target } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  requirement: {
    type: 'lessons' | 'modules' | 'points' | 'streak';
    value: number;
  };
  color: string;
  unlocked?: boolean;
  unlockedAt?: string;
}

export const achievements: Achievement[] = [
  {
    id: 'first-step',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: Sprout,
    requirement: { type: 'lessons', value: 1 },
    color: 'text-emerald-400'
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Complete 5 lessons',
    icon: Leaf,
    requirement: { type: 'lessons', value: 5 },
    color: 'text-green-400'
  },
  {
    id: 'eco-student',
    title: 'Eco Student',
    description: 'Complete 10 lessons',
    icon: TreePine,
    requirement: { type: 'lessons', value: 10 },
    color: 'text-emerald-500'
  },
  {
    id: 'ocean-guardian',
    title: 'Ocean Guardian',
    description: 'Complete Save the Ocean module',
    icon: Droplet,
    requirement: { type: 'modules', value: 1 },
    color: 'text-blue-400'
  },
  {
    id: 'module-master',
    title: 'Module Master',
    description: 'Complete 3 modules',
    icon: Award,
    requirement: { type: 'modules', value: 3 },
    color: 'text-cyan-400'
  },
  {
    id: 'eco-champion',
    title: 'Eco Champion',
    description: 'Complete 5 modules',
    icon: Trophy,
    requirement: { type: 'modules', value: 5 },
    color: 'text-amber-400'
  },
  {
    id: 'point-collector',
    title: 'Point Collector',
    description: 'Earn 500 EcoPoints',
    icon: Zap,
    requirement: { type: 'points', value: 500 },
    color: 'text-yellow-400'
  },
  {
    id: 'eco-master',
    title: 'Eco Master',
    description: 'Earn 1000 EcoPoints',
    icon: Star,
    requirement: { type: 'points', value: 1000 },
    color: 'text-orange-400'
  },
  {
    id: 'planet-hero',
    title: 'Planet Hero',
    description: 'Complete all modules',
    icon: Crown,
    requirement: { type: 'modules', value: 8 },
    color: 'text-purple-400'
  },
  {
    id: 'dedication',
    title: 'Dedication',
    description: 'Complete 20 lessons',
    icon: Target,
    requirement: { type: 'lessons', value: 20 },
    color: 'text-pink-400'
  }
];

export interface UserProgress {
  completedLessons: string[];
  completedModules: string[];
  totalPoints: number;
  unlockedAchievements: string[];
  lastUpdated: string;
}

export const getInitialProgress = (): UserProgress => ({
  completedLessons: [],
  completedModules: [],
  totalPoints: 0,
  unlockedAchievements: [],
  lastUpdated: new Date().toISOString()
});

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem('ecoverse-progress', JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const loadProgress = (): UserProgress => {
  try {
    const saved = localStorage.getItem('ecoverse-progress');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  return getInitialProgress();
};

export const checkAchievements = (progress: UserProgress): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];
  
  achievements.forEach(achievement => {
    // Skip if already unlocked
    if (progress.unlockedAchievements.includes(achievement.id)) {
      return;
    }

    let isUnlocked = false;
    
    switch (achievement.requirement.type) {
      case 'lessons':
        isUnlocked = progress.completedLessons.length >= achievement.requirement.value;
        break;
      case 'modules':
        isUnlocked = progress.completedModules.length >= achievement.requirement.value;
        break;
      case 'points':
        isUnlocked = progress.totalPoints >= achievement.requirement.value;
        break;
    }

    if (isUnlocked) {
      newlyUnlocked.push({
        ...achievement,
        unlocked: true,
        unlockedAt: new Date().toISOString()
      });
      progress.unlockedAchievements.push(achievement.id);
    }
  });

  return newlyUnlocked;
};

export const getProgressPercentage = (completedModules: number, totalModules: number): number => {
  if (totalModules === 0) return 0;
  return Math.round((completedModules / totalModules) * 100);
};

export const getUserAchievements = (progress: UserProgress): Achievement[] => {
  return achievements.map(achievement => ({
    ...achievement,
    unlocked: progress.unlockedAchievements.includes(achievement.id)
  }));
};
