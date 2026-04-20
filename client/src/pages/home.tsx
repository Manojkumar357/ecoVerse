import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
  Waves, 
  CloudLightning, 
  Snowflake, 
  Droplets, 
  Trees, 
  PawPrint, 
  Sun, 
  Trash2,
  ChevronDown,
  ArrowRight,
  Fish,
  Shell,
  Circle,
  Play
} from 'lucide-react';
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Globe3D } from "@/components/Globe3D";
import { TopicCards } from "@/components/TopicCards";
import { SocialSidebar } from "@/components/SocialSidebar";
import { Button } from "@/components/ui/button";
import { ParticleBackground, ParticlePresets } from "@/components/ParticleBackground";
import { BackToTop } from "@/components/BackToTop";
import { ComparisonCard } from "@/components/BeforeAfterSlider";

// --- Types ---
interface ChapterData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  theme: string;
  icon: React.ReactNode;
  color: string;
  accent: string;
}

const CHAPTERS: ChapterData[] = [
  {
    id: 'ocean',
    number: '01',
    title: 'OCEAN CONSERVATION',
    subtitle: 'Save the Ocean',
    theme: 'Deep Ocean',
    icon: <Waves className="w-6 h-6" />,
    color: 'bg-blue-950',
    accent: 'text-cyan-400'
  },
  {
    id: 'climate',
    number: '02',
    title: 'CLIMATE CHANGE',
    subtitle: 'The Great Shift',
    theme: 'Stormy Skies',
    icon: <CloudLightning className="w-6 h-6" />,
    color: 'bg-zinc-900',
    accent: 'text-amber-500'
  },
  {
    id: 'arctic',
    number: '03',
    title: 'ARCTIC IS CALLING',
    subtitle: 'Frozen Echoes',
    theme: 'Icy Wilderness',
    icon: <Snowflake className="w-6 h-6" />,
    color: 'bg-slate-100',
    accent: 'text-blue-400'
  },
  {
    id: 'water',
    number: '04',
    title: 'WATER CONSERVATION',
    subtitle: 'Quench the Thirsty',
    theme: 'Life Source',
    icon: <Droplets className="w-6 h-6" />,
    color: 'bg-blue-900',
    accent: 'text-sky-300'
  },
  {
    id: 'forest',
    number: '05',
    title: 'FOREST CONSERVATION',
    subtitle: 'Save the Forests',
    theme: 'Ancient Green',
    icon: <Trees className="w-6 h-6" />,
    color: 'bg-emerald-950',
    accent: 'text-green-400'
  },
  {
    id: 'wildlife',
    number: '06',
    title: 'PROTECT WILDLIFE',
    subtitle: 'The Silent Roar',
    theme: 'Earth Tones',
    icon: <PawPrint className="w-6 h-6" />,
    color: 'bg-orange-950',
    accent: 'text-orange-400'
  },
  {
    id: 'energy',
    number: '07',
    title: 'RENEWABLE ENERGY',
    subtitle: 'Powering Tomorrow',
    theme: 'Clean Grid',
    icon: <Sun className="w-6 h-6" />,
    color: 'bg-indigo-950',
    accent: 'text-yellow-400'
  },
  {
    id: 'pollution',
    number: '08',
    title: 'STOP POLLUTION',
    subtitle: 'A Cleaner World',
    theme: 'The Final Stand',
    icon: <Trash2 className="w-6 h-6" />,
    color: 'bg-stone-900',
    accent: 'text-emerald-400'
  }
];

// --- Components ---

