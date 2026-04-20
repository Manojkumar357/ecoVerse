import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import WasteSegregation from "@/components/games/WasteSegregation";
import EcoHome from "@/components/games/EcoHome";
import Quiz from "@/components/games/primitives/Quiz";
import Reorder from "@/components/games/primitives/Reorder";
import ClickCollect from "@/components/games/primitives/ClickCollect";
import GridPicker from "@/components/games/primitives/GridPicker";
import Stepper from "@/components/games/primitives/Stepper";
import { useAuth } from "@/lib/auth";
import { GAMES, getGameById, mergeGamesCatalog } from "@/lib/gamesCatalog";

function Confetti() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    const confetti = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h - h,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 3,
      life: 1,
      maxLife: 1 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      angularVel: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 4 + 2,
      type: Math.floor(Math.random() * 3),
    }));
    const colors = ['#4ade80', '#10b981', '#06b6d4', '#fbbf24', '#f87171'];
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      let active = 0;
      for (const p of confetti) {
        p.life -= 0.01;
        if (p.life <= 0) continue;
        active++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.angle += p.angularVel;
        const alpha = Math.min(p.life / p.maxLife, 1) * 0.9;
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        if (p.type === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.type === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const r = p.size / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (active > 0) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0" />;
}

function Particles() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
    }));
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      // background subtle radial
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.2);
      grad.addColorStop(0, 'rgba(42, 84, 164, 0.15)');
      grad.addColorStop(1, 'rgba(7, 14, 28, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // particles
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 -z-10" />;
}