const Navigation = ({ activeChapter, show }: { activeChapter: string; show: boolean }) => {
  if (!show) return null;
  
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-6">
      {CHAPTERS.map((chapter, idx) => {
        const isActive = activeChapter === chapter.id;
        return (
          <a 
            key={chapter.id} 
            href={`#${chapter.id}`}
            className="group flex items-center gap-4 transition-all duration-500"
          >
            <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isActive ? 'text-white' : 'text-white/40'}`}>
                {chapter.number}
              </span>
              <span className={`text-xs font-medium tracking-tight ${isActive ? 'text-white' : 'text-white/40'}`}>
                {chapter.title.split(' ')[0]}
              </span>
            </div>
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ 
                  scale: isActive ? 1.5 : 1,
                  backgroundColor: isActive ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.2)' 
                }}
                className="w-1.5 h-1.5 rounded-full"
              />
              {isActive && (
                <motion.div 
                  layoutId="nav-ring"
                  className="absolute w-4 h-4 border border-white/40 rounded-full"
                />
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
};

const OceanChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const coralOpacity = useTransform(scrollProgress, [0.4, 0.7], [0, 1]);
  const plasticOpacity = useTransform(scrollProgress, [0.1, 0.5], [0.8, 0]);
  const fishOpacity = useTransform(scrollProgress, [0.3, 0.6, 0.9, 1.0], [0, 0.6, 0.6, 0]);
  const bgScale = useTransform(scrollProgress, [0, 1], [1.2, 1]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#000814]">
      {/* Particle Background - Bubbles */}
      <ParticleBackground {...ParticlePresets.ocean} />
      
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1.1, 1.15, 1.1],
          x: [-20, 20, -20],
          y: [-10, 10, -10]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-20 pointer-events-none"
      >
        <img 
          src="https://picsum.photos/seed/underwater_deep/1920/1080" 
          className="w-full h-full object-cover grayscale brightness-50"
          alt="Underwater"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.div 
        style={{ scale: bgScale }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#001d3d_0%,#000814_100%)]"
      />
      
      {/* Marine Snow */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [-10, -1200],
            x: [0, Math.sin(i) * 15],
            opacity: [0, 0.1, 0]
          }}
          transition={{ 
            duration: 25 + Math.random() * 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 25
          }}
          className="absolute w-[0.5px] h-[0.5px] bg-white/20 rounded-full"
          style={{ left: `${Math.random() * 100}%`, bottom: `-10px` }}
        />
      ))}

      {/* Fish */}
      {[...Array(15)].map((_, i) => (
        <motion.div 
          key={i}
          style={{ 
            x: useTransform(scrollProgress, [0.02 + i * 0.05, 0.98], [-200, 1900]),
            y: 50 + (i * 100) % 700,
            opacity: fishOpacity
          }}
          className="absolute text-cyan-200/40"
        >
          <Fish size={24 + (i % 3) * 12} />
        </motion.div>
      ))}

      {/* Coral */}
      <motion.div 
        style={{ opacity: coralOpacity }}
        className="absolute bottom-0 left-0 w-full h-1/2 flex items-end justify-around px-4"
      >
        {[...Array(28)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ 
              height: [90 + (i % 10) * 40, 130 + (i % 10) * 40, 90 + (i % 10) * 40],
              skewX: [-5, 5, -5]
            }}
            transition={{ 
              duration: 10 + (i % 6), 
              repeat: Infinity, 
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="w-14 bg-gradient-to-t from-cyan-950 to-cyan-400/5 rounded-t-full blur-[4px] origin-bottom"
          />
        ))}
      </motion.div>

      {/* Plastic Waste */}
      <motion.div 
        style={{ opacity: plasticOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="grid grid-cols-6 gap-32 opacity-20">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, 60, 0],
                rotate: [0, 30, -30, 0]
              }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trash2 className="w-20 h-20 text-white" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ClimateChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const skyColor = useTransform(scrollProgress, [0, 0.3, 0.6, 0.9], ["#1e293b", "#0f172a", "#020617", "#052e16"]);
  const rainOpacity = useTransform(scrollProgress, [0.3, 0.8], [0, 0.8]);

  return (
    <motion.div 
      style={{ backgroundColor: skyColor }}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Particle Background - Dust */}
      <ParticleBackground {...ParticlePresets.climate} />
      
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [-1, 1, -1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
      >
        <img 
          src="https://picsum.photos/seed/storm_clouds/1920/1080" 
          className="w-full h-full object-cover grayscale contrast-150"
          alt="Storm"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      {/* Rain */}
      <motion.div 
        style={{ opacity: rainOpacity }}
        className="absolute inset-0 pointer-events-none z-10"
      >
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, 1400] }}
            transition={{ 
              duration: 0.3 + Math.random() * 0.2, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 2
            }}
            className="absolute w-[1px] h-24 bg-gradient-to-b from-white/40 to-transparent"
            style={{ left: `${Math.random() * 100}%`, top: `-200px`, transform: 'rotate(10deg)' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

const ArcticChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const iceSplitX = useTransform(scrollProgress, [0.0, 1.0], [0, 1000]);
  const iceSplitXNeg = useTransform(scrollProgress, [0.0, 1.0], [0, -1000]);
  const snowOpacity = useTransform(scrollProgress, [0, 1], [0.5, 0.2]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#000814]">
      {/* Particle Background - Snowflakes */}
      <ParticleBackground {...ParticlePresets.arctic} />
      
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1.1, 1.15, 1.1],
          y: [-20, 20, -20]
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
      >
        <img 
          src="https://picsum.photos/seed/arctic_glacier_night/1920/1080" 
          className="w-full h-full object-cover brightness-75 contrast-125"
          alt="Arctic"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#001d3d] to-[#000814] z-5" />

      {/* Splitting Ice */}
      <div className="absolute inset-0 flex z-20">
        <motion.div 
          style={{ x: iceSplitXNeg }}
          className="w-1/2 h-full bg-white relative overflow-hidden shadow-[10px_0_50px_rgba(0,0,0,0.3)]"
        />
        <motion.div 
          style={{ x: iceSplitX }}
          className="w-1/2 h-full bg-white relative overflow-hidden shadow-[-10px_0_50px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* Snow */}
      <motion.div style={{ opacity: snowOpacity }} className="absolute inset-0 pointer-events-none z-30">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, 1200],
              x: [0, Math.sin(i) * 150],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              ease: "linear"
            }}
            className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[0.5px]"
            style={{ left: `${Math.random() * 100}%`, top: `-20px` }}
          />
        ))}
      </motion.div>
    </div>
  );
};

const WaterChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const waterLevel = useTransform(scrollProgress, [0, 0.8], ["100%", "0%"]);
  const dryLandOpacity = useTransform(scrollProgress, [0.3, 0.9], [0, 1]);
  const waveOpacity = useTransform(scrollProgress, [0, 0.3], [1, 0.3]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1a0f0a]">
      {/* Particle Background - Water Droplets */}
      <ParticleBackground {...ParticlePresets.water} />
      
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          x: [-10, 10, -10]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 opacity-10 mix-blend-screen pointer-events-none z-20"
      >
        <img 
          src="https://picsum.photos/seed/water_surface/1920/1080" 
          className="w-full h-full object-cover"
          alt="Water"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.div 
        style={{ opacity: dryLandOpacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
      </motion.div>

      {/* Animated Water with Waves */}
      <motion.div 
        style={{ height: waterLevel }}
        className="absolute bottom-0 left-0 w-full z-10 overflow-hidden"
      >
        {/* Main water body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03045e]/90 to-[#0077b6]/40 backdrop-blur-md" />
        
        {/* Animated Wave Layers */}
        <motion.div
          style={{ opacity: waveOpacity }}
          className="absolute top-0 left-0 w-full h-32 overflow-visible"
        >
          {/* Wave 1 - Large slow waves */}
          <motion.svg
            className="absolute top-0 left-0 w-full h-24"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            animate={{
              x: [-1440, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <path
              d="M0,60 C240,90 480,30 720,60 C960,90 1200,30 1440,60 L1440,120 L0,120 Z"
              fill="rgba(6, 182, 212, 0.3)"
            />
          </motion.svg>
          
          {/* Wave 2 - Medium waves */}
          <motion.svg
            className="absolute top-0 left-0 w-full h-24"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            animate={{
              x: [0, -1440],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <path
              d="M0,40 C360,70 720,10 1080,40 C1260,55 1350,25 1440,40 L1440,120 L0,120 Z"
              fill="rgba(14, 165, 233, 0.25)"
            />
          </motion.svg>

          {/* Wave 3 - Fast small waves */}
          <motion.svg
            className="absolute top-0 left-0 w-full h-20"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            animate={{
              x: [-1440, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <path
              d="M0,50 C180,65 360,35 540,50 C720,65 900,35 1080,50 C1260,65 1350,35 1440,50 L1440,100 L0,100 Z"
              fill="rgba(56, 189, 248, 0.2)"
            />
          </motion.svg>

          {/* Shimmer effect on waves */}
          <motion.div
            className="absolute top-0 left-0 w-full h-24"
            animate={{
              background: [
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              ],
              x: [-200, 1440]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>

        {/* Top border with wave effect */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <motion.div 
          style={{ opacity: dryLandOpacity }}
          className="text-center"
        >
          <Droplets className="w-32 h-32 text-stone-600/40 mx-auto mb-6" />
          <h3 className="text-4xl font-serif italic text-stone-500 tracking-widest">The well runs dry.</h3>
        </motion.div>
      </div>
    </div>
  );
};

const ForestChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const forestBg = useTransform(scrollProgress, [0, 1], ["#052e16", "#14532d"]);

  return (
    <motion.div 
      style={{ backgroundColor: forestBg }}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Particle Background - Leaves */}
      <ParticleBackground {...ParticlePresets.forest} />
      
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1.05, 1.1, 1.05],
          y: [-10, 10, -10]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
      >
        <img 
          src="https://picsum.photos/seed/misty_forest/1920/1080" 
          className="w-full h-full object-cover"
          alt="Forest"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around px-10">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            style={{ 
              scaleY: useTransform(scrollProgress, [0.1 + i * 0.04, 0.6 + i * 0.04], [0, 1]),
              opacity: useTransform(scrollProgress, [0.1 + i * 0.04, 0.3 + i * 0.04], [0, 1]),
              y: (i % 3) * 20
            }}
            className="relative flex flex-col items-center origin-bottom z-10"
          >
            <svg width="140" height="500" viewBox="0 0 140 500" className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <rect x="65" y="150" width="10" height="350" fill="#022c22" />
              <path d="M70 50 L20 180 L120 180 Z" fill="#064e3b" />
              <path d="M70 100 L30 220 L110 220 Z" fill="#065f46" />
              <path d="M70 150 L40 260 L100 260 Z" fill="#0f766e" />
            </svg>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const WildlifeChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const animalX = useTransform(scrollProgress, [0, 1], ["-10%", "110%"]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1a0f0a]">
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1.1, 1.15, 1.1],
          x: [-15, 15, -15]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none"
      >
        <img 
          src="https://picsum.photos/seed/savanna_safari/1920/1080" 
          className="w-full h-full object-cover grayscale brightness-75"
          alt="Wildlife"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.div 
        style={{ x: animalX }}
        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-60 z-10"
      >
        <PawPrint className="w-64 h-64 text-orange-200/5 blur-[1px]" />
        <PawPrint className="w-40 h-40 text-orange-200/10" />
        <PawPrint className="w-80 h-80 text-orange-200/5 blur-[2px]" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
    </div>
  );
};

const EnergyChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const skyColor = useTransform(scrollProgress, [0, 1], ["#020617", "#0f172a"]);
  const powerGlowOpacity = useTransform(scrollProgress, [0.3, 0.7], [0.2, 0.8]);

  return (
    <motion.div 
      style={{ backgroundColor: skyColor }}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Particle Background - Energy Sparkles */}
      <ParticleBackground {...ParticlePresets.energy} />
      
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 2, 0]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 opacity-10 mix-blend-screen pointer-events-none"
      >
        <img 
          src="https://picsum.photos/seed/wind_farm/1920/1080" 
          className="w-full h-full object-cover grayscale brightness-125"
          alt="Energy"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-around px-20 z-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative flex flex-col items-center">
            <div className="w-80 h-80 flex items-center justify-center relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 8 + i * 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="w-full h-full flex items-center justify-center relative"
              >
                {[0, 120, 240].map(deg => (
                  <div 
                    key={deg}
                    className="absolute w-6 h-48 bg-gradient-to-t from-white/90 via-white/40 to-transparent origin-bottom rounded-full"
                    style={{ 
                      transform: `rotate(${deg}deg) translateY(-100%)`,
                      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
                    }}
                  />
                ))}
                <motion.div 
                  style={{ opacity: powerGlowOpacity }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-12 h-12 bg-cyan-400 rounded-full blur-xl z-10"
                />
                <div className="w-10 h-10 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.6)] z-20" />
              </motion.div>
            </div>
            <div className="w-6 h-[600px] bg-gradient-to-b from-white/30 via-white/10 to-transparent mt-[-15px] rounded-b-full shadow-2xl" />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const PollutionChapter = ({ scrollProgress }: { scrollProgress: any }) => {
  const smogOpacity = useTransform(scrollProgress, [0, 0.7], [0.9, 0]);
  const skyBlue = useTransform(scrollProgress, [0.3, 0.9], ["#374151", "#0ea5e9"]);

  return (
    <motion.div 
      style={{ backgroundColor: skyBlue }}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Cinematic Background Image */}
      <motion.div 
        animate={{ 
          scale: [1.1, 1, 1.1],
          x: [-10, 10, -10]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none z-20"
      >
        <img 
          src="https://picsum.photos/seed/industrial_factory_smoke_pollution/1920/1080" 
          className="w-full h-full object-cover grayscale contrast-150"
          alt="Pollution"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.div 
        style={{ opacity: smogOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-stone-800 to-stone-900 z-30 pointer-events-none"
      />

      <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end justify-center gap-1 opacity-40 z-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-12 bg-stone-950 rounded-t-sm" 
            style={{ height: `${40 + Math.random() * 160}px` }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-40">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              boxShadow: ["0 0 20px rgba(250,204,21,0.2)", "0 0 60px rgba(250,204,21,0.5)", "0 0 20px rgba(250,204,21,0.2)"]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 bg-yellow-400 rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <Sun className="w-16 h-16 text-yellow-600" />
          </motion.div>
          <h3 className="text-5xl font-serif italic tracking-tight">A New Dawn</h3>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface ChapterProps {
  chapter: ChapterData;
  onEnter: (id: string) => void;
}

const Chapter: React.FC<ChapterProps> = ({ chapter, onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const isInView = useInView(containerRef, { amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      onEnter(chapter.id);
    }
  }, [isInView, chapter.id, onEnter]);

  const titleY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const subtitleOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 0.6]);

  return (
    <section 
      id={chapter.id}
      ref={containerRef}
      className="relative h-[200vh] w-full"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          {chapter.id === 'ocean' && <OceanChapter scrollProgress={scrollYProgress} />}
          {chapter.id === 'climate' && <ClimateChapter scrollProgress={scrollYProgress} />}
          {chapter.id === 'arctic' && <ArcticChapter scrollProgress={scrollYProgress} />}
          {chapter.id === 'water' && <WaterChapter scrollProgress={scrollYProgress} />}
          {chapter.id === 'forest' && <ForestChapter scrollProgress={scrollYProgress} />}
          {chapter.id === 'wildlife' && <WildlifeChapter scrollProgress={scrollYProgress} />}
          {chapter.id === 'energy' && <EnergyChapter scrollProgress={scrollYProgress} />}
          {chapter.id === 'pollution' && <PollutionChapter scrollProgress={scrollYProgress} />}
        </div>

        <div className="absolute inset-0 bg-black/20 z-10" />

        <div className="relative z-20 h-full w-full flex flex-col items-center justify-center px-6 text-center">
          <motion.div style={{ y: titleY, opacity: titleOpacity }} className="max-w-4xl">
            <h2 className="text-7xl md:text-9xl font-serif font-bold tracking-tighter mb-8 leading-none text-white">
              {chapter.title}
            </h2>
            
            <motion.p 
              style={{ opacity: subtitleOpacity }}
              className="text-2xl md:text-3xl font-light tracking-wide italic text-white/60"
            >
              "{chapter.subtitle}"
            </motion.p>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
          >
            <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Main Component ---

export default function Home() {
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);
  const [globalTint, setGlobalTint] = useState<null | "signin" | "signup">(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const globeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const { role, clear } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (globeRef.current) {
        const globeBottom = globeRef.current.getBoundingClientRect().bottom;
        setShowNavigation(globeBottom < window.innerHeight / 2);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-black">
      {/* Global Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-white origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Left Scroll Indicator */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-4">
        {showNavigation && (
          <>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] rotate-180 [writing-mode:vertical-lr]">Scroll</span>
            <div className="w-[1px] h-32 bg-white/10 relative overflow-hidden">
              <motion.div 
                style={{ scaleY: scrollYProgress }}
                className="absolute top-0 left-0 w-full h-full bg-white origin-top"
              />
            </div>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] rotate-180 [writing-mode:vertical-lr]">Explore</span>
          </>
        )}
      </div>

      {/* Navigation Sidebar - Only show after globe section */}
      <Navigation activeChapter={activeChapter} show={showNavigation} />

      {/* Original Hero Section with Globe */}
      <div ref={globeRef} className="min-h-screen bg-space-gradient text-white relative overflow-hidden">
        {/* Full-screen hover tint for Sign In / Sign Up */}
        <div
          className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-300 ${
            globalTint === "signin"
              ? "bg-[var(--earth-cyan)]/35 opacity-100"
              : globalTint === "signup"
              ? "bg-earth-orange/40 opacity-100"
              : "opacity-0"
          }`}
        />

        <header className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Global menu overlay handles navigation; left space kept clean */}
            </div>
            <nav className="flex items-center gap-4 md:gap-6">
              <Link
                href="/about"
                className="text-white hover:text-earth-cyan transition-colors duration-300 font-medium"
                data-testid="link-about"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-earth-cyan transition-colors duration-300 font-medium"
                data-testid="link-contact"
              >
                Contact
              </Link>
              {!role ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/signin"
                    onMouseEnter={() => setGlobalTint("signin")}
                    onMouseLeave={() => setGlobalTint(null)}
                    className="px-4 py-2 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] hover:bg-white/5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onMouseEnter={() => setGlobalTint("signup")}
                    onMouseLeave={() => setGlobalTint(null)}
                    className="px-4 py-2 rounded-lg bg-earth-orange hover:bg-earth-orange-hover text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href={role === 'student' ? '/student' : role === 'teacher' ? '/teacher' : '/admin'}
                    className="px-3 py-2 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] hover:bg-white/5"
                  >
                    Open {role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'Admin'} Portal
                  </Link>
                  <button onClick={clear} className="px-3 py-2 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] hover:bg-white/5">Logout</button>
                </div>
              )}
            </nav>
          </div>
        </header>

        {/* Social Sidebar - visible on globe section only */}
        {!showNavigation && <SocialSidebar />}

        {/* Logo in Top Left - visible after scrolling past globe */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: showNavigation ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: showNavigation ? 'auto' : 'none' }}
          className="fixed top-8 left-8 z-50 flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full">
            <Trees className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-tight leading-none text-white">ECO-VERSE</h1>
            <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Cinematic Journey</p>
          </div>
        </motion.div>

        {/* Main Content with Globe */}
        <main className="min-h-screen flex items-center justify-between pl-20 md:pl-24 lg:pl-28 pr-4 md:pr-8 lg:pr-12 xl:pr-16 py-20">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-3 xl:col-span-4 space-y-6 text-center lg:text-left pl-12 lg:pl-0 relative z-30">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  ECO-VERSE<br />
                  <span className="text-earth-cyan">ACADEMY</span>
                </h1>
                <p className="text-earth-muted text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                  Master Quests. Unlock Knowledge.<br />
                  Become a Planet Hero.
                </p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('ocean')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-earth-orange hover:bg-earth-orange-hover px-8 py-4 text-white font-semibold rounded-lg flex items-center space-x-3 mx-auto lg:mx-0 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-orange"
              >
                <Play className="h-4 w-4" />
                <span>START YOUR JOURNEY</span>
              </motion.button>
            </div>

            {/* 3D Globe */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-center order-first lg:order-none relative z-0">
              <div className="globe-container floating lg:-ml-8 xl:-ml-14 2xl:-ml-20 lg:-mt-4 xl:-mt-6 relative z-0">
                <Globe3D />
              </div>
            </div>

            {/* Topic Cards */}
            <div className="lg:col-span-3 xl:col-span-3 w-full max-w-[420px] xl:max-w-[470px] ml-auto lg:mr-2 xl:mr-4 relative z-30">
              <TopicCards />
            </div>
            
          </div>
        </main>


      </div>

      {/* "The Earth is Breathing" Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10" />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-20 pointer-events-none"
          >
            <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-blue-900 to-black" />
          </motion.div>
        </div>

        <div className="relative z-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <span className="text-xs font-mono tracking-[0.5em] text-emerald-400 uppercase mb-6 block">
              A Global Conservation Initiative
            </span>
            <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tighter mb-8 text-white">
              The Earth <br /> <span className="italic font-light text-white">is Breathing.</span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-white/60 font-light leading-relaxed mb-12">
              Embark on an immersive cinematic journey through the critical ecosystems of our planet. 
              Witness the beauty, understand the threats, and join the restoration.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('ocean')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-black rounded-full font-medium flex items-center gap-3 mx-auto group transition-all"
            >
              Begin the Experience
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 z-30"
        >
          <span className="text-[10px] font-mono tracking-widest uppercase text-white">Scroll to explore</span>
          <ChevronDown className="w-6 h-6 text-white" />
        </motion.div>
      </section>

      {/* Chapters */}
      <div className="relative">
        {CHAPTERS.map((chapter) => (
          <Chapter 
            key={chapter.id} 
            chapter={chapter} 
            onEnter={setActiveChapter} 
          />
        ))}
      </div>

      {/* Environmental Impact Comparison */}
      <section className="relative min-h-screen py-24 px-6 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent"
            >
              Environmental Impact
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-white/70 max-w-3xl mx-auto"
            >
              Witness the transformation. Drag the slider to compare the devastating effects of environmental damage with the hope of restoration.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ComparisonCard
                title="Coral Reef Revival"
                description="See how healthy coral ecosystems can be restored from bleached, lifeless reefs through conservation efforts."
                beforeImage="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80"
                afterImage="https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80"
                beforeLabel="Bleached Reef"
                afterLabel="Restored Reef"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ComparisonCard
                title="Forest Regeneration"
                description="From deforested barren land to thriving forest ecosystems - witness nature's resilience with proper conservation."
                beforeImage="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80"
                afterImage="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
                beforeLabel="Deforested"
                afterLabel="Reforested"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ComparisonCard
                title="Ocean Cleanup"
                description="The dramatic difference between polluted waters and clean oceans through dedicated cleanup initiatives."
                beforeImage="https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80"
                afterImage="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
                beforeLabel="Polluted"
                afterLabel="Clean"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ComparisonCard
                title="Wildlife Habitat Recovery"
                description="See how protecting natural habitats allows wildlife populations to thrive and ecosystems to flourish."
                beforeImage="https://images.unsplash.com/photo-1611416517780-eff3a13b0359?w=800&q=80"
                afterImage="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80"
                beforeLabel="Degraded"
                afterLabel="Protected"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="relative h-screen flex flex-col items-center justify-center bg-black px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-3xl relative z-20"
        >
          <h2 className="text-6xl md:text-8xl font-serif mb-8 tracking-tighter text-white">Our Planet Needs You</h2>
          <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 italic">
            The journey begins when you choose to act. <br />
            Every decision shapes the world we leave behind.
          </p>
          <Link href="/learn">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-emerald-500 text-white rounded-full font-medium text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              Take Action Now
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative h-screen flex flex-col items-center justify-center bg-stone-950 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-2xl"
        >
          <Trees className="w-16 h-16 text-emerald-500 mx-auto mb-8" />
          <h2 className="text-5xl font-serif mb-6 text-white">Our Future is Shared.</h2>
          <p className="text-white/40 font-light mb-12">
            Eco-Verse Academy is designed to raise awareness for global conservation efforts. 
            Every scroll brings us closer to understanding our impact.
          </p>
        </motion.div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/10 uppercase tracking-[0.3em]">
          &copy; 2026 Eco-Verse Initiative. All Rights Reserved.
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