function ParallaxBlobs() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5) * 20;
      const y = (e.clientY / h - 0.5) * 20;
      el.style.setProperty('--rx', `${-y}deg`);
      el.style.setProperty('--ry', `${x}deg`);
      el.style.setProperty('--tx', `${x * 0.5}px`);
      el.style.setProperty('--ty', `${y * 0.5}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.35),transparent_60%)]"
           style={{ transform: 'translate(var(--tx), var(--ty)) rotateX(var(--rx)) rotateY(var(--ry))', filter: 'blur(20px)' }} />
      <div className="absolute -bottom-32 -right-24 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle_at_60%_60%,rgba(16,185,129,0.35),transparent_60%)]"
           style={{ transform: 'translate(calc(var(--tx)*-0.6), calc(var(--ty)*-0.6)) rotateX(calc(var(--rx)*-1)) rotateY(calc(var(--ry)*-1))', filter: 'blur(20px)' }} />
    </div>
  );
}

interface ExternalGameLoaderProps {
  gameId: string;
  gameUrl: string;
  onComplete: () => void;
  onNavigate?: (path: string) => void;
  gameIcon?: string;
  gameName?: string;
  gameDescription?: string;
  gamePoints?: number;
}

type GameGuide = {
  overview: string;
  whyItMatters: string[];
  actionChecklist: string[];
  howToPlay: string[];
  realWorldImpact: string[];
  learnModuleId: string;
  learnLessonIds: string[];
  learnModule: string;
  learnLessons: string[];
  learnOutcomes: string[];
};

const GAME_GUIDES: Partial<Record<string, GameGuide>> = {
  seaverse: {
    overview:
      "SeaVerse: Ocean Guardian is a mission-based eco game where your choices directly influence marine life survival, pollution reduction, and ecosystem recovery.",
    whyItMatters: [
      "Over 8 million tons of plastic leak into oceans yearly, disrupting food chains and biodiversity.",
      "Coastal ecosystems protect communities from storms, but reef and mangrove damage weakens this natural shield.",
      "Small behavior changes at city level can significantly reduce marine waste entering rivers and coasts.",
    ],
    actionChecklist: [
      "Carry one reusable bottle and one reusable bag daily.",
      "Refuse single-use plastics when alternatives exist.",
      "Join or organize one local waterbody clean-up this month.",
    ],
    howToPlay: [
      "Play through each mission and objective in sequence.",
      "Follow scene prompts and complete mini challenges to clean, protect, and restore the ocean.",
      "Watch for harmful actions (pollution, overfishing, habitat damage) and choose the eco-safe option.",
      "Finish all tasks to complete the journey and earn full points.",
    ],
    realWorldImpact: [
      "Builds awareness of marine pollution, coral stress, and biodiversity loss.",
      "Teaches practical prevention habits like waste reduction and responsible disposal.",
      "Connects personal choices to ocean health outcomes in an interactive way.",
    ],
    learnModuleId: "ocean",
    learnLessonIds: ["1", "3", "4"],
    learnModule: "Save the Ocean",
    learnLessons: [
      "Coral Reef Ecosystems",
      "Marine Plastic Pollution",
      "Sustainable Fisheries",
    ],
    learnOutcomes: [
      "Understand marine ecosystem fragility and reef protection.",
      "Learn practical anti-pollution behaviors for daily life.",
    ],
  },
  "eco-word-spell": {
    overview:
      "Eco Word Spell is a vocabulary challenge where you build and recognize sustainability terms under light time pressure.",
    whyItMatters: [
      "Environmental decisions often depend on understanding terms like mitigation, adaptation, and circular economy.",
      "Strong vocabulary improves comprehension of climate news, policy updates, and school content.",
      "Language clarity helps people move from awareness to action faster.",
    ],
    actionChecklist: [
      "Learn 3 new environmental terms each week and use them in conversation.",
      "Keep a mini glossary in notes for revision.",
      "Explain one eco concept to a friend using plain language.",
    ],
    howToPlay: [
      "Read each prompt and spell the correct eco-related word.",
      "Focus on accuracy first, then improve speed for better completion flow.",
      "Use mistakes as hints to learn new environmental terminology.",
      "Complete rounds to finish the game and earn full points.",
    ],
    realWorldImpact: [
      "Improves understanding of environmental language used in news, policy, and school content.",
      "Builds confidence to discuss sustainability topics in projects and daily life.",
      "Turns abstract climate terms into practical, memorable vocabulary.",
    ],
    learnModuleId: "eco-literacy",
    learnLessonIds: ["1", "3", "4"],
    learnModule: "Environmental Literacy",
    learnLessons: [
      "Core Sustainability Terms",
      "From Terms to Action",
      "Communicating Eco Ideas Clearly",
    ],
    learnOutcomes: [
      "Use key climate terms correctly in real conversations.",
      "Connect vocabulary to practical climate actions.",
    ],
  },
  "sorting-stories-game": {
    overview:
      "Sorting Stories is a scenario-based decision game where you choose the most sustainable waste and recycling actions in realistic everyday situations.",
    whyItMatters: [
      "Mixed or contaminated recycling loads can cause entire batches to be discarded.",
      "Correct sorting directly increases material recovery and lowers landfill pressure.",
      "Household-level waste choices strongly affect urban cleanliness and marine leakage.",
    ],
    actionChecklist: [
      "Clean food containers before putting them in recycling bins.",
      "Separate dry recyclables from wet waste daily.",
      "Create a simple home chart for local bin rules.",
    ],
    howToPlay: [
      "Read each short story or scenario carefully before selecting an option.",
      "Choose the action that best matches recycling rules and low-waste habits.",
      "Pay attention to context (material type, contamination, reuse options).",
      "Complete all scenarios to finish the game and collect full points.",
    ],
    realWorldImpact: [
      "Improves real-life waste sorting accuracy at home, school, and public bins.",
      "Reduces contamination in recycling streams, improving recovery and reuse rates.",
      "Strengthens sustainable decision-making habits through practical story contexts.",
    ],
    learnModuleId: "ocean",
    learnLessonIds: ["3", "2", "4"],
    learnModule: "Save the Ocean",
    learnLessons: [
      "Marine Plastic Pollution",
      "Ocean Acidification",
      "Sustainable Fisheries",
    ],
    learnOutcomes: [
      "Improve correct sorting behavior and reduce recycling contamination.",
      "Understand how waste decisions affect oceans and food chains.",
    ],
  },
  "eco-arrow-harmony": {
    overview:
      "Eco Arrow Harmony is a pattern-and-pathway game where you follow the correct eco-flow directions to reinforce sustainable choices and systems thinking.",
    whyItMatters: [
      "Climate problems are connected systems, not isolated events.",
      "Understanding chains of cause and effect improves long-term decision quality.",
      "Pathway thinking helps prioritize high-impact interventions over low-impact tasks.",
    ],
    actionChecklist: [
      "Map one personal routine and replace one high-emission step.",
      "Use public transport twice a week where possible.",
      "Set a monthly eco-goal and track progress.",
    ],
    howToPlay: [
      "Observe the arrow sequence and identify the sustainable path pattern.",
      "Follow directional cues in order and avoid incorrect branches.",
      "Maintain focus and rhythm to complete each stage cleanly.",
      "Finish all rounds to complete the challenge and earn full points.",
    ],
    realWorldImpact: [
      "Strengthens cause-and-effect thinking for sustainability decisions.",
      "Encourages planning habits useful in energy, transport, and daily eco choices.",
      "Builds faster recognition of high-impact sustainable pathways.",
    ],
    learnModuleId: "climate",
    learnLessonIds: ["2", "4", "3"],
    learnModule: "Climate Change",
    learnLessons: [
      "Extreme Weather Events",
      "Climate Solutions",
      "Carbon Footprint",
    ],
    learnOutcomes: [
      "Build pathway thinking for long-term sustainable planning.",
      "Identify high-impact climate choices faster.",
    ],
  },
  "eco-balance-grid": {
    overview:
      "Eco Balance Grid challenges you to balance environmental trade-offs across a decision grid, teaching practical sustainability priorities.",
    whyItMatters: [
      "Most environmental choices involve trade-offs between cost, convenience, and long-term impact.",
      "Water and energy systems are interdependent; poor planning creates hidden losses.",
      "Balanced decisions protect resources while maintaining practical daily living.",
    ],
    actionChecklist: [
      "Track home water usage for one week.",
      "Fix one leak or wastage point immediately.",
      "Adopt one reuse habit for kitchen or bathroom water.",
    ],
    howToPlay: [
      "Review each grid challenge and identify which choices improve long-term sustainability.",
      "Balance resources and outcomes instead of optimizing only one factor.",
      "Avoid decisions that create hidden environmental costs.",
      "Complete all grid rounds to finish and earn full points.",
    ],
    realWorldImpact: [
      "Builds systems-thinking for daily sustainability decisions.",
      "Shows how small choices affect energy, waste, and ecosystem pressure.",
      "Encourages balanced decision-making over short-term convenience.",
    ],
    learnModuleId: "water",
    learnLessonIds: ["1", "2", "3"],
    learnModule: "Water Conservation",
    learnLessons: [
      "Global Water Scarcity",
      "Rainwater Harvesting",
      "Groundwater Depletion",
    ],
    learnOutcomes: [
      "Practice balancing resource use versus long-term sustainability.",
      "Develop practical water-saving decision habits.",
    ],
  },
  "badgas-hunter": {
    overview:
      "Bad Gas Hunter focuses on identifying and reducing harmful emissions through fast, targeted decisions.",
    whyItMatters: [
      "Air pollution and greenhouse emissions often come from the same sources.",
      "Cleaner transport and energy choices improve both climate outcomes and public health.",
      "Rapid identification of emission hotspots helps communities act earlier.",
    ],
    actionChecklist: [
      "Replace one short car trip per week with walking or cycling.",
      "Reduce unnecessary electricity use during peak hours.",
      "Support low-emission options in school or neighborhood events.",
    ],
    howToPlay: [
      "Spot high-pollution targets quickly and prioritize cleaner actions.",
      "React fast while maintaining accuracy for better outcomes.",
      "Chain correct actions to build score and complete objectives.",
      "Finish all rounds to complete the mission and claim points.",
    ],
    realWorldImpact: [
      "Improves awareness of pollution sources in transport, energy, and industry.",
      "Reinforces low-emission habits and clean-air thinking.",
      "Helps connect emissions reduction to public health outcomes.",
    ],
    learnModuleId: "climate",
    learnLessonIds: ["1", "3", "2"],
    learnModule: "Climate Change",
    learnLessons: [
      "Greenhouse Effect",
      "Carbon Footprint",
      "Extreme Weather Events",
    ],
    learnOutcomes: [
      "Identify emission-heavy activities and cleaner alternatives.",
      "Relate air quality choices to climate and health outcomes.",
    ],
  },
  "eco-hit": {
    overview:
      "Eco Hit is a reflex game that trains you to identify and hit eco-positive targets while avoiding harmful options.",
    whyItMatters: [
      "Real-world sustainability often requires quick decisions in daily routines.",
      "Fast recognition of good vs harmful choices reduces decision fatigue.",
      "Behavioral repetition builds automatic eco-friendly habits.",
    ],
    actionChecklist: [
      "Pick one daily routine and pre-decide the eco-friendly option.",
      "Use reminders for common choices like bottle, bag, and power switches.",
      "Review one decision each day: what was sustainable, what can improve.",
    ],
    howToPlay: [
      "Watch targets appear and hit only the sustainable choice.",
      "Avoid wrong taps that represent harmful environmental actions.",
      "Keep a steady rhythm to maximize accuracy and score.",
      "Complete all stages to finish and earn full points.",
    ],
    realWorldImpact: [
      "Strengthens quick recognition of eco-friendly choices.",
      "Improves decision speed in real-life sustainability situations.",
      "Turns awareness into faster action-oriented habits.",
    ],
    learnModuleId: "eco-literacy",
    learnLessonIds: ["2", "3", "4"],
    learnModule: "Environmental Literacy",
    learnLessons: [
      "Reading Environmental Data",
      "From Terms to Action",
      "Communicating Eco Ideas Clearly",
    ],
    learnOutcomes: [
      "Train quick recognition of sustainable vs harmful choices.",
      "Turn environmental awareness into faster daily action.",
    ],
  },
  "eco-shoot": {
    overview:
      "Eco Shoot is an action game where environmental threats are the targets and strategic responses protect nature.",
    whyItMatters: [
      "Environmental damage scales quickly when risks are ignored.",
      "Early action on pollution and habitat threats prevents expensive recovery later.",
      "Prioritization skills are critical in disaster and ecosystem response.",
    ],
    actionChecklist: [
      "Identify one local environmental issue and report it through proper channels.",
      "Join one awareness campaign or volunteer activity each quarter.",
      "Practice separating urgent actions from long-term actions in eco planning.",
    ],
    howToPlay: [
      "Engage with incoming threats and respond using the game controls.",
      "Prioritize high-impact threats first to protect the ecosystem.",
      "Maintain movement and timing for survival and higher scores.",
      "Clear all waves to complete the mission and earn points.",
    ],
    realWorldImpact: [
      "Builds urgency around real environmental threats.",
      "Encourages proactive problem-solving instead of passive awareness.",
      "Improves focus on high-impact environmental interventions.",
    ],
    learnModuleId: "ocean",
    learnLessonIds: ["1", "3", "2"],
    learnModule: "Save the Ocean",
    learnLessons: [
      "Coral Reef Ecosystems",
      "Marine Plastic Pollution",
      "Ocean Acidification",
    ],
    learnOutcomes: [
      "Prioritize urgent ecosystem threats effectively.",
      "Link protective interventions to real marine recovery outcomes.",
    ],
  },
  "environment-word-explorer": {
    overview:
      "Environment Word Explorer expands your sustainability vocabulary through discovery-based word challenges.",
    whyItMatters: [
      "Understanding environmental data starts with understanding terminology.",
      "Clear vocabulary improves participation in climate and sustainability discussions.",
      "Better language leads to better interpretation of reports, charts, and recommendations.",
    ],
    actionChecklist: [
      "Read one short climate article weekly and note unfamiliar terms.",
      "Use one new eco-term correctly in a class or team discussion.",
      "Build a personal glossary with examples and real-life usage.",
    ],
    howToPlay: [
      "Read prompts and identify the best matching environmental term.",
      "Use context clues to learn unfamiliar words quickly.",
      "Repeat and refine to improve retention and score.",
      "Complete all word sets to finish and gain full points.",
    ],
    realWorldImpact: [
      "Improves literacy for climate, conservation, and sustainability discussions.",
      "Helps you understand environmental reports and educational content better.",
      "Builds confidence to communicate sustainability ideas clearly.",
    ],
    learnModuleId: "eco-literacy",
    learnLessonIds: ["1", "2", "4"],
    learnModule: "Environmental Literacy",
    learnLessons: [
      "Core Sustainability Terms",
      "Reading Environmental Data",
      "Communicating Eco Ideas Clearly",
    ],
    learnOutcomes: [
      "Build stronger comprehension of sustainability content and reports.",
      "Improve communication confidence in environmental topics.",
    ],
  },
  "matching-pairs-date": {
    overview:
      "A fast memory and matching challenge with a playful date-night style twist. Matching Pairs Date is a memory-and-recall challenge where you use focus, pattern recognition, and quick matching to clear the board.",
    whyItMatters: [
      "Memory games strengthen attention, recall, and visual scanning, which help with learning complex environmental topics too.",
      "Recognizing patterns faster supports better decision-making when comparing eco options in daily life.",
      "Quick recall is useful for remembering rules, labels, and action steps in sustainability tasks.",
    ],
    actionChecklist: [
      "Practice remembering one recycling rule before each home sorting task.",
      "Use flashcards to memorize five sustainability terms this week.",
      "Match one eco action with one real-life routine, like turning off lights or reusing bottles.",
    ],
    howToPlay: [
      "Flip cards and remember where each symbol or image appears.",
      "Match identical pairs with as few moves as possible.",
      "Use pattern memory to avoid repeated misses and improve score.",
      "Clear the full board to finish the game and earn full points.",
    ],
    realWorldImpact: [
      "Improves focus, short-term memory, and pattern recognition.",
      "Builds better recall for rules, labels, and step-by-step tasks.",
      "Supports stronger learning habits for environmental education and daily routines.",
    ],
    learnModuleId: "eco-literacy",
    learnLessonIds: ["1", "2", "4"],
    learnModule: "Environmental Literacy",
    learnLessons: [
      "Core Sustainability Terms",
      "Reading Environmental Data",
      "Communicating Eco Ideas Clearly",
    ],
    learnOutcomes: [
      "Use memory skills to retain key environmental vocabulary.",
      "Link pattern recognition to clearer eco decision-making.",
    ],
  },
  "acquamind": {
    overview:
      "AcquaMind is a water-awareness challenge that builds focus around conservation, efficient use, and daily habits that protect freshwater systems.",
    whyItMatters: [
      "Freshwater is limited, and wasteful usage increases scarcity risks for communities.",
      "Small household habits can reduce water stress and energy used in treatment and pumping.",
      "Water-smart behavior supports health, agriculture, and ecosystem stability together.",
    ],
    actionChecklist: [
      "Turn off taps while brushing and reduce unnecessary flow time.",
      "Track one week of water use and identify one avoidable wastage pattern.",
      "Reuse lightly used water where safe for cleaning or plants.",
    ],
    howToPlay: [
      "Follow each prompt and choose the water-smart action in the scenario.",
      "Prioritize options that reduce wastage and improve long-term conservation.",
      "Watch for hidden high-consumption choices and avoid them.",
      "Complete all rounds to finish the challenge and earn full points.",
    ],
    realWorldImpact: [
      "Builds practical water-saving habits that can be used at home and school.",
      "Improves decision-making about efficient resource use in daily routines.",
      "Strengthens awareness of the link between water conservation and environmental health.",
    ],
    learnModuleId: "water",
    learnLessonIds: ["1", "2", "4"],
    learnModule: "Water Conservation",
    learnLessons: [
      "Global Water Scarcity",
      "Rainwater Harvesting",
      "Wastewater Recycling",
    ],
    learnOutcomes: [
      "Apply practical water-conservation choices in everyday life.",
      "Connect personal water use decisions to long-term sustainability outcomes.",
    ],
  },
  "tsunami-expedition": {
    overview:
      "Tsunami Expedition is a hazard-awareness adventure focused on reading warning signs, responding quickly, and understanding coastal safety.",
    whyItMatters: [
      "Tsunamis are fast-moving coastal hazards, so early warning and evacuation knowledge can save lives.",
      "Prepared communities recover faster when people understand safe routes and emergency signals.",
      "Climate resilience means learning how to respond to sudden natural events with calm, informed action.",
    ],
    actionChecklist: [
      "Learn the nearest evacuation route if you live near a coast.",
      "Keep a basic emergency kit ready with water, torch, and power bank.",
      "Memorize warning signs such as sudden sea retreat and strong shaking.",
    ],
    howToPlay: [
      "Follow the expedition path and react to hazard cues as they appear.",
      "Make the safest decision when the environment shifts or a warning is triggered.",
      "Stay alert for fast changes and prioritize evacuation over risky actions.",
      "Complete the mission by navigating all stages safely.",
    ],
    realWorldImpact: [
      "Improves awareness of tsunami warning signs and emergency readiness.",
      "Builds calm response habits for coastal and disaster-prone areas.",
      "Reinforces the value of planning, communication, and community preparedness.",
    ],
    learnModuleId: "earth-resilience",
    learnLessonIds: ["1", "2", "3"],
    learnModule: "Earth Science and Resilience",
    learnLessons: [
      "Tsunamis and Coastal Hazards",
      "Warning Signs and Evacuation",
      "Community Preparedness and Recovery",
    ],
    learnOutcomes: [
      "Understand how coastal hazards form and spread.",
      "Learn practical steps for safe evacuation and preparation.",
    ],
  },
  "mineral-expedition": {
    overview:
      "Mineral Expedition explores rocks, minerals, and resource discovery through careful observation and earth-science problem solving.",
    whyItMatters: [
      "Minerals power devices, buildings, and everyday products, so understanding them helps explain the material world.",
      "Responsible extraction and restoration matter because mining changes landscapes, water systems, and habitats.",
      "Knowing where materials come from supports better choices about reuse, recycling, and waste reduction.",
    ],
    actionChecklist: [
      "Identify one product you use that depends on mined minerals.",
      "Recycle e-waste and batteries through proper collection channels.",
      "Think reuse first before replacing metal, glass, or electronic items.",
    ],
    howToPlay: [
      "Explore the terrain and observe clues to identify mineral-related challenges.",
      "Choose the best route or response when resource decisions appear.",
      "Balance exploration with environmental care to complete each stage.",
      "Finish the expedition by clearing all discovery tasks.",
    ],
    realWorldImpact: [
      "Builds awareness of how minerals connect to daily technology and infrastructure.",
      "Encourages responsible resource use and recycling habits.",
      "Highlights the environmental cost of extraction and the value of restoration.",
    ],
    learnModuleId: "earth-resilience",
    learnLessonIds: ["3", "4", "1"],
    learnModule: "Earth Science and Resilience",
    learnLessons: [
      "Rocks, Minerals, and the Resource Cycle",
      "Responsible Mining and Restoration",
      "Tsunamis and Coastal Hazards",
    ],
    learnOutcomes: [
      "Connect minerals to real products and everyday systems.",
      "Understand why resource extraction needs responsible management.",
    ],
  },
};

function ExternalGameLoader({ gameId, gameUrl, onComplete, onNavigate, gameIcon = '🎮', gameName = 'SeaVerse: Ocean Guardian', gameDescription = 'Protect and restore our oceans. Complete missions to save marine life, stop pollution, and learn about ocean conservation.', gamePoints = 100 }: ExternalGameLoaderProps) {
  const [launched, setLaunched] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionState, setCompletionState] = useState<'pending' | 'success' | 'error'>('pending');
  const guide = GAME_GUIDES[gameId];
  const [activePanel, setActivePanel] = useState<'about' | 'play' | 'impact' | 'read' | 'learn'>('about');
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});
  const storageKey = `game-checklist-${gameId}`;
  const openButtonLabel = `Open ${gameName}`;
  
  // Load checklist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedActions(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Failed to load checklist from localStorage');
    }
  }, [gameId, storageKey]);
  
  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedActions));
    } catch (e) {
      console.log('Failed to save checklist to localStorage');
    }
  }, [checkedActions, storageKey]);

  const readProgress = guide?.actionChecklist?.length
    ? Math.round((Object.values(checkedActions).filter(Boolean).length / guide.actionChecklist.length) * 100)
    : 0;

  const toggleAction = (index: number) => {
    setCheckedActions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const playCompletionSound = () => {
    // Play a success sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Create a pleasant "ding" sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      playCompletionSound();
      await onComplete();
      setCompletionState('success');
    } catch (err) {
      setCompletionState('error');
      setCompleting(false);
    }
  };

  // Show game info modal before launching game
  if (!launched) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-start gap-4 text-white px-3 sm:px-4 py-4">
        <div className="w-full max-w-4xl rounded-2xl border border-cyan-100/25 bg-[#071a27]/78 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
          <div className="text-3xl sm:text-5xl text-center">{gameIcon}</div>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">{gameName}</h2>
            <p className="text-sm sm:text-lg text-white/90 mb-4 leading-relaxed">{gameDescription}</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-green-400">+{gamePoints} pts</div>
                <div className="text-xs sm:text-sm text-white/80">Reward</div>
              </div>
            </div>
          </div>

          {guide ? (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'about', label: 'About' },
                  { id: 'play', label: 'How To Play' },
                  { id: 'impact', label: 'Real-Life Effects' },
                  { id: 'read', label: 'Read + Action' },
                  { id: 'learn', label: 'Learn Path' },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePanel(tab.id as 'about' | 'play' | 'impact' | 'read' | 'learn')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 ${
                      activePanel === tab.id
                        ? 'bg-emerald-400/25 border-emerald-200/60 text-emerald-100 shadow-lg shadow-emerald-500/20'
                        : 'bg-white/10 border-white/25 text-white/85 hover:bg-white/15 hover:border-white/40'
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/25 bg-gradient-to-br from-black/35 to-black/20 backdrop-blur-sm p-6 min-h-[255px] shadow-xl"
                >
                  {activePanel === 'about' && (
                    <>
                      <div className="text-xs uppercase tracking-[0.12em] text-cyan-300/95 mb-3 font-semibold">About This Game</div>
                      <p className="text-[15px] text-white/95 leading-relaxed">{guide.overview}</p>
                    </>
                  )}

                  {activePanel === 'play' && (
                    <>
                      <div className="text-xs uppercase tracking-[0.12em] text-cyan-300/95 mb-3 font-semibold">How To Play</div>
                      <ul className="space-y-2.5 text-[15px] text-white/95 list-disc pl-5 leading-relaxed marker:text-cyan-300/70">
                        {guide.howToPlay.map((item, idx) => (
                          <motion.li key={idx} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>{item}</motion.li>
                        ))}
                      </ul>
                    </>
                  )}

                  {activePanel === 'impact' && (
                    <>
                      <div className="text-xs uppercase tracking-[0.12em] text-cyan-300/95 mb-3 font-semibold">Real-Life Effects</div>
                      <ul className="space-y-2.5 text-[15px] text-white/95 list-disc pl-5 leading-relaxed marker:text-cyan-300/70">
                        {guide.realWorldImpact.map((item, idx) => (
                          <motion.li key={idx} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>{item}</motion.li>
                        ))}
                      </ul>
                    </>
                  )}

                  {activePanel === 'read' && (
                    <>
                      <div className="text-xs uppercase tracking-[0.12em] text-amber-300/95 mb-3 font-semibold">Read Before You Play</div>
                      <ul className="space-y-2.5 text-[15px] text-white/95 list-disc pl-5 mb-4 leading-relaxed marker:text-amber-300/70">
                        {guide.whyItMatters.map((item, idx) => (
                          <motion.li key={idx} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>{item}</motion.li>
                        ))}
                      </ul>
                      <div className="text-xs uppercase tracking-[0.12em] text-amber-300/95 mb-3 font-semibold">Action Checklist</div>
                      <div className="space-y-2 mb-4">
                        {guide.actionChecklist.map((item, idx) => {
                          const checked = !!checkedActions[idx];
                          return (
                            <motion.button
                              key={idx}
                              type="button"
                              onClick={() => toggleAction(idx)}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full text-left rounded-lg px-3 py-2 border transition-all duration-200 ${
                              checked
                                ? 'bg-emerald-400/25 border-emerald-200/50 text-emerald-50 shadow-md shadow-emerald-500/15'
                                : 'bg-white/10 border-white/20 text-white/92 hover:bg-white/15 hover:border-white/35'
                            }`}
                          >
                            <span className="text-xs mr-2">{checked ? '✅' : '⬜'}</span>
                            <span className="text-[14px] leading-relaxed">{item}</span>
                          </motion.button>
                        );
                      })}
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.1em] text-white/75 mb-2 font-semibold">Readiness</div>
                        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/15">
                          <motion.div className="h-full bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300" style={{ width: `${readProgress}%` }} transition={{ duration: 0.6, ease: "easeOut" }}></motion.div>
                        </div>
                        <div className="text-xs text-white/75 mt-2">{readProgress}% checklist completed</div>
                      </div>
                    </>
                  )}

                  {activePanel === 'learn' && (
                    <>
                      <div className="text-xs uppercase tracking-[0.12em] text-emerald-300/95 mb-3 font-semibold">Continue In Learn Section</div>
                      <p className="text-[15px] text-white/95 mb-2">Best next module:</p>
                      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="mb-4 inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-100 shadow-lg shadow-emerald-500/10">
                        ✨ {guide.learnModule}
                      </motion.div>
                      <p className="text-[15px] text-white/95 mb-3">Recommended lessons:</p>
                      <div className="flex flex-wrap gap-2.5 mb-4">
                        {guide.learnLessons.map((lesson, idx) => (
                          <motion.span key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.08 }} className="px-3 py-1.5 rounded-full text-xs border border-emerald-300/35 bg-emerald-400/15 text-emerald-100 font-medium shadow-md shadow-emerald-500/10">
                            {lesson}
                          </motion.span>
                        ))}
                      </div>
                      <ul className="mb-4 space-y-2.5 text-[15px] text-white/95 list-disc pl-5 leading-relaxed marker:text-emerald-300/70">
                        {guide.learnOutcomes.map((item, idx) => (
                          <motion.li key={idx} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>{item}</motion.li>
                        ))}
                      </ul>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => {
                            const params = new URLSearchParams({
                              module: guide.learnModuleId,
                              lessons: guide.learnLessonIds.join(','),
                            });
                            onNavigate?.(`/learn?${params.toString()}`);
                          }}
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-0 font-semibold shadow-lg shadow-emerald-500/30"
                        >
                          🎓 Open Learn: {guide.learnModule}
                        </Button>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : null}

          <motion.div className="mt-6 flex flex-wrap items-center justify-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => onNavigate?.('/games')}
                variant="secondary"
                className="bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-sm transition-all"
              >
                ← Back to Games
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                onClick={() => {
                  window.open(gameUrl, '_blank', 'noopener,noreferrer');
                  setLaunched(true);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-base sm:text-lg px-8 py-5 rounded-lg shadow-2xl shadow-green-600/40 border-0 font-bold transition-all"
              >
                ▶ {openButtonLabel}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (completionState === 'success') {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-4 text-center text-white relative overflow-hidden">
        <Confetti />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="text-8xl relative z-10"
        >
          🎉
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            Level Complete!
          </h1>
          <p className="text-2xl text-white/90 mb-6">Awesome job protecting our planet!</p>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/40 rounded-2xl px-8 py-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-green-300">+{gamePoints} points</div>
              <div className="text-sm text-white/80 mt-2">Added to your account</div>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 mt-6"
        >
          <Button
            onClick={() => onNavigate?.('/games')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg px-8 py-6 rounded-lg font-bold shadow-2xl shadow-green-600/50 border-0 transition-all"
          >
            Continue to Games
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-4 text-center text-white">
      <div className="text-3xl">Game opened in a new tab.</div>
      <div className="text-sm text-white/70">Use the browser fullscreen button or press F11 for a true fullscreen view.</div>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleMarkComplete}
          disabled={completing}
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
        >
          {completing ? 'Completing...' : 'Mark Complete'}
        </Button>
        <Button
          onClick={() => window.open(gameUrl, '_blank', 'noopener,noreferrer')}
          disabled={completing}
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm disabled:opacity-50"
        >
          Open Again
        </Button>
      </div>
      {completionState === 'error' && (
        <div className="text-red-400 text-sm mt-4">Failed to mark completion. Please try again.</div>
      )}
    </div>
  );
}

export default function GamePlayPage() {
  const [, params] = useRoute("/games/play/:id");
  const gameId = params?.id || "";
  const { username } = useAuth();
  const [, navigate] = useLocation();
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [catalog, setCatalog] = useState(() => GAMES);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/games');
        const json = await res.json();
        if (active) setCatalog(mergeGamesCatalog(Array.isArray(json) ? json : []));
      } catch {
        if (active) setCatalog(GAMES);
      } finally {
        if (active) setCatalogLoaded(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const game = getGameById(gameId, catalog.filter((item) => !GAMES.some((builtin) => builtin.id === item.id)));

  useEffect(() => {
    if (catalogLoaded && !game) {
      // unknown id -> back to catalog
      navigate('/games');
    }
  }, [catalogLoaded, game, navigate]);

  const onCompleted = async () => {
    if (!game || completed || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/student/games/${encodeURIComponent(game.id)}/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(username ? { 'x-username': username } : {}),
        },
        body: JSON.stringify({ points: game.points }),
      });
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const body = useMemo(() => {
    if (!catalogLoaded) {
      return <div className="text-sm text-earth-muted">Loading game...</div>;
    }

    if (!game) {
      return <div className="text-sm text-earth-muted">This game is coming soon.</div>;
    }

    if (game.externalUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <ExternalGameLoader 
            gameId={game.id}
            gameUrl={game.externalUrl}
            onComplete={onCompleted}
            onNavigate={navigate}
            gameIcon={game.icon}
            gameName={game.name}
            gameDescription={game.description}
            gamePoints={game.points}
          />
        </div>
      );
    }

    return <div className="text-sm text-earth-muted">This game is coming soon.</div>;
  }, [catalogLoaded, game, onCompleted, navigate]);

  return (
    <div className="relative min-h-screen w-screen text-white overflow-x-hidden overflow-y-auto bg-[#07111a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(52,211,153,0.16),transparent_32%),radial-gradient(circle_at_82%_4%,rgba(103,232,249,0.16),transparent_28%),linear-gradient(180deg,#0c1a24_0%,#08131d_48%,#070f18_100%)]"></div>
      <div className="pointer-events-none absolute left-[-9rem] top-10 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl"></div>
      <div className="pointer-events-none absolute right-[-10rem] top-[-3rem] h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl"></div>
      <Particles />
      <ParallaxBlobs />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-3 sm:px-5 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-100/90">Interactive Mission</span>
          {game?.difficulty && <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] text-white/80">Difficulty: {game.difficulty}</span>}
          {game?.points != null && <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] text-cyan-100/95">Reward: +{game.points} pts</span>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="rounded-3xl border border-white/15 bg-[#0b1e2b]/72 p-4 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          {body}
        </motion.div>
      </div>

      {/* Completion ribbon */}
      {completed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="px-6 py-3 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white shadow-xl border border-emerald-400/50">
            Completed! +{game?.points ?? 0} pts awarded.
          </div>
        </div>
      )}
    </div>
  );
}
