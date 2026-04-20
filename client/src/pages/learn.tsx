import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, BookOpen, Play, Sparkles, Trophy, Zap, Award, Flame, Target, Star, Type, Plus, Minus, Edit3, Trash2, Save, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { GAMES } from "@/lib/gamesCatalog";
import {
  ModuleDashboardSkeleton,
  LessonListSkeleton,
  LessonContentSkeleton,
  HeaderSkeleton,
  StatsCardSkeleton
} from "@/components/SkeletonLoaders";
import {
  loadProgress as loadLocalProgress,
  saveProgress as saveLocalProgress,
  checkAchievements,
  getUserAchievements,
  getProgressPercentage,
  UserProgress,
  Achievement
} from "@/lib/achievements";
import {
  AchievementToast,
  ProgressCircle,
  BadgeGrid
} from "@/components/AchievementBadges";

interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  points: number;
  content: string;
  quiz?: Quiz;
  completed?: boolean;
}

interface Quiz {
  questions: Question[];
}

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const MODULE_GAME_MAP: Record<string, string[]> = {
  "ecosystem-theory": ["seaverse", "sorting-stories-game", "eco-word-spell"],
  "energy-resources": ["badgas-hunter", "eco-arrow-harmony", "eco-balance-grid"],
  "ocean": ["seaverse", "sorting-stories-game"],
  "climate": ["badgas-hunter", "eco-arrow-harmony", "tsunami-expedition"],
  "water": ["eco-balance-grid", "sorting-stories-game"],
  "forest": ["eco-hit", "eco-shoot"],
  "wildlife": ["eco-shoot", "seaverse", "mineral-expedition"],
  "renewable": ["eco-arrow-harmony", "badgas-hunter", "eco-balance-grid"],
  "pollution": ["badgas-hunter", "sorting-stories-game"],
  "agriculture": ["eco-balance-grid", "eco-hit"],
  "eco-literacy": ["eco-word-spell", "environment-word-explorer"],
  "earth-resilience": ["tsunami-expedition", "mineral-expedition"],
};

const LESSON_GAME_MAP: Record<string, string[]> = {
  "ecosystem-theory:3": ["sorting-stories-game", "badgas-hunter"],
  "ecosystem-theory:5": ["eco-word-spell", "environment-word-explorer"],
  "energy-resources:2": ["eco-arrow-harmony", "eco-balance-grid"],
  "energy-resources:3": ["badgas-hunter"],
  "energy-resources:6": ["badgas-hunter", "eco-arrow-harmony", "eco-balance-grid"],
};

const initialModules: Module[] = [

/* =====================================================
   ENVIRONMENTAL HEALTH THEORY
===================================================== */

{
  id: "environmental-health",
  title: "Environmental Health Theory",
  description: "Core concepts, WHO definitions, and major health risks in the environment",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "What Environmental Health Means",
      duration: "14 minutes",
      points: 80,
      content: `
        <h2>What Environmental Health Means</h2>
        <p>Environmental health is the branch of public health that focuses on the natural and built environment and how it affects human health.</p>
        <p>It looks at physical, chemical, and biological factors outside the body that shape well-being, prevent disease, and support healthier communities.</p>
        <h3>Core Idea</h3>
        <p>Health is not only about personal choices. It is also shaped by air quality, water safety, housing, workspaces, sanitation, and the design of cities and neighborhoods.</p>
      `,
      quiz: {
        questions: [
          {
            question: "What is the primary focus of environmental health?",
            options: ["Genetics only", "External environmental factors affecting health", "Sports performance", "Surgical care"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "WHO Definitions and Disciplines",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>WHO Definitions and Disciplines</h2>
        <p>The World Health Organization defines environmental health as the assessment and control of physical, chemical, and biological factors that can affect health.</p>
        <p>This field is multidisciplinary and brings together environmental epidemiology, toxicology, exposure science, environmental engineering, and environmental law.</p>
        <ul>
          <li><strong>Environmental epidemiology:</strong> studies links between exposures and health outcomes.</li>
          <li><strong>Toxicology:</strong> studies how exposures can cause harm.</li>
          <li><strong>Exposure science:</strong> measures how and how much people are exposed.</li>
          <li><strong>Environmental engineering:</strong> designs protections for communities.</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Which discipline measures human exposure to contaminants?",
            options: ["Toxicology", "Environmental law", "Exposure science", "Epidemiology"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "3",
      title: "Children, Risks, and One Health",
      duration: "17 minutes",
      points: 90,
      content: `
        <h2>Children, Risks, and One Health</h2>
        <p>Children are especially vulnerable because their bodies are still developing and they often have higher exposure relative to body size.</p>
        <p>Modern concerns include air pollution, unsafe water, climate change, environmental racism, noise pollution, hazardous materials, and microplastic pollution.</p>
        <h3>One Health</h3>
        <p>One Health recognizes that human health, animal health, and ecosystem health are connected. This matters for food safety, zoonotic disease control, and long-term environmental resilience.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Why are children more vulnerable to environmental toxins?",
            options: ["They have fully developed organ systems", "They are less exposed than adults", "Their bodies are still developing", "They never interact with the environment"],
            correct: 2
          }
        ]
      }
    }
  ]
},

/* =====================================================
   0. ECOSYSTEM THEORY
===================================================== */

{
  id: "ecosystem-theory",
  title: "Ecosystem Theory",
  description: "Nature background, classification, threats, scientific depth, and interactive quiz",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Nature Background and Core Concepts",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>Nature Background</h2>
        <p>Discover the living world and explore how life connects, adapts, and thrives across Earths diverse landscapes, from the deepest oceans to the highest peaks.</p>
        <p>Every inch of our planet is alive. Even the smallest space belongs to an ecosystem.</p>
        <p>An ecosystem is more than just a place. It is a complex web of interactions between living organisms and their physical environment.</p>
        <p>From microscopic bacteria in a drop of water to vast rainforests, every element plays a role in the balance of life.</p>
        <h3>Core Ideas</h3>
        <ul>
          <li><strong>Biodiversity:</strong> Variety of life forms.</li>
          <li><strong>Interaction:</strong> Organisms and environment are linked by energy and nutrient flow.</li>
          <li><strong>Balance:</strong> Stability that supports long-term ecosystem health.</li>
        </ul>
        <h3>Definition</h3>
        <p>An ecosystem is a structural and functional unit of the biosphere made of living communities and non-living surroundings, connected through cycles and flows.</p>
        <h3>History</h3>
        <p>The term ecosystem was introduced by British botanist Arthur Tansley in 1935, highlighting that organisms and environment form one physical system.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Who coined the term ecosystem in 1935?",
            options: ["Rachel Carson", "Arthur Tansley", "Charles Darwin", "James Lovelock"],
            correct: 1
          },
          {
            question: "Ecosystem balance depends on interactions between:",
            options: ["Only animals", "Only plants", "Biotic and abiotic components", "Only climate"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "2",
      title: "Ecosystem Classification",
      duration: "14 minutes",
      points: 80,
      content: `
        <h2>Ecosystem Classification</h2>
        <p>Scientists classify ecosystems based on physical environment and dominant life forms.</p>
        <ul>
          <li><strong>Terrestrial:</strong> Land-based ecosystems where organisms interact with soil and atmosphere.</li>
          <li><strong>Aquatic:</strong> Water-based ecosystems that cover most of Earths surface.</li>
          <li><strong>Mixed:</strong> Transitional zones where land and water meet.</li>
          <li><strong>Artificial:</strong> Human-made ecosystems designed to support human activity.</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Which category includes wetlands and estuaries?",
            options: ["Terrestrial", "Mixed", "Artificial", "Desert-only"],
            correct: 1
          },
          {
            question: "Aquatic ecosystems cover approximately:",
            options: ["10%", "30%", "50%", "More than 70%"],
            correct: 3
          }
        ]
      }
    },
    {
      id: "3",
      title: "Ecosystems Under Pressure",
      duration: "15 minutes",
      points: 85,
      content: `
        <h2>The Warning Signs</h2>
        <p>Human activities are pushing ecosystems to their limits. Understanding threats is the first step toward conservation.</p>
        <ul>
          <li><strong>Climate Change:</strong> Rising temperature and shifting weather patterns disrupt habitats.</li>
          <li><strong>Deforestation:</strong> Large-scale clearing destroys habitat and biodiversity.</li>
          <li><strong>Pollution:</strong> Plastics, chemicals, and waste contaminate food chains.</li>
          <li><strong>Overexploitation:</strong> Unsustainable hunting and fishing deplete resources.</li>
        </ul>
        <p><em>We do not inherit the Earth from our ancestors, we borrow it from our children.</em></p>
      `,
      quiz: {
        questions: [
          {
            question: "Which is a direct ecosystem threat from human activity?",
            options: ["Nutrient recycling", "Overexploitation", "Photosynthesis", "Pollination"],
            correct: 1
          },
          {
            question: "Deforestation mainly causes:",
            options: ["Habitat loss", "More biodiversity", "Cleaner air everywhere", "Higher resilience instantly"],
            correct: 0
          }
        ]
      }
    },
    {
      id: "4",
      title: "Scientific Depth and Life Cycle",
      duration: "16 minutes",
      points: 90,
      content: `
        <h2>Scientific Depth</h2>
        <ul>
          <li><strong>Energy Flow:</strong> Energy enters as sunlight and moves from producers to consumers.</li>
          <li><strong>Nutrient Cycles:</strong> Carbon, nitrogen, and water are continuously recycled.</li>
          <li><strong>Food Webs:</strong> Feeding networks distribute energy and connect species.</li>
          <li><strong>Stability:</strong> Ability to maintain structure and function over time.</li>
        </ul>
        <h3>The Cycle of Life</h3>
        <p>Energy flows in one direction while matter is recycled continuously.</p>
        <ol>
          <li>Solar Energy Input</li>
          <li>Primary Production</li>
          <li>Consumer Interaction</li>
          <li>Decomposition</li>
        </ol>
        <p>Ecosystems maintain stability through <strong>resistance</strong> and <strong>resilience</strong>.</p>
      `,
      quiz: {
        questions: [
          {
            question: "In ecosystems, energy typically:",
            options: ["Cycles forever", "Flows one way", "Is not transferred", "Comes only from decomposers"],
            correct: 1
          },
          {
            question: "Resilience means:",
            options: ["Never changing", "Recovering after disturbance", "Avoiding all interactions", "Eliminating biodiversity"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "5",
      title: "Eco Quiz and Key Takeaways",
      duration: "20 minutes",
      points: 110,
      content: `
        <h2>Test Your Eco-Knowledge</h2>
        <p>This final lesson combines your requested theory summary and comprehensive quiz practice.</p>
        <h3>Key Takeaways</h3>
        <ul>
          <li>Ecosystems are complex systems of living and non-living components.</li>
          <li>Biodiversity is essential for resilience and long-term stability.</li>
          <li>Human activity is the primary modern threat to global ecosystems.</li>
          <li>Conservation actions at any scale can protect future generations.</li>
          <li>Understanding comes first, action follows.</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Which ecosystem is often called the lungs of the planet?",
            options: ["Deserts", "Tropical rainforests", "Grasslands", "Marine ecosystems"],
            correct: 1
          },
          {
            question: "Biodiversity is best defined as:",
            options: ["Only number of trees", "Variety of life", "Soil depth", "Only animal count"],
            correct: 1
          },
          {
            question: "A food web primarily shows:",
            options: ["Weather patterns", "Feeding relationships", "Ocean currents", "Rock cycles"],
            correct: 1
          },
          {
            question: "Which process recycles matter in ecosystems?",
            options: ["Decomposition", "Evaporation only", "Predation only", "Migration"],
            correct: 0
          },
          {
            question: "An abiotic factor is:",
            options: ["Fungi", "Insects", "Water pH", "Bacteria"],
            correct: 2
          },
          {
            question: "The main energy source for most ecosystems is:",
            options: ["Moonlight", "Sunlight", "Volcano heat", "Wind"],
            correct: 1
          },
          {
            question: "Overfishing is an example of:",
            options: ["Restoration", "Overexploitation", "Biodiversity gain", "Natural succession"],
            correct: 1
          },
          {
            question: "Mixed ecosystems occur where:",
            options: ["Only mountains exist", "Land and water interact", "No species live", "Only cities exist"],
            correct: 1
          },
          {
            question: "Deforestation most directly reduces:",
            options: ["Habitat availability", "Tidal range", "Solar radiation", "Mineral hardness"],
            correct: 0
          },
          {
            question: "Ecosystem resistance means:",
            options: ["Ability to avoid sunlight", "Ability to remain unchanged during disturbance", "Ability to migrate", "Ability to consume less energy"],
            correct: 1
          },
          {
            question: "Which is an artificial ecosystem?",
            options: ["Coral reef", "Urban park", "Wetland estuary", "Tundra"],
            correct: 1
          },
          {
            question: "Pollution can affect ecosystems by:",
            options: ["Improving all food chains", "Poisoning trophic levels", "Creating resilience automatically", "Eliminating decomposition"],
            correct: 1
          },
          {
            question: "Primary producers are important because they:",
            options: ["Generate initial biological energy input", "Destroy nutrients", "Consume all prey", "Stop cycling"],
            correct: 0
          },
          {
            question: "A key conservation message is:",
            options: ["Only governments can help", "Small actions do not matter", "Every meaningful action helps", "Ecosystems recover without limits"],
            correct: 2
          },
          {
            question: "Understanding ecosystem science helps us:",
            options: ["Ignore environmental issues", "Take informed protective action", "Eliminate biodiversity", "Stop nutrient cycling"],
            correct: 1
          }
        ]
      }
    }
  ]
},

/* =====================================================
   0.5 RENEWABLE VS NONRENEWABLE
===================================================== */

{
  id: "energy-resources",
  title: "Renewable vs Nonrenewable",
  description: "Interactive learning journey on energy resources, trade-offs, and sustainable choices",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Introduction: What Are Resources?",
      duration: "12 minutes",
      points: 70,
      content: `
        <h2>What Are Resources?</h2>
        <p>Everything we use to build, power, and sustain life comes from Earth. These are called resources.</p>
        <p>Some resources are replenished quickly by natural systems, while others take millions of years to form and can run out.</p>
        <p>Understanding this difference is essential for a sustainable future.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Resources are best described as:",
            options: ["Only fuels", "Materials and energy sources from Earth used by people", "Only water", "Only electricity"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "Renewable Resources and Replenishment",
      duration: "18 minutes",
      points: 90,
      content: `
        <h2>Renewable Resources</h2>
        <p>Renewable resources can be replenished naturally over relatively short periods of time if managed responsibly.</p>
        <ul>
          <li><strong>Solar:</strong> Energy captured from sunlight using solar panels.</li>
          <li><strong>Wind:</strong> Turbines convert moving air into electricity on land and offshore.</li>
          <li><strong>Hydro:</strong> Flowing water spins turbines to generate power.</li>
          <li><strong>Biomass:</strong> Organic material used as fuel when regrowth is balanced.</li>
          <li><strong>Geothermal:</strong> Heat from Earths interior used for continuous energy.</li>
        </ul>
        <h3>The Replenishment Cycle</h3>
        <p>Renewables work best when usage does not exceed natural replacement rates.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which of these is renewable?",
            options: ["Coal", "Solar", "Diesel", "Petroleum"],
            correct: 1
          },
          {
            question: "A key condition for renewable sustainability is:",
            options: ["Unlimited consumption", "Using it faster than it replenishes", "Using within natural replacement rates", "Ignoring local ecosystems"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "3",
      title: "Nonrenewable Resources and Depletion",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>Nonrenewable Resources</h2>
        <p>Nonrenewable resources exist in finite quantities and usually take millions of years to form.</p>
        <ul>
          <li><strong>Coal:</strong> Fossil fuel with high carbon and pollutant emissions.</li>
          <li><strong>Oil:</strong> Petroleum used for transport and heating, with spill and extraction risks.</li>
          <li><strong>Natural Gas:</strong> Cleaner-burning than coal, but still a fossil source.</li>
          <li><strong>Nuclear (Uranium):</strong> Low operational CO2, but radioactive waste challenges.</li>
        </ul>
        <h3>The Depletion Problem</h3>
        <p>Using nonrenewables reduces what remains available on Earth over time.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Nonrenewable resources are limited mainly because they:",
            options: ["Form quickly", "Are fully recycled by rainfall", "Take extremely long to form", "Can be grown each season"],
            correct: 2
          },
          {
            question: "Which option is a fossil fuel?",
            options: ["Wind", "Hydro", "Natural gas", "Geothermal"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "4",
      title: "Comparison and the Water Case",
      duration: "14 minutes",
      points: 80,
      content: `
        <h2>Side-by-Side Comparison</h2>
        <ul>
          <li><strong>Sustainability:</strong> Renewables replenish, nonrenewables deplete.</li>
          <li><strong>Pollution:</strong> Renewables are generally lower-emission in operation.</li>
          <li><strong>Cost:</strong> Renewables often have high setup and lower long-term operating costs.</li>
          <li><strong>Availability:</strong> Some renewables depend on weather and geography.</li>
        </ul>
        <h3>The Curious Case: Is Water Renewable?</h3>
        <p>Water is naturally renewed by the hydrologic cycle, but local shortages can still occur if use and pollution outpace restoration.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Why is water often considered renewable?",
            options: ["It is manufactured", "It is replaced through the water cycle", "It never gets polluted", "It needs no management"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "5",
      title: "Power Generation and Environmental Impact",
      duration: "17 minutes",
      points: 95,
      content: `
        <h2>Powering the World</h2>
        <p>Renewable systems capture natural forces, while many nonrenewable systems burn fuels to produce heat and electricity.</p>
        <ul>
          <li><strong>Renewable pathways:</strong> Solar, wind, and hydro convert natural flows into power.</li>
          <li><strong>Nonrenewable pathways:</strong> Coal, oil, and gas plants commonly burn fuels for steam-driven generation.</li>
        </ul>
        <h3>Environmental Impact</h3>
        <ul>
          <li>Fossil fuels increase air pollution and climate risk.</li>
          <li>Cleaner energy can reduce emissions and protect ecosystem health.</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "A major climate concern with fossil fuels is:",
            options: ["No byproducts", "CO2 emissions", "Zero extraction impact", "Infinite supply"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "6",
      title: "Reality Check, Trade-Offs, and Energy Expert Quiz",
      duration: "22 minutes",
      points: 120,
      content: `
        <h2>Reality Check</h2>
        <p>Renewable does not always mean impact-free. Energy systems involve trade-offs.</p>
        <ul>
          <li><strong>Manufacturing impact:</strong> Panels and turbines require materials and energy-intensive production.</li>
          <li><strong>Dams and ecosystems:</strong> Large hydropower projects can alter habitats and communities.</li>
          <li><strong>Biomass emissions:</strong> Combustion still emits CO2 and particulates if poorly managed.</li>
        </ul>
        <h3>Pros and Cons</h3>
        <p><strong>Renewables - Pros:</strong> Lower emissions, energy diversity, long-term availability, local jobs.</p>
        <p><strong>Renewables - Cons:</strong> Intermittency, storage cost, land use, higher upfront capital.</p>
        <p><strong>Nonrenewables - Pros:</strong> Dispatch reliability, high energy density, established systems.</p>
        <p><strong>Nonrenewables - Cons:</strong> Climate damage, finite reserves, pollution and ecosystem harm.</p>
        <h3>The Future Is in Your Hands</h3>
        <p>Daily choices matter: reduce waste, share knowledge, and support cleaner options whenever possible.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which of these is a renewable resource?",
            options: ["Coal", "Solar", "Natural gas", "Nuclear fuel"],
            correct: 1
          },
          {
            question: "Coal is considered:",
            options: ["Renewable", "Nonrenewable", "Carbon neutral", "Weather-dependent"],
            correct: 1
          },
          {
            question: "Wind energy primarily converts:",
            options: ["Chemical energy", "Kinetic energy", "Nuclear energy", "Geothermal magma"],
            correct: 1
          },
          {
            question: "Which source usually has lower operational emissions?",
            options: ["Oil", "Coal", "Solar", "Diesel"],
            correct: 2
          },
          {
            question: "A challenge with some renewable systems is:",
            options: ["Intermittency", "No infrastructure", "No maintenance", "Unlimited battery storage"],
            correct: 0
          },
          {
            question: "Natural gas is:",
            options: ["A renewable fuel", "A fossil fuel", "An ecosystem", "A battery technology"],
            correct: 1
          },
          {
            question: "Water can be stressed despite being renewable when:",
            options: ["Management is balanced", "Use and pollution exceed recovery", "Rain exists", "Rivers flow"],
            correct: 1
          },
          {
            question: "One benefit of renewable energy expansion is:",
            options: ["Increased smog by default", "Reduced dependence on fossil fuels", "Infinite storage solved", "No material needs"],
            correct: 1
          },
          {
            question: "A key nonrenewable drawback is:",
            options: ["Infinite supply", "Finite reserves", "No environmental impact", "Zero health effects"],
            correct: 1
          },
          {
            question: "A practical sustainability action is to:",
            options: ["Increase waste", "Ignore energy use", "Use energy mindfully", "Avoid all technology"],
            correct: 2
          }
        ]
      }
    }
  ]
},

/* =====================================================
   1️⃣ SAVE THE OCEAN
===================================================== */

{
  id: "ocean",
  title: "Save the Ocean",
  description: "Ocean conservation, coral ecosystems and marine sustainability",
  progress: 0,
  lessons: [

    {
      id: "1",
      title: "Coral Reef Ecosystems",
      duration: "18 minutes",
      points: 90,
      content: `
        <h2>Coral Reef Ecosystems</h2>
        <p>Coral reefs are marine ecosystems formed by colonies of coral polyps. They are called the rainforests of the sea because they support nearly 25% of marine life.</p>
        <ul>
          <li>Protect coastlines from storms</li>
          <li>Support fisheries</li>
          <li>Provide tourism revenue</li>
          <li>Source of marine medicine</li>
        </ul>
        <p>Coral bleaching occurs when ocean temperatures rise and corals expel symbiotic algae.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Coral bleaching is mainly caused by:",
            options: ["Oil spills", "Rising ocean temperatures", "Fishing nets", "Salt increase"],
            correct: 1
          },
          {
            question: "Coral reefs support approximately what percentage of marine life?",
            options: ["10%", "15%", "25%", "50%"],
            correct: 2
          }
        ]
      }
    },

    {
      id: "2",
      title: "Ocean Acidification",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>Ocean Acidification</h2>
        <p>Oceans absorb excess atmospheric CO₂. This forms carbonic acid, reducing pH levels and affecting shell-forming organisms.</p>
        <ul>
          <li>Weakens coral skeletons</li>
          <li>Affects shellfish</li>
          <li>Impacts marine food chain</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Ocean acidification is caused by:",
            options: ["Plastic waste", "CO₂ absorption", "Fishing", "Salt"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "3",
      title: "Marine Plastic Pollution",
      duration: "15 minutes",
      points: 80,
      content: `
        <h2>Marine Plastic Crisis</h2>
        <p>Over 8 million tons of plastic enter oceans annually. Microplastics accumulate in marine organisms.</p>
        <ul>
          <li>Harms marine animals</li>
          <li>Enters food chain</li>
          <li>Damages coral reefs</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Microplastics mainly come from:",
            options: ["Volcanoes", "Industrial rivers", "Solar panels", "Ice caps"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "4",
      title: "Sustainable Fisheries",
      duration: "17 minutes",
      points: 85,
      content: `
        <h2>Sustainable Fishing</h2>
        <p>Overfishing threatens fish populations. Sustainable fisheries ensure long-term availability of marine resources.</p>
        <ul>
          <li>Marine Protected Areas</li>
          <li>Catch limits</li>
          <li>Bycatch reduction</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Bycatch refers to:",
            options: ["Night fishing", "Accidental capture of non-target species", "Fishing license", "Illegal trade"],
            correct: 1
          }
        ]
      }
    }

  ]
},

/* =====================================================
   2️⃣ CLIMATE CHANGE
===================================================== */

{
  id: "climate",
  title: "Climate Change",
  description: "Global warming, mitigation and adaptation",
  progress: 0,
  lessons: [

    {
      id: "1",
      title: "Greenhouse Effect",
      duration: "20 minutes",
      points: 95,
      content: `
        <h2>Greenhouse Effect</h2>
        <p>Greenhouse gases trap heat in Earth's atmosphere. CO₂ and methane are major contributors.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which gas is a major greenhouse gas?",
            options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"],
            correct: 2
          }
        ]
      }
    },

    {
      id: "2",
      title: "Extreme Weather Events",
      duration: "18 minutes",
      points: 90,
      content: `
        <h2>Extreme Weather</h2>
        <p>Climate change increases floods, droughts, heatwaves, and cyclones.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Climate change increases frequency of:",
            options: ["Snowfall", "Extreme events", "Earthquakes", "Tides"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "3",
      title: "Carbon Footprint",
      duration: "15 minutes",
      points: 85,
      content: `
        <h2>Carbon Footprint</h2>
        <p>Carbon footprint measures total greenhouse gas emissions from human activities.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Transport contributes to:",
            options: ["Zero emissions", "Carbon footprint", "Water cycle", "Ozone hole"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "4",
      title: "Climate Solutions",
      duration: "20 minutes",
      points: 100,
      content: `
        <h2>Mitigation & Adaptation</h2>
        <p>Solutions include renewable energy, reforestation and carbon capture technologies.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Reforestation helps by:",
            options: ["Increasing CO₂", "Absorbing CO₂", "Melting ice", "Reducing rainfall"],
            correct: 1
          }
        ]
      }
    }

  ]
},

/* =====================================================
   3️⃣ WATER CONSERVATION
===================================================== */

{
  id: "water",
  title: "Water Conservation",
  description: "Water scarcity and sustainable management",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Global Water Scarcity",
      duration: "18 minutes",
      points: 85,
      content: `<h2>Water Scarcity</h2><p>Over 2 billion people lack safe drinking water.</p>`,
      quiz: {
        questions: [
          {
            question: "Water scarcity mainly occurs due to:",
            options: ["Population growth", "Ice caps", "Ozone", "Volcanoes"],
            correct: 0
          }
        ]
      }
    },
    {
      id: "2",
      title: "Rainwater Harvesting",
      duration: "15 minutes",
      points: 80,
      content: `<h2>Rainwater Harvesting</h2><p>Collecting rainwater for reuse reduces groundwater depletion.</p>`,
      quiz: {
        questions: [
          {
            question: "Rainwater harvesting helps in:",
            options: ["Wasting water", "Storing water", "Polluting rivers", "Melting glaciers"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "3",
      title: "Groundwater Depletion",
      duration: "16 minutes",
      points: 85,
      content: `<h2>Groundwater Depletion</h2><p>Excessive extraction lowers water table levels.</p>`,
      quiz: {
        questions: [
          {
            question: "Overuse of borewells leads to:",
            options: ["Higher water table", "Lower water table", "Rainfall", "Sea waves"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "4",
      title: "Wastewater Recycling",
      duration: "17 minutes",
      points: 90,
      content: `<h2>Water Recycling</h2><p>Treated wastewater can be reused for agriculture and industry.</p>`,
      quiz: {
        questions: [
          {
            question: "Recycled water is mainly used for:",
            options: ["Drinking directly", "Agriculture", "Burning fuel", "Mining"],
            correct: 1
          }
        ]
      }
    }
  ]
},

/* =====================================================
   4️⃣ FOREST CONSERVATION
===================================================== */

{
  id: "forest",
  title: "Save the Forests",
  description: "Deforestation and biodiversity protection",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Forests as Carbon Sinks",
      duration: "18 minutes",
      points: 90,
      content: `<h2>Carbon Sink</h2><p>Forests absorb carbon dioxide from atmosphere.</p>`,
      quiz: {
        questions: [
          {
            question: "Forests absorb:",
            options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "Deforestation Causes",
      duration: "16 minutes",
      points: 85,
      content: `<h2>Deforestation</h2><p>Main causes include agriculture and logging.</p>`,
      quiz: {
        questions: [
          {
            question: "Major cause of deforestation:",
            options: ["Fishing", "Agriculture", "Wind", "Snow"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "3",
      title: "Reforestation",
      duration: "17 minutes",
      points: 90,
      content: `<h2>Reforestation</h2><p>Planting trees restores ecosystem balance.</p>`,
      quiz: {
        questions: [
          {
            question: "Reforestation helps in:",
            options: ["Increasing pollution", "Restoring forests", "Melting ice", "None"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "4",
      title: "Forest Biodiversity",
      duration: "18 minutes",
      points: 95,
      content: `
        <h2>Biodiversity</h2>
        <p>Forests support millions of species.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Forests are home to:",
            options: ["Few species", "Millions of species", "No species", "Only birds"],
            correct: 1
          }
        ]
      }
    }
  ]
},

/* =====================================================
   BIOSPHERE
===================================================== */

{
  id: "biosphere",
  title: "BioSphere",
  description: "Biodiversity fundamentals, threats, and protection pathways",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "The Definition of Biodiversity",
      duration: "14 minutes",
      points: 80,
      content: `
        <h2>Life's Magnificent Complexity</h2>
        <p>Biodiversity means biological diversity: variation of life at genetic, species, and ecosystem levels.</p>
        <p>From soil microbes to blue whales, each living organism contributes to planetary stability and resilience.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Biodiversity refers to variation at which levels?",
            options: ["Only species", "Genetic, species, and ecosystem", "Only ecosystem", "Only genetic"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "The Three Pillars",
      duration: "15 minutes",
      points: 85,
      content: `
        <h2>The Three Pillars of Biodiversity</h2>
        <ul>
          <li><strong>Genetic diversity:</strong> variation within a species that supports adaptation.</li>
          <li><strong>Species diversity:</strong> the number and abundance of species in an area.</li>
          <li><strong>Ecosystem diversity:</strong> the variety of habitats and ecological processes.</li>
        </ul>
        <p>These three layers work together to make ecosystems more stable under stress.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which pillar focuses on variation within a species?",
            options: ["Species diversity", "Ecosystem diversity", "Genetic diversity", "Habitat diversity"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "3",
      title: "Hotspots, Services, and Human Health",
      duration: "16 minutes",
      points: 90,
      content: `
        <h2>Why Biodiversity Matters</h2>
        <p>Biodiversity hotspots like tropical forests and marine regions contain extraordinary life density and provide critical ecosystem services.</p>
        <ul>
          <li>Freshwater filtration and climate mitigation</li>
          <li>Pollination for food systems and agriculture</li>
          <li>Medical discovery pathways from natural compounds</li>
        </ul>
        <p>Human health, food security, and climate stability all depend on healthy biodiversity systems.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which is an ecosystem service provided by biodiversity?",
            options: ["Increased plastic waste", "Freshwater filtration", "Faster urban sprawl", "Airline fuel production"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "4",
      title: "The Great Decline and Protection Efforts",
      duration: "17 minutes",
      points: 95,
      content: `
        <h2>The Great Decline</h2>
        <p>Wildlife populations have declined sharply in recent decades due to habitat destruction, climate change, and overexploitation.</p>
        <p>Recovery is possible through habitat restoration, anti-poaching work, policy support, and community-led conservation.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which factor is a major driver of biodiversity decline?",
            options: ["Habitat destruction", "Rainfall variability only", "Ocean tides", "Moon phases"],
            correct: 0
          }
        ]
      }
    }
  ]
},

/* =====================================================
   POLLUTION: THE SILENT KILLER
===================================================== */

{
  id: "pollution-silent-killer",
  title: "Pollution: The Silent Killer",
  description: "Interactive pollution science, timeline of neglect, and restoration pathways",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Toxic Spectrum: Air, Water, Soil, Plastic",
      duration: "17 minutes",
      points: 90,
      content: `
        <h2>Toxic Spectrum</h2>
        <p>Pollution is a multi-front environmental crisis that affects air, water, soil, and marine systems at the same time.</p>
        <ul>
          <li><strong>Air pollution:</strong> harmful atmospheric substances linked to severe health effects.</li>
          <li><strong>Water pollution:</strong> contamination of rivers, lakes, and oceans by untreated waste and runoff.</li>
          <li><strong>Soil pollution:</strong> land degradation caused by toxic chemicals, salts, and pathogens.</li>
          <li><strong>Plastic crisis:</strong> persistent plastic fragments now spread across ecosystems.</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Which type of pollution directly contaminates atmospheric air?",
            options: ["Soil pollution", "Air pollution", "Light pollution", "Space debris"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "Impact Reality: Health and Global Statistics",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>Impact Reality</h2>
        <p>Pollution has measurable impacts on human survival and ecosystem stability.</p>
        <ul>
          <li>Air pollution contributes to millions of premature deaths each year.</li>
          <li>A large share of wastewater returns to the environment untreated.</li>
          <li>Extensive soil degradation is already affecting food systems.</li>
        </ul>
        <p>Data-backed awareness is necessary to design meaningful interventions.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Ocean dead zones are strongly linked to which pollution source?",
            options: ["Noise pollution", "Nitrate and phosphate runoff", "Light pollution", "Space junk"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "3",
      title: "Timeline of Neglect and Microplastic Colonization",
      duration: "18 minutes",
      points: 95,
      content: `
        <h2>The Timeline of Neglect</h2>
        <p>Since industrialization, pollution has accelerated from localized contamination to planetary-scale disruption.</p>
        <ul>
          <li><strong>1850:</strong> coal-driven industrial growth begins large-scale emissions.</li>
          <li><strong>1950:</strong> plastic production expands rapidly across global markets.</li>
          <li><strong>Today:</strong> microplastics are detected across oceans, mountains, and human tissues.</li>
        </ul>
        <p>Plastic has become embedded in food chains, making prevention and cleanup urgent priorities.</p>
      `,
      quiz: {
        questions: [
          {
            question: "What is a major current concern in the plastic crisis?",
            options: ["Plastics decompose in days", "Microplastics in ecosystems and humans", "No marine impact", "Only visual pollution"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "4",
      title: "The Path Back to Earth",
      duration: "15 minutes",
      points: 90,
      content: `
        <h2>Restoration Pathways</h2>
        <p>Pollution is human-made, and restoration is also a human choice.</p>
        <ul>
          <li>Reforestation and ecosystem recovery</li>
          <li>Circular economy and waste redesign</li>
          <li>Green energy transition</li>
          <li>Strict regulation and accountability</li>
        </ul>
        <p>Collective action now can significantly reduce long-term ecological damage.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which strategy supports long-term pollution reduction?",
            options: ["Linear take-make-waste model", "Circular economy practices", "Unregulated dumping", "Expanded fossil dependence"],
            correct: 1
          }
        ]
      }
    }
  ]
},

/* =====================================================
   ECOLEARN: ENVIRONMENTAL EDUCATION
===================================================== */

{
  id: "ecolearn-environmental-education",
  title: "EcoLearn: Environmental Education",
  description: "Interdisciplinary foundations, global frameworks, and future pathways in environmental education",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Introduction to Environmental Education",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>Introduction to Environmental Education</h2>
        <p>Environmental Education (EE) teaches how natural systems function and how people can live sustainably through informed choices.</p>
        <p>It combines environmental understanding with real-world problem-solving and responsible action.</p>
        <p>EE is not only about facts; it builds ecological awareness, stewardship, and long-term thinking.</p>
      `,
      quiz: {
        questions: [
          {
            question: "What is the primary goal of Environmental Education?",
            options: ["To memorize facts only", "To develop problem-solving and sustainable action", "To increase resource extraction", "To avoid community engagement"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "UNESCO Foundations and Global Awareness",
      duration: "17 minutes",
      points: 90,
      content: `
        <h2>UNESCO and Environmental Awareness</h2>
        <p>UNESCO helped establish foundational EE frameworks through key milestones such as the Belgrade Charter and Tbilisi Declaration.</p>
        <p>These frameworks expanded EE from nature study to social, economic, and policy dimensions of sustainability.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which 1975 document shaped early international EE frameworks?",
            options: ["Belgrade Charter", "Paris Agreement", "Geneva Convention", "Kyoto Protocol"],
            correct: 0
          }
        ]
      }
    },
    {
      id: "3",
      title: "Core Focus and Attributes",
      duration: "18 minutes",
      points: 95,
      content: `
        <h2>Focus and Attributes of EE</h2>
        <p>Environmental Education builds awareness, knowledge, values, skills, and participation.</p>
        <ul>
          <li>Interdisciplinary and systems-oriented learning</li>
          <li>Holistic understanding of natural and social environments</li>
          <li>Lifelong learning from early education to adulthood</li>
        </ul>
        <p>Its purpose is to move learners from understanding to action.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which EE pillar connects motivation to action?",
            options: ["Awareness", "Knowledge", "Attitude", "Attendance"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "4",
      title: "Curriculum, Activities, and Careers",
      duration: "18 minutes",
      points: 95,
      content: `
        <h2>Curriculum, Activities, and Careers</h2>
        <p>EE works best when integrated across subjects and reinforced by practical activities such as school energy audits, recycling programs, and outdoor observation.</p>
        <p>Career pathways include sustainability consulting, policy analysis, conservation science, environmental education, and renewable energy roles.</p>
      `,
      quiz: {
        questions: [
          {
            question: "What does the curriculum infusion model do?",
            options: ["Teaches EE in one annual class only", "Integrates EE across multiple subjects", "Removes geography and science", "Focuses only on exams"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "5",
      title: "Obstacles, Movement, and Future Trends",
      duration: "19 minutes",
      points: 100,
      content: `
        <h2>Obstacles and Emerging Trends</h2>
        <p>EE faces barriers such as limited funding, testing pressure, political sensitivity, and reduced connection with nature.</p>
        <p>At the same time, trends like gamification, systems thinking, emotional climate literacy, and youth movements are reshaping how people learn and act.</p>
        <p>A strong EE future depends on inclusive access, local relevance, and global collaboration.</p>
      `,
      quiz: {
        questions: [
          {
            question: "How is gamification used in Environmental Education?",
            options: ["To discourage action", "To simulate challenges and reward sustainable behavior", "To remove all teachers", "To avoid real-world learning"],
            correct: 1
          }
        ]
      }
    }
  ]
},

/* =====================================================
   EARTHPULSE: ENVIRONMENT AND HUMANITY
===================================================== */

{
  id: "earthpulse-environment-human",
  title: "EarthPulse: Environment and Humanity",
  description: "Population growth, climate pressure, and pathways toward planetary balance",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "A Growing Planet",
      duration: "14 minutes",
      points: 80,
      content: `
        <h2>Chapter 1: A Growing Planet</h2>
        <p>In 1800, the global population was about 1 billion. Today, humanity has crossed 8 billion.</p>
        <p>Rapid growth has increased pressure on land, water, food systems, and energy infrastructure.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Roughly how many humans live on Earth today?",
            options: ["2 billion", "4 billion", "8 billion+", "12 billion"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "2",
      title: "Population Explosion",
      duration: "15 minutes",
      points: 85,
      content: `
        <h2>Chapter 2: Population Explosion</h2>
        <p>Uncontrolled growth intensifies resource depletion, unemployment, pollution, and forest destruction.</p>
        <p>Environmental stress rises when consumption and population pressure outpace regeneration.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which is a direct effect of population explosion?",
            options: ["Resource depletion", "Reduced demand on ecosystems", "Lower pollution everywhere", "Automatic forest recovery"],
            correct: 0
          }
        ]
      }
    },
    {
      id: "3",
      title: "Climate Change: The Thermal Cost",
      duration: "16 minutes",
      points: 90,
      content: `
        <h2>Chapter 3: Climate Change</h2>
        <p>Higher human demand often drives fossil fuel use, increasing atmospheric CO2 and warming.</p>
        <p>Climate action requires both cleaner energy systems and more sustainable lifestyles.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which chain best describes the climate pressure pathway?",
            options: ["Human demand -> fossil fuel -> CO2 -> warming", "Rainfall -> forests -> cooling", "Oceans -> mountains -> growth", "Population -> less energy use"],
            correct: 0
          }
        ]
      }
    },
    {
      id: "4",
      title: "The Vicious Cycle",
      duration: "15 minutes",
      points: 90,
      content: `
        <h2>Chapter 4: The Vicious Cycle</h2>
        <p>Population pressure, poverty, and environmental degradation can reinforce one another.</p>
        <p>Breaking this loop requires policy support, education, livelihood security, and ecosystem protection.</p>
      `,
      quiz: {
        questions: [
          {
            question: "What best describes the poverty-environment trap?",
            options: ["A self-reinforcing cycle of degradation and hardship", "A short-term weather event", "A temporary migration pattern", "A productivity boost"],
            correct: 0
          }
        ]
      }
    },
    {
      id: "5",
      title: "Real Impact",
      duration: "16 minutes",
      points: 95,
      content: `
        <h2>Chapter 5: Real Impact</h2>
        <p>Food insecurity and biodiversity loss are visible indicators of environmental imbalance.</p>
        <p>Species extinction rates and social vulnerability highlight the urgency of systemic action.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which is a clear sign of environmental stress?",
            options: ["Stable ecosystems with rising biodiversity", "Widespread food insecurity", "Universal forest expansion", "Zero pollution"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "6",
      title: "The Path Forward",
      duration: "17 minutes",
      points: 100,
      content: `
        <h2>Chapter 6: The Path Forward</h2>
        <p>Technology helps, but sustainable outcomes also depend on behavior, awareness, and resource governance.</p>
        <ul>
          <li>Population awareness and informed planning</li>
          <li>Smart resource management</li>
          <li>Cleaner production and consumption patterns</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "What is most essential for long-term sustainability?",
            options: ["Technology alone", "Lifestyle and system-level change", "Higher waste output", "Ignoring population dynamics"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "7",
      title: "Final Thought and Knowledge Check",
      duration: "18 minutes",
      points: 110,
      content: `
        <h2>Chapter 7: Our Final Thought</h2>
        <p>The Earth can sustain life, but future balance depends on choices made now.</p>
        <p>This final chapter combines reflection with cause-effect thinking and a short mastery quiz.</p>
      `,
      quiz: {
        questions: [
          {
            question: "What is the primary cause of modern environmental degradation?",
            options: ["Natural cycles only", "Human activities and population growth", "Animal migration", "Meteorites"],
            correct: 1
          },
          {
            question: "Which pairing is most accurate?",
            options: ["Fossil fuel expansion -> lower warming", "Unchecked growth -> higher resource stress", "Deforestation -> immediate biodiversity gain", "Overconsumption -> reduced waste"],
            correct: 1
          },
          {
            question: "A practical path to reduce degradation is:",
            options: ["Delay all policy action", "Smart resource management and awareness", "Expand pollution", "Ignore data trends"],
            correct: 1
          }
        ]
      }
    }
  ]
},

/* =====================================================
   YOU CAN DUPLICATE THIS STRUCTURE FOR:
   - Wildlife Protection
   - Renewable Energy
   - Pollution Control
   - Sustainable Agriculture
   - Sustainable Cities
   - Energy Efficiency
   - Arctic Conservation
   - Global Environmental Policies
===================================================== */

/* =====================================================
  5️⃣ WILDLIFE PROTECTION
===================================================== */

{
  id: "wildlife",
  title: "Protect Wildlife",
  description: "Endangered species and habitat conservation",
  progress: 0,
  lessons: [

    {
      id: "1",
      title: "Endangered Species",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>Endangered Species</h2>
        <p>Over 1 million species face extinction due to human activities.</p>
        <ul>
          <li>Habitat destruction</li>
          <li>Climate change</li>
          <li>Poaching</li>
        </ul>
      `,
      quiz: {
        questions: [
          {
            question: "Main cause of species extinction?",
            options: ["Rainfall", "Habitat destruction", "Sunlight", "Wind"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "2",
      title: "Illegal Wildlife Trade",
      duration: "15 minutes",
      points: 80,
      content: `
        <h2>Wildlife Trafficking</h2>
        <p>Illegal trade threatens elephants, tigers and rhinos.</p>
      `,
      quiz: {
        questions: [
          {
            question: "CITES regulates:",
            options: ["Ocean fishing", "Wildlife trade", "Solar energy", "Water supply"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "3",
      title: "Habitat Fragmentation",
      duration: "18 minutes",
      points: 90,
      content: `
        <h2>Habitat Fragmentation</h2>
        <p>Urbanization divides ecosystems, isolating species.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Habitat fragmentation is caused by:",
            options: ["Urbanization", "Clouds", "Rivers", "Ice caps"],
            correct: 0
          }
        ]
      }
    },

    {
      id: "4",
      title: "Conservation Strategies",
      duration: "20 minutes",
      points: 95,
      content: `
        <h2>Wildlife Conservation</h2>
        <p>Protected areas, breeding programs and laws help conserve species.</p>
      `,
      quiz: {
        questions: [
          {
            question: "National parks are created to:",
            options: ["Increase pollution", "Protect biodiversity", "Build cities", "Mining"],
            correct: 1
          }
        ]
      }
    }

  ]
},

/* =====================================================
   6️⃣ RENEWABLE ENERGY
===================================================== */

{
  id: "renewable",
  title: "Renewable Energy",
  description: "Clean energy technologies and transition",
  progress: 0,
  lessons: [

    {
      id: "1",
      title: "Solar Energy",
      duration: "18 minutes",
      points: 90,
      content: `
        <h2>Solar Power</h2>
        <p>Solar panels convert sunlight into electricity using photovoltaic cells.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Solar panels convert sunlight into:",
            options: ["Heat only", "Electricity", "Water", "Wind"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "2",
      title: "Wind Energy",
      duration: "17 minutes",
      points: 85,
      content: `<h2>Wind Turbines</h2><p>Wind turbines convert kinetic energy into electricity.</p>`,
      quiz: {
        questions: [
          {
            question: "Wind energy uses:",
            options: ["Kinetic energy", "Coal", "Gas", "Oil"],
            correct: 0
          }
        ]
      }
    },

    {
      id: "3",
      title: "Hydropower",
      duration: "16 minutes",
      points: 85,
      content: `<h2>Hydropower</h2><p>Flowing water spins turbines to generate power.</p>`,
      quiz: {
        questions: [
          {
            question: "Hydropower depends on:",
            options: ["Wind", "Sunlight", "Flowing water", "Sand"],
            correct: 2
          }
        ]
      }
    },

    {
      id: "4",
      title: "Bioenergy",
      duration: "18 minutes",
      points: 90,
      content: `<h2>Bioenergy</h2><p>Organic materials like biomass produce renewable energy.</p>`,
      quiz: {
        questions: [
          {
            question: "Biomass comes from:",
            options: ["Fossil fuels", "Organic matter", "Plastic", "Iron"],
            correct: 1
          }
        ]
      }
    }

  ]
},

/* =====================================================
   7️⃣ POLLUTION CONTROL
===================================================== */

{
  id: "pollution",
  title: "Stop Pollution",
  description: "Air, water and soil pollution solutions",
  progress: 0,
  lessons: [

    {
      id: "1",
      title: "Air Pollution",
      duration: "16 minutes",
      points: 85,
      content: `<h2>Air Pollution</h2><p>PM2.5 particles cause respiratory diseases.</p>`,
      quiz: {
        questions: [
          {
            question: "PM2.5 mainly affects:",
            options: ["Skin", "Lungs", "Hair", "Eyes"],
            correct: 1
          }
        ]
      }
    },

    {
      id: "2",
      title: "Water Pollution",
      duration: "15 minutes",
      points: 80,
      content: `<h2>Water Pollution</h2><p>Industrial waste contaminates water bodies.</p>`,
      quiz: {
        questions: [
          {
            question: "Water pollution harms:",
            options: ["Marine life", "Mountains", "Clouds", "Stars"],
            correct: 0
          }
        ]
      }
    },

    {
      id: "3",
      title: "Soil Pollution",
      duration: "17 minutes",
      points: 85,
      content: `<h2>Soil Pollution</h2><p>Pesticides degrade soil quality.</p>`,
      quiz: {
        questions: [
          {
            question: "Excess pesticides affect:",
            options: ["Soil health", "Wind speed", "Rainfall", "Ice caps"],
            correct: 0
          }
        ]
      }
    },

    {
      id: "4",
      title: "Waste Management",
      duration: "18 minutes",
      points: 90,
      content: `<h2>Waste Management</h2><p>Recycling reduces landfill waste.</p>`,
      quiz: {
        questions: [
          {
            question: "Recycling helps by:",
            options: ["Increasing waste", "Reducing landfill", "Burning forests", "None"],
            correct: 1
          }
        ]
      }
    }

  ]
},

/* =====================================================
   8️⃣ SUSTAINABLE AGRICULTURE
===================================================== */

{
  id: "agriculture",
  title: "Sustainable Agriculture",
  description: "Eco-friendly farming practices",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Organic Farming",
      duration: "16 minutes",
      points: 85,
      content: `<h2>Organic Farming</h2><p>Uses natural fertilizers instead of chemicals.</p>`,
      quiz: {
        questions: [
          {
            question: "Organic farming avoids:",
            options: ["Natural manure", "Chemical fertilizers", "Water", "Sunlight"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "Soil Health",
      duration: "15 minutes",
      points: 80,
      content: `<h2>Soil Health</h2><p>Healthy soil ensures sustainable food production.</p>`,
      quiz: {
        questions: [
          {
            question: "Healthy soil improves:",
            options: ["Crop yield", "Pollution", "Plastic waste", "None"],
            correct: 0
          }
        ]
      }
    },
    {
      id: "3",
      title: "Sustainable Irrigation",
      duration: "17 minutes",
      points: 85,
      content: `<h2>Drip Irrigation</h2><p>Efficient water use reduces waste.</p>`,
      quiz: {
        questions: [
          {
            question: "Drip irrigation saves:",
            options: ["Fuel", "Water", "Plastic", "Soil"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "4",
      title: "Crop Rotation",
      duration: "18 minutes",
      points: 90,
      content: `<h2>Crop Rotation</h2><p>Rotating crops improves soil fertility.</p>`,
      quiz: {
        questions: [
          {
            question: "Crop rotation helps prevent:",
            options: ["Soil depletion", "Rainfall", "Wind", "Oceans"],
            correct: 0
          }
        ]
      }
    }
  ]
},

/* =====================================================
   9️⃣ ENVIRONMENTAL LITERACY
===================================================== */

{
  id: "eco-literacy",
  title: "Environmental Literacy",
  description: "Eco vocabulary, interpretation, and communication skills",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Core Sustainability Terms",
      duration: "15 minutes",
      points: 80,
      content: `
        <h2>Core Sustainability Terms</h2>
        <p>Environmental literacy starts with language. Key terms such as <strong>mitigation</strong>, <strong>adaptation</strong>, <strong>biodiversity</strong>, <strong>circular economy</strong>, and <strong>net-zero</strong> appear across policy documents, school topics, and media reports.</p>
        <ul>
          <li><strong>Mitigation:</strong> Actions that reduce greenhouse gas emissions.</li>
          <li><strong>Adaptation:</strong> Adjustments that reduce climate damage.</li>
          <li><strong>Biodiversity:</strong> Variety of life that keeps ecosystems resilient.</li>
          <li><strong>Circular economy:</strong> Reduce, reuse, repair, recycle to minimize waste.</li>
          <li><strong>Net-zero:</strong> Balance between emitted and removed greenhouse gases.</li>
        </ul>
        <p>When these terms are understood correctly, environmental conversations become clearer and action plans become more practical.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Net-zero means:",
            options: ["No industry", "Balancing emitted and removed greenhouse gases", "Zero water use", "Stopping all transport"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "Reading Environmental Data",
      duration: "16 minutes",
      points: 85,
      content: `
        <h2>Reading Environmental Data</h2>
        <p>Data tells the real story behind environmental change. Learn to read simple charts, pollution indexes, and trend lines so you can identify what is improving and what is getting worse.</p>
        <ul>
          <li>Check the <strong>time scale</strong>: short-term changes can be misleading.</li>
          <li>Look for <strong>trend direction</strong>: steady increase or decrease matters more than one-day spikes.</li>
          <li>Compare with a <strong>baseline</strong>: current values are meaningful only with reference points.</li>
          <li>Ask what the metric represents: emissions, concentration, exposure, or impact.</li>
        </ul>
        <p>Reading data well helps you make evidence-based choices instead of reacting to headlines alone.</p>
      `,
      quiz: {
        questions: [
          {
            question: "A rising emissions trend usually indicates:",
            options: ["Lower climate risk", "Increased climate pressure", "More biodiversity", "Improved air quality"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "3",
      title: "From Terms to Action",
      duration: "14 minutes",
      points: 80,
      content: `
        <h2>From Terms to Action</h2>
        <p>Knowing terms is useful only when they influence behavior. This lesson connects concepts to daily routines in homes, classrooms, and local communities.</p>
        <ul>
          <li>Convert <strong>carbon footprint</strong> knowledge into transport and energy-saving decisions.</li>
          <li>Use <strong>circular economy</strong> ideas for repair and reuse before buying new items.</li>
          <li>Apply <strong>biodiversity</strong> awareness through local habitat-friendly choices.</li>
          <li>Turn goals into measurable habits, such as weekly waste and power reduction targets.</li>
        </ul>
        <p>Action-oriented literacy bridges the gap between understanding and real environmental outcomes.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Which is an action-oriented sustainability choice?",
            options: ["Ignoring waste labels", "Sorting waste correctly", "Keeping lights on always", "Overusing water"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "4",
      title: "Communicating Eco Ideas Clearly",
      duration: "17 minutes",
      points: 90,
      content: `
        <h2>Communicating Eco Ideas Clearly</h2>
        <p>Strong eco communication is clear, evidence-based, and audience-friendly. Whether in class presentations or community talks, your goal is understanding, not jargon.</p>
        <ul>
          <li>Start with one clear problem statement.</li>
          <li>Use one or two supporting facts from trustworthy data.</li>
          <li>Offer realistic actions people can take immediately.</li>
          <li>Avoid fear-only language; combine urgency with practical solutions.</li>
        </ul>
        <p>Good communication builds trust and helps teams move from awareness to collective action.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Good eco communication should be:",
            options: ["Vague", "Evidence-based and clear", "Overly technical only", "Fear-only messaging"],
            correct: 1
          }
        ]
      }
    }
  ]
},

/* =====================================================
   1️⃣0️⃣ EARTH SCIENCE AND RESILIENCE
===================================================== */

{
  id: "earth-resilience",
  title: "Earth Science and Resilience",
  description: "Natural hazards, mineral resources, and community preparedness",
  progress: 0,
  lessons: [
    {
      id: "1",
      title: "Tsunamis and Coastal Hazards",
      duration: "18 minutes",
      points: 90,
      content: `
        <h2>Tsunamis and Coastal Hazards</h2>
        <p>A tsunami is a series of large ocean waves usually triggered by underwater earthquakes, volcanic eruptions, or landslides. These waves can travel quickly across ocean basins and become dangerous near coastlines.</p>
        <ul>
          <li>Strong undersea earthquakes can displace large volumes of water.</li>
          <li>Coastal communities are most exposed because the wave energy rises in shallow water.</li>
          <li>Early warning systems and fast evacuation reduce harm.</li>
        </ul>
        <p>Understanding how tsunamis work is part of hazard literacy and helps communities prepare before an emergency happens.</p>
      `,
      quiz: {
        questions: [
          {
            question: "A tsunami is most often caused by:",
            options: ["Wind patterns", "Underwater earthquakes", "Daily tides", "Cloud cover"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "2",
      title: "Warning Signs and Evacuation",
      duration: "17 minutes",
      points: 85,
      content: `
        <h2>Warning Signs and Evacuation</h2>
        <p>People near the coast should know the warning signs of a tsunami: strong shaking, a loud ocean roar, sudden sea retreat, or an official alert. Immediate evacuation to higher ground is the safest action.</p>
        <ul>
          <li>Do not wait for visual confirmation if an official alert is issued.</li>
          <li>Move inland or uphill as quickly as possible.</li>
          <li>Follow local emergency instructions and stay away from shorelines until the all-clear.</li>
        </ul>
        <p>Preparedness turns uncertainty into action and can make the difference between danger and safety.</p>
      `,
      quiz: {
        questions: [
          {
            question: "The safest first response to a tsunami warning is to:",
            options: ["Go to the beach", "Wait and watch the waves", "Evacuate to higher ground", "Use a boat immediately"],
            correct: 2
          }
        ]
      }
    },
    {
      id: "3",
      title: "Rocks, Minerals, and the Resource Cycle",
      duration: "16 minutes",
      points: 80,
      content: `
        <h2>Rocks, Minerals, and the Resource Cycle</h2>
        <p>Minerals are naturally occurring substances found in rocks and soils. They are used in construction, electronics, tools, and everyday materials. Because demand is high, resource use must be managed carefully.</p>
        <ul>
          <li>Some minerals are essential for batteries, phones, and renewable energy technology.</li>
          <li>Extraction affects land, water, and local ecosystems.</li>
          <li>Reuse and recycling reduce pressure on mining and supply chains.</li>
        </ul>
        <p>Learning the resource cycle helps us think beyond the product to the environmental cost of obtaining it.</p>
      `,
      quiz: {
        questions: [
          {
            question: "Why is recycling important for minerals?",
            options: ["It increases waste", "It reduces extraction pressure", "It stops all mining forever", "It creates tsunamis"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "4",
      title: "Responsible Mining and Restoration",
      duration: "18 minutes",
      points: 90,
      content: `
        <h2>Responsible Mining and Restoration</h2>
        <p>Mining can support jobs and technology, but it should be done with strong environmental controls. Responsible mining limits pollution, protects water, and restores land after extraction.</p>
        <ul>
          <li>Use environmental impact assessments before large projects.</li>
          <li>Rehabilitate sites after mining to support soil and habitat recovery.</li>
          <li>Support recycling systems that recover metals from e-waste.</li>
        </ul>
        <p>Good resource management balances human need with long-term ecosystem health.</p>
      `,
      quiz: {
        questions: [
          {
            question: "A key part of responsible mining is:",
            options: ["Ignoring land damage", "Restoring the site after extraction", "Using more waste", "Avoiding all planning"],
            correct: 1
          }
        ]
      }
    }
  ]
}

];

type ManagedModuleApi = {
  id: string;
  title: string;
  description?: string;
  lessons?: Array<{
    id?: string;
    title?: string;
    duration?: string;
    points?: number;
    content?: string;
  }>;
  deleted?: boolean;
};

const cloneQuiz = (quiz?: Quiz): Quiz | undefined => {
  if (!quiz) return undefined;
  return {
    questions: quiz.questions.map((q) => ({
      question: q.question,
      options: [...q.options],
      correct: q.correct,
    })),
  };
};

const cloneLesson = (lesson: Lesson): Lesson => ({
  id: lesson.id,
  title: lesson.title,
  duration: lesson.duration,
  points: lesson.points,
  content: lesson.content,
  quiz: cloneQuiz(lesson.quiz),
  completed: !!lesson.completed,
});

const cloneModule = (module: Module): Module => ({
  id: module.id,
  title: module.title,
  description: module.description,
  progress: Number(module.progress || 0),
  lessons: module.lessons.map(cloneLesson),
});

const normalizeManagedModule = (raw: ManagedModuleApi): Module | null => {
  const id = String(raw?.id || '').trim();
  const title = String(raw?.title || '').trim();
  if (!id || !title) return null;
  const lessons = Array.isArray(raw?.lessons)
    ? raw.lessons
        .map((lesson): Lesson | null => {
          const lessonId = String(lesson?.id || '').trim();
          const lessonTitle = String(lesson?.title || '').trim();
          if (!lessonId || !lessonTitle) return null;
          const points = Math.max(1, Math.floor(Number(lesson?.points) || 1));
          return {
            id: lessonId,
            title: lessonTitle,
            duration: String(lesson?.duration || '10 minutes').trim() || '10 minutes',
            points,
            content: String(lesson?.content || `<h2>${lessonTitle}</h2><p>Lesson content coming soon.</p>`),
            completed: false,
          };
        })
        .filter((item): item is Lesson => !!item)
    : [];
  return {
    id,
    title,
    description: String(raw?.description || '').trim(),
    progress: 0,
    lessons,
  };
};

const mergeModulesCatalog = (managedRaw: ManagedModuleApi[]) => {
  const merged = new Map<string, Module>();
  initialModules.forEach((module) => merged.set(module.id, cloneModule(module)));

  managedRaw.forEach((item) => {
    const id = String(item?.id || '').trim();
    if (!id) return;
    if (item?.deleted) {
      merged.delete(id);
      return;
    }
    const normalized = normalizeManagedModule(item);
    if (!normalized) return;
    merged.set(normalized.id, cloneModule(normalized));
  });

  return Array.from(merged.values());
};

const applyCompletionState = (catalog: Module[], previous: Module[]) => {
  const completedKeys = new Set<string>();
  previous.forEach((module) => {
    module.lessons.forEach((lesson) => {
      if (lesson.completed) completedKeys.add(`${module.id}:${lesson.id}`);
    });
  });

  return catalog.map((module) => {
    const lessons = module.lessons.map((lesson) => ({
      ...lesson,
      completed: completedKeys.has(`${module.id}:${lesson.id}`),
    }));
    const completedCount = lessons.filter((lesson) => lesson.completed).length;
    const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
    return { ...module, lessons, progress };
  });
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderLessonHtml = (content?: string) => {
  const raw = String(content || "").trim();
  if (!raw) return "<p>Lesson content coming soon.</p>";
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(raw);
  if (hasHtmlTags) return raw;
  return raw
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
};

export default function LearnPage() {
  const [location] = useLocation();
  const { username, role } = useAuth();
  const canManageLearn = role === 'admin' || role === 'teacher';
  const [modules, setModules] = useState<Module[]>(() => mergeModulesCatalog([]));
  const [managedModulesApi, setManagedModulesApi] = useState<ManagedModuleApi[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isQuiz, setIsQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [lessonPoints, setLessonPoints] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  
  // Achievement system state
  const [userProgress, setUserProgress] = useState<UserProgress>(loadLocalProgress());
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Font size control state
  const [fontSize, setFontSize] = useState(16); // Base font size in pixels
  const [managerOpen, setManagerOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [savingModule, setSavingModule] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [moduleDraft, setModuleDraft] = useState<Module>({
    id: '',
    title: '',
    description: '',
    progress: 0,
    lessons: [
      {
        id: '1',
        title: '',
        duration: '10 minutes',
        points: 10,
        content: '',
        completed: false,
      },
    ],
  });

  const selectedModule = modules.find(m => m.id === selectedModuleId) || null;
  const selectedLesson = selectedModule?.lessons.find(l => l.id === selectedLessonId) || null;

  const loadManagedModules = async () => {
    try {
      const response = await fetch('/api/learning/modules');
      const json = await response.json();
      const rows = Array.isArray(json) ? (json as ManagedModuleApi[]) : [];
      setManagedModulesApi(rows);
      setModules((prev) => applyCompletionState(mergeModulesCatalog(rows), prev));
    } catch {
      setManagedModulesApi([]);
      setModules((prev) => applyCompletionState(mergeModulesCatalog([]), prev));
    }
  };

  const resetModuleDraft = () => {
    setEditingModuleId(null);
    setModuleDraft({
      id: '',
      title: '',
      description: '',
      progress: 0,
      lessons: [
        {
          id: '1',
          title: '',
          duration: '10 minutes',
          points: 10,
          content: '',
          completed: false,
        },
      ],
    });
  };

  const openCreateModule = () => {
    resetModuleDraft();
    setManagerOpen(true);
  };

  const openEditModule = (module: Module) => {
    setEditingModuleId(module.id);
    setModuleDraft(cloneModule(module));
    setManagerOpen(true);
  };

  const addDraftLesson = () => {
    setModuleDraft((prev) => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          id: `${prev.lessons.length + 1}`,
          title: '',
          duration: '10 minutes',
          points: 10,
          content: '',
          completed: false,
        },
      ],
    }));
  };

  const removeDraftLesson = (index: number) => {
    setModuleDraft((prev) => {
      const next = prev.lessons.filter((_, i) => i !== index);
      return { ...prev, lessons: next.length ? next : prev.lessons };
    });
  };

  const saveModuleDraft = async () => {
    if (!canManageLearn || !username) return;
    const title = moduleDraft.title.trim();
    if (!title) {
      setMessage('Module title is required.');
      return;
    }
    const validLessons = moduleDraft.lessons.filter((lesson) => lesson.title.trim());
    if (validLessons.length === 0) {
      setMessage('Add at least one lesson with a title.');
      return;
    }

    const payload = {
      id: editingModuleId || undefined,
      title,
      description: moduleDraft.description.trim(),
      lessons: validLessons.map((lesson) => ({
        id: (lesson.id || '').trim() || undefined,
        title: lesson.title.trim(),
        duration: lesson.duration.trim() || '10 minutes',
        points: Math.max(1, Math.floor(Number(lesson.points) || 1)),
        content: lesson.content || `<h2>${lesson.title.trim()}</h2><p>Lesson content coming soon.</p>`,
      })),
    };

    setSavingModule(true);
    try {
      const res = await fetch(editingModuleId ? `/api/admin/learning/modules/${encodeURIComponent(editingModuleId)}` : '/api/admin/learning/modules', {
        method: editingModuleId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Username': username,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setMessage(data?.error || 'Failed to save module.');
        return;
      }
      await loadManagedModules();
      setMessage(editingModuleId ? 'Module updated successfully.' : 'Module created successfully.');
      resetModuleDraft();
      setManagerOpen(false);
    } finally {
      setSavingModule(false);
      setTimeout(() => setMessage(null), 2200);
    }
  };

  const deleteManagedModule = async (moduleId: string, moduleTitle: string) => {
    if (!canManageLearn || !username) return;
    if (!confirm(`Delete module "${moduleTitle}"?`)) return;

    setDeletingModuleId(moduleId);
    try {
      const res = await fetch(`/api/admin/learning/modules/${encodeURIComponent(moduleId)}`, {
        method: 'DELETE',
        headers: { 'X-Username': username },
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setMessage(data?.error || 'Failed to delete module.');
        return;
      }
      await loadManagedModules();
      if (selectedModuleId === moduleId) {
        setSelectedModuleId(null);
        setSelectedLessonId(null);
        setIsQuiz(false);
      }
      setMessage('Module deleted successfully.');
    } finally {
      setDeletingModuleId(null);
      setTimeout(() => setMessage(null), 2200);
    }
  };

  const getRelatedGames = (moduleId?: string | null, lessonId?: string | null) => {
    if (!moduleId) return [];
    const lessonKeyRef = lessonId ? `${moduleId}:${lessonId}` : "";
    const lessonGames = lessonKeyRef ? (LESSON_GAME_MAP[lessonKeyRef] || []) : [];
    const moduleGames = MODULE_GAME_MAP[moduleId] || [];
    const combinedIds = Array.from(new Set([...lessonGames, ...moduleGames]));
    return GAMES.filter(game => combinedIds.includes(game.id));
  };

  const relatedGamesForModule = getRelatedGames(selectedModuleId, null);
  const relatedGamesForLesson = getRelatedGames(selectedModuleId, selectedLessonId);

  const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}:${lessonId}`;

  const applyCompletions = (completions: Array<{ moduleId: string; lessonId: string }>) => {
    const completed = new Set(completions.map(c => lessonKey(c.moduleId, c.lessonId)));
    setModules(prev =>
      prev.map(module => {
        const lessons = module.lessons.map(lesson => ({
          ...lesson,
          completed: completed.has(lessonKey(module.id, lesson.id)),
        }));
        const completedCount = lessons.filter(l => l.completed).length;
        const progress = Math.round((completedCount / lessons.length) * 100);
        return { ...module, lessons, progress };
      })
    );
  };

  const markLessonCompletedLocal = (moduleId: string, lessonId: string) => {
    setModules(prev =>
      prev.map(module => {
        if (module.id !== moduleId) return module;
        const lessons = module.lessons.map(lesson =>
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        );
        const completedCount = lessons.filter(l => l.completed).length;
        const progress = Math.round((completedCount / lessons.length) * 100);
        return { ...module, lessons, progress };
      })
    );
  };

  const markModuleCompletedLocal = (moduleId: string) => {
    setModules(prev =>
      prev.map(module => {
        if (module.id !== moduleId) return module;
        const lessons = module.lessons.map(lesson => ({ ...lesson, completed: true }));
        return { ...module, lessons, progress: 100 };
      })
    );
  };

  const loadProgress = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const [progressRes, profileRes] = await Promise.all([
        fetch('/api/learning/progress', { headers: { 'X-Username': username } }),
        fetch('/api/student/profile', { headers: { 'X-Username': username } }),
      ]);
      const progressData = await progressRes.json();
      const profileData = await profileRes.json();
      applyCompletions(Array.isArray(progressData?.completions) ? progressData.completions : []);
      setLessonPoints(Number(progressData?.totalLessonPoints || 0));
      setEcoPoints(Number(profileData?.ecoPoints || 0));
      
      // Update local progress from server data
      const completions = Array.isArray(progressData?.completions) ? progressData.completions : [];
      const updatedProgress: UserProgress = {
        ...userProgress,
        completedLessons: completions.map((c: any) => `${c.moduleId}:${c.lessonId}`),
        totalPoints: Number(profileData?.ecoPoints || 0),
        lastUpdated: new Date().toISOString()
      };
      setUserProgress(updatedProgress);
      saveLocalProgress(updatedProgress);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagedModules();
  }, []);

  useEffect(() => {
    loadProgress();
  }, [username]);

  useEffect(() => {
    // Prefer real browser search params because router location may exclude query string.
    const browserSearch = typeof window !== 'undefined' ? window.location.search : '';
    let params = new URLSearchParams(browserSearch);

    if (!params.get('module')) {
      const queryIndex = location.indexOf('?');
      if (queryIndex !== -1) {
        params = new URLSearchParams(location.slice(queryIndex + 1));
      }
    }

    const moduleId = params.get('module');
    if (!moduleId) return;

    const targetModule = modules.find(module => module.id === moduleId);
    if (!targetModule) return;

    setSelectedModuleId(targetModule.id);
    setIsQuiz(false);

    const lessonIds = (params.get('lessons') || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const firstMatchingLesson = lessonIds.find(id =>
      targetModule.lessons.some(lesson => lesson.id === id)
    );

    setSelectedLessonId(firstMatchingLesson || targetModule.lessons[0]?.id || null);
  }, [location, modules]);

  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }
      const now = ctx.currentTime + 0.02;

      const createTone = (freq: number, start: number, duration: number, gainValue: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.05);
      };

      createTone(523.25, now, 0.22, 0.12);
      createTone(659.25, now + 0.08, 0.2, 0.1);
      createTone(784.0, now + 0.14, 0.22, 0.08);

      setTimeout(() => {
        ctx.close().catch(() => undefined);
      }, 700);
    } catch {
      // ignore audio errors
    }
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModuleId(module.id);
    setSelectedLessonId(null);
    setIsQuiz(false);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setIsQuiz(false);
  };

  const handleLessonComplete = async () => {
    if (!selectedLesson || !selectedModule || !username) return;
    if (selectedLesson.completed) {
      setMessage('Lesson already completed.');
      return;
    }
    setCompleting(true);
    try {
      const res = await fetch('/api/learning/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          moduleTitle: selectedModule.title,
          lessonId: selectedLesson.id,
          lessonTitle: selectedLesson.title,
          points: selectedLesson.points || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || 'Failed to complete lesson');
        return;
      }
      if (data?.alreadyCompleted) {
        setMessage('Lesson already completed.');
      } else {
        markLessonCompletedLocal(selectedModule.id, selectedLesson.id);
        setMessage(`Lesson completed! +${selectedLesson.points} EcoPoints`);
        setShowBurst(true);
        playChime();
        setTimeout(() => setShowBurst(false), 900);
        await loadProgress();
        
        // Update achievement progress
        const lessonKey = `${selectedModule.id}:${selectedLesson.id}`;
        if (!userProgress.completedLessons.includes(lessonKey)) {
          const updatedProgress: UserProgress = {
            ...userProgress,
            completedLessons: [...userProgress.completedLessons, lessonKey],
            totalPoints: userProgress.totalPoints + (selectedLesson.points || 0),
            lastUpdated: new Date().toISOString()
          };
          
          // Check for new achievements
          const newlyUnlocked = checkAchievements(updatedProgress);
          if (newlyUnlocked.length > 0) {
            setNewAchievement(newlyUnlocked[0]);
            setTimeout(() => setNewAchievement(null), 5000);
          }
          
          setUserProgress(updatedProgress);
          saveLocalProgress(updatedProgress);
        }
      }
    } finally {
      setCompleting(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleBack = () => {
    if (isQuiz) {
      setIsQuiz(false);
    } else if (selectedLessonId) {
      setSelectedLessonId(null);
    } else if (selectedModuleId) {
      setSelectedModuleId(null);
    }
  };

  const handleTakeQuiz = () => {
    setIsQuiz(true);
    setQuizAnswers(new Array(selectedLesson?.quiz?.questions.length || 0).fill(-1));
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    setTimeout(() => {
      handleLessonComplete();
    }, 900);
  };

  const handleModuleComplete = async () => {
    if (!selectedModule || !username) return;
    setCompleting(true);
    try {
      for (const lesson of selectedModule.lessons) {
        if (lesson.completed) continue;
        await fetch('/api/learning/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Username': username },
          body: JSON.stringify({
            moduleId: selectedModule.id,
            moduleTitle: selectedModule.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            points: lesson.points || 0,
          }),
        });
      }
      markModuleCompletedLocal(selectedModule.id);
      await loadProgress();
      setMessage('Module completed!');
      setShowBurst(true);
      playChime();
      setTimeout(() => setShowBurst(false), 900);
      
      // Update achievement progress for module completion
      if (!userProgress.completedModules.includes(selectedModule.id)) {
        const updatedProgress: UserProgress = {
          ...userProgress,
          completedModules: [...userProgress.completedModules, selectedModule.id],
          lastUpdated: new Date().toISOString()
        };
        
        // Check for new achievements
        const newlyUnlocked = checkAchievements(updatedProgress);
        if (newlyUnlocked.length > 0) {
          setNewAchievement(newlyUnlocked[0]);
          setTimeout(() => setNewAchievement(null), 5000);
        }
        
        setUserProgress(updatedProgress);
        saveLocalProgress(updatedProgress);
      }
    } finally {
      setCompleting(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const totalModulesCompleted = modules.filter(m => m.progress === 100).length;
  const moduleOrderPriority: Record<string, number> = {
    "environmental-health": 0,
    "biosphere": 1,
    "pollution-silent-killer": 2,
    "ecolearn-environmental-education": 3,
    "earthpulse-environment-human": 4,
  };
  const sortedModules = [...modules].sort((a, b) => {
    const aPriority = moduleOrderPriority[a.id] ?? 999;
    const bPriority = moduleOrderPriority[b.id] ?? 999;
    return aPriority - bPriority;
  });
  const managedOverrideIds = new Set(
    managedModulesApi
      .filter((module) => !module.deleted)
      .map((module) => String(module.id || '').trim())
      .filter(Boolean)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-24 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {loading ? (
            <HeaderSkeleton />
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Environmental Learning Hub
                </h1>
                <p className="text-white/70 mt-2">Short lessons, quick quizzes, real eco points.</p>
                {canManageLearn && (
                  <div className="mt-3">
                    <Button
                      onClick={() => setManagerOpen((prev) => !prev)}
                      className="bg-white/10 border border-white/25 hover:bg-white/20 text-white"
                    >
                      {managerOpen ? 'Close Learn Manager' : 'Manage Modules & Lessons'}
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <p className="text-xs text-white/60">EcoPoints</p>
                  <p className="text-2xl font-bold text-white">{ecoPoints}</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <p className="text-xs text-white/60">Lesson Points</p>
                  <p className="text-2xl font-bold text-white">{lessonPoints}</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <p className="text-xs text-white/60">Modules Done</p>
                  <p className="text-2xl font-bold text-white">{totalModulesCompleted}/{modules.length}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-4 py-3 text-emerald-200"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {message}
            </div>
          </motion.div>
        )}

        {showBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-4 py-2 text-emerald-200"
          >
            <Zap className="h-4 w-4" />
            Lesson completion recorded
          </motion.div>
        )}

        {canManageLearn && managerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-5 md:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-cyan-200">Learn Content Manager</h3>
                <p className="text-sm text-white/70">Admins and teachers can add, edit, or delete modules and lessons.</p>
              </div>
              <Button onClick={openCreateModule} className="bg-cyan-300 text-slate-950 hover:bg-cyan-200 font-bold">
                <Plus className="h-4 w-4 mr-2" /> New Module
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="rounded-xl border border-white/20 bg-white/5 p-4 space-y-3 max-h-[34rem] overflow-y-auto">
                {sortedModules.map((module) => {
                  const isManagedOverride = managedOverrideIds.has(module.id);
                  return (
                    <div key={`manage-${module.id}`} className="rounded-lg border border-white/15 bg-black/20 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{module.title}</div>
                          <div className="text-xs text-white/65 mt-0.5">{module.lessons.length} lessons</div>
                          <div className="text-[11px] text-white/55 mt-1">{isManagedOverride ? 'Managed override' : 'Built-in module'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Edit module"
                            aria-label="Edit module"
                            onClick={() => openEditModule(module)}
                            className="h-8 w-8 rounded-full border border-emerald-400/60 bg-emerald-500/20 text-emerald-300 flex items-center justify-center hover:bg-emerald-500/35"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete module"
                            aria-label="Delete module"
                            onClick={() => deleteManagedModule(module.id, module.title)}
                            disabled={deletingModuleId === module.id}
                            className="h-8 w-8 rounded-full border border-red-400/60 bg-red-500/20 text-red-300 flex items-center justify-center hover:bg-red-500/35 disabled:opacity-60"
                          >
                            <Trash2 className={`h-3.5 w-3.5 ${deletingModuleId === module.id ? 'animate-pulse' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-white/20 bg-white/5 p-4 space-y-4 max-h-[34rem] overflow-y-auto">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-white">{editingModuleId ? 'Edit Module' : 'Create Module'}</h4>
                  <Button
                    variant="ghost"
                    onClick={resetModuleDraft}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4 mr-1" /> Reset
                  </Button>
                </div>

                <div>
                  <label className="text-xs text-white/70">Module Title</label>
                  <input
                    value={moduleDraft.title}
                    onChange={(e) => setModuleDraft((prev) => ({ ...prev, title: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-black/25 px-3 py-2 text-white"
                    placeholder="Module title"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70">Description</label>
                  <textarea
                    value={moduleDraft.description}
                    onChange={(e) => setModuleDraft((prev) => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-black/25 px-3 py-2 text-white"
                    rows={2}
                    placeholder="Short module description"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/70">Lessons</label>
                  <Button onClick={addDraftLesson} variant="secondary" className="bg-white/15 hover:bg-white/25 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Add Lesson
                  </Button>
                </div>

                <div className="space-y-3">
                  {moduleDraft.lessons.map((lesson, index) => (
                    <div key={`draft-lesson-${index}`} className="rounded-lg border border-white/15 bg-black/20 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-white/70">Lesson {index + 1}</div>
                        {moduleDraft.lessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDraftLesson(index)}
                            className="text-red-300 hover:text-red-200"
                            title="Remove lesson"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        value={lesson.title}
                        onChange={(e) =>
                          setModuleDraft((prev) => ({
                            ...prev,
                            lessons: prev.lessons.map((item, i) => i === index ? { ...item, title: e.target.value } : item),
                          }))
                        }
                        className="w-full rounded-md border border-white/20 bg-black/20 px-2.5 py-2 text-sm text-white"
                        placeholder="Lesson title"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={lesson.duration}
                          onChange={(e) =>
                            setModuleDraft((prev) => ({
                              ...prev,
                              lessons: prev.lessons.map((item, i) => i === index ? { ...item, duration: e.target.value } : item),
                            }))
                          }
                          className="rounded-md border border-white/20 bg-black/20 px-2.5 py-2 text-sm text-white"
                          placeholder="Duration (e.g. 12 minutes)"
                        />
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={lesson.points}
                          onChange={(e) =>
                            setModuleDraft((prev) => ({
                              ...prev,
                              lessons: prev.lessons.map((item, i) => i === index ? { ...item, points: Math.max(1, Math.min(500, Number(e.target.value) || 1)) } : item),
                            }))
                          }
                          className="rounded-md border border-white/20 bg-black/20 px-2.5 py-2 text-sm text-white"
                          placeholder="Points"
                        />
                      </div>
                      <textarea
                        value={lesson.content}
                        onChange={(e) =>
                          setModuleDraft((prev) => ({
                            ...prev,
                            lessons: prev.lessons.map((item, i) => i === index ? { ...item, content: e.target.value } : item),
                          }))
                        }
                        className="w-full rounded-md border border-white/20 bg-black/20 px-2.5 py-2 text-sm text-white"
                        rows={3}
                        placeholder="Lesson content (HTML supported)"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveModuleDraft} disabled={savingModule} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white">
                    <Save className="h-4 w-4 mr-2" /> {savingModule ? 'Saving...' : (editingModuleId ? 'Update Module' : 'Create Module')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setManagerOpen(false);
                      resetModuleDraft();
                    }}
                    className="bg-white/15 hover:bg-white/25 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress and Achievements Section */}
        {!loading && !selectedModule && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Progress Circle */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center">
                <ProgressCircle 
                  percentage={getProgressPercentage(totalModulesCompleted, modules.length)} 
                  size={140}
                />
                <p className="text-white/70 text-sm mt-4">Course Progress</p>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-2 bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-400" />
                    Your Achievements
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAchievements(!showAchievements)}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    {showAchievements ? 'Hide' : 'View All'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-400">{userProgress.completedLessons.length}</p>
                    <p className="text-xs text-white/60 mt-1">Lessons Done</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-cyan-400">{userProgress.completedModules.length}</p>
                    <p className="text-xs text-white/60 mt-1">Modules Done</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400">{userProgress.unlockedAchievements.length}</p>
                    <p className="text-xs text-white/60 mt-1">Badges</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">{userProgress.totalPoints}</p>
                    <p className="text-xs text-white/60 mt-1">Total Points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges Grid */}
            {showAchievements && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <BadgeGrid achievements={getUserAchievements(userProgress)} />
              </motion.div>
            )}
          </motion.div>
        )}

        {loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!selectedModule && !selectedLesson && <ModuleDashboardSkeleton />}
              {selectedModule && !selectedLesson && <LessonListSkeleton />}
              {selectedLesson && <LessonContentSkeleton />}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            {!selectedModule && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedModules.map((module, idx) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className={`group relative bg-white/5 backdrop-blur-2xl border rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-400/40 transition-all cursor-pointer overflow-hidden ${
                      module.id === 'ocean' ? 'border-blue-400/40' : module.id === 'water' ? 'border-cyan-400/40' : 'border-white/20'
                    }`}
                    onClick={() => handleModuleSelect(module)}
                  >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
                    
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-all">
                          <BookOpen className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold group-hover:text-emerald-200 transition-colors">{module.title}</h3>
                          <p className="text-white/50 text-xs">
                            <Target className="h-3 w-3 inline mr-1" />
                            {module.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                      {module.progress === 100 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 border border-emerald-400/50 px-3 py-1 text-emerald-300 text-xs font-semibold">
                          <Trophy className="h-3 w-3" /> Done
                        </span>
                      )}
                    </div>
                    
                    <p className="text-white/70 text-sm mb-5 leading-relaxed group-hover:text-white/80 transition-colors">{module.description}</p>
                    
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center justify-between text-xs text-white/60 group-hover:text-white/70 transition-colors">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" />
                          Progress
                        </span>
                        <span className="font-semibold text-white">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2.5 bg-white/10" />
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400/40 to-emerald-500/0 group-hover:via-emerald-400/100 transition-all" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {selectedModule && !selectedLesson && (
              <motion.div
                key="module"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={handleBack} className="text-white hover:text-emerald-200 hover:bg-white/10">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent break-words [overflow-wrap:anywhere]">{selectedModule.title}</h2>
                      <p className="text-white/70 text-sm mt-1 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{selectedModule.description}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleModuleComplete} 
                    disabled={completing}
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Complete Module
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {selectedModule.lessons.map((lesson, idx) => {
                    const isCompleted = lesson.completed;
                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        whileHover={{ y: -3 }}
                        className="group relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-xl p-5 hover:bg-white/10 hover:border-emerald-400/40 transition-all cursor-pointer overflow-hidden"
                        onClick={() => handleLessonSelect(lesson)}
                      >
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
                        
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2 group-hover:text-emerald-200 transition-colors flex items-start gap-2 break-words [overflow-wrap:anywhere]">
                              <span className="inline-block p-1.5 bg-emerald-500/20 rounded group-hover:bg-emerald-500/30 transition-all mt-0.5">
                                <Play className="h-3 w-3 text-emerald-300" />
                              </span>
                              <span>{lesson.title}</span>
                            </h3>
                            <p className="text-white/60 text-xs flex items-center gap-2 group-hover:text-white/70 transition-colors">
                              <span className="flex items-center gap-1">
                                ⏱️ {lesson.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400" /> {lesson.points}
                              </span>
                            </p>
                          </div>
                          <div>
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 border border-emerald-400/50 px-2.5 py-1 text-emerald-300 text-xs font-semibold whitespace-nowrap">
                                <CheckCircle className="h-3 w-3" /> Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/30 border border-cyan-400/50 px-2.5 py-1 text-cyan-300 text-xs font-semibold">
                                New
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400/40 to-emerald-500/0 group-hover:via-emerald-400/100 transition-all" />
                      </motion.div>
                    );
                  })}
                </div>

                {relatedGamesForModule.length > 0 && (
                  <div className="mt-8 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-cyan-200">Play Related Games</h3>
                        <p className="text-sm text-white/70">These games reinforce concepts from this module.</p>
                      </div>
                      <Link href="/games">
                        <Button className="bg-cyan-300 text-slate-950 font-bold border border-cyan-100 hover:bg-cyan-200 shadow-lg shadow-cyan-900/30">
                          View All Games
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {relatedGamesForModule.map((game) => (
                        <div key={game.id} className="rounded-xl border border-white/20 bg-white/5 p-4">
                          <p className="text-white font-semibold">{game.icon ? `${game.icon} ` : ''}{game.name}</p>
                          <p className="text-xs text-white/70 mt-1 line-clamp-2">{game.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-emerald-300">+{game.points} pts</span>
                            <Link href={`/games/play/${game.id}`}>
                              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">Play</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedModule.id === 'biosphere' && (
                  <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-cyan-950/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Read More</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">Explore biodiversity in a more interactive way</h3>
                        <p className="mt-2 max-w-2xl text-sm text-white/70">
                          Continue learning with the companion site focused on biodiversity, ecosystems, and the living world.
                        </p>
                      </div>
                      <a
                        href="https://biodiversityenv.netlify.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02]"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                )}

                {selectedModule.id === 'environmental-health' && (
                  <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-cyan-950/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Read More</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">Explore a more interactive environmental health experience</h3>
                        <p className="mt-2 max-w-2xl text-sm text-white/70">
                          Continue learning with deeper sound, motion, and theory on the companion site.
                        </p>
                      </div>
                      <a
                        href="https://envhealthimmer.netlify.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02]"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                )}

                {selectedModule.id === 'pollution-silent-killer' && (
                  <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-cyan-950/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Read More</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">Experience Pollution: The Silent Killer interactively</h3>
                        <p className="mt-2 max-w-2xl text-sm text-white/70">
                          Explore the cinematic simulation with timeline, toxicity insights, and restoration pathways.
                        </p>
                      </div>
                      <a
                        href="https://pollutioneffectsenv.netlify.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02]"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                )}

                {selectedModule.id === 'ecolearn-environmental-education' && (
                  <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-cyan-950/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Read More</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">Explore EcoLearn's Environmental Education experience</h3>
                        <p className="mt-2 max-w-2xl text-sm text-white/70">
                          Dive deeper into UNESCO foundations, EE focus areas, trends, careers, and curriculum pathways.
                        </p>
                      </div>
                      <a
                        href="https://environmentedv.netlify.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02]"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                )}

                {selectedModule.id === 'earthpulse-environment-human' && (
                  <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-cyan-950/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Read More</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">Explore EarthPulse: environment and humanity</h3>
                        <p className="mt-2 max-w-2xl text-sm text-white/70">
                          Continue the chapter journey on population, climate pressure, and the path toward balance.
                        </p>
                      </div>
                      <a
                        href="https://envrionmentandhuman.netlify.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02]"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {selectedLesson && !isQuiz && (
              <motion.div
                key="lesson"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={handleBack} className="text-white hover:text-emerald-200 hover:bg-white/10">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent break-words [overflow-wrap:anywhere]">{selectedLesson.title}</h2>
                      <p className="text-white/70 text-sm mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">⏱️ {selectedLesson.duration}</span>
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" /> {selectedLesson.points} EcoPoints</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedLesson.quiz && (
                      <Button 
                        onClick={handleTakeQuiz} 
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold"
                      >
                        📝 Take Quiz
                      </Button>
                    )}
                    <Button 
                      onClick={handleLessonComplete} 
                      disabled={completing || !!selectedLesson.completed}
                      className={selectedLesson.completed ? 'bg-white/10 text-white/60' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold'}
                    >
                      {selectedLesson.completed ? '✓ Completed' : '✓ Mark Complete'}
                    </Button>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 hover:border-emerald-400/40 transition-all"
                >
                  {/* Font Size Controls */}
                  <div className="flex items-center justify-end gap-2 mb-4 pb-4 border-b border-white/10">
                    <span className="text-white/70 text-sm flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Font Size:
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                      disabled={fontSize <= 12}
                      className="h-8 w-8 p-0 bg-white/5 border-white/20 hover:bg-white/10 hover:border-emerald-400/40 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Decrease font size"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-white/90 text-sm font-medium min-w-[3rem] text-center">
                      {fontSize}px
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                      disabled={fontSize >= 24}
                      className="h-8 w-8 p-0 bg-white/5 border-white/20 hover:bg-white/10 hover:border-emerald-400/40 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Increase font size"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div 
                    className="prose prose-invert max-w-none break-words [overflow-wrap:anywhere] prose-h2:font-bold prose-h2:text-emerald-300 prose-strong:text-emerald-300 prose-a:text-cyan-400 hover:prose-a:text-cyan-300" 
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: renderLessonHtml(selectedLesson.content) }} 
                  />
                </motion.div>

                {relatedGamesForLesson.length > 0 && (
                  <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-emerald-200">Related Games for This Lesson</h3>
                        <p className="text-sm text-white/70">Apply what you learned through interactive play.</p>
                      </div>
                      <Link href="/games">
                        <Button className="bg-emerald-300 text-slate-950 font-bold border border-emerald-100 hover:bg-emerald-200 shadow-lg shadow-emerald-900/30">
                          Browse Games
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {relatedGamesForLesson.map((game) => (
                        <div key={game.id} className="rounded-xl border border-white/20 bg-white/5 p-4">
                          <p className="text-white font-semibold">{game.icon ? `${game.icon} ` : ''}{game.name}</p>
                          <p className="text-xs text-white/70 mt-1 line-clamp-2">{game.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-cyan-300">+{game.points} pts</span>
                            <Link href={`/games/play/${game.id}`}>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Play</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {isQuiz && selectedLesson && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Button variant="ghost" onClick={handleBack} className="text-white hover:text-emerald-200 hover:bg-white/10">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">📝 {selectedLesson.title} Quiz</h2>
                </div>

                <motion.div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-8">
                  <div className="space-y-8">
                    {selectedLesson.quiz?.questions.map((q, index) => {
                      const isAnswered = quizAnswers[index] !== -1;
                      const isCorrect = quizAnswers[index] === q.correct;
                      
                      return (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-emerald-400/40 transition-all"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold mb-1">{q.question}</h3>
                              {quizSubmitted && isAnswered && (
                                <p className={`text-xs font-semibold flex items-center gap-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {isCorrect ? (
                                    <>
                                      <CheckCircle className="h-3 w-3" /> Correct!
                                    </>
                                  ) : (
                                    <>
                                      ✗ Incorrect
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2 ml-11">
                            {q.options.map((option, optIndex) => {
                              const isSelected = quizAnswers[index] === optIndex;
                              const showCorrect = quizSubmitted && optIndex === q.correct;
                              const showIncorrect = quizSubmitted && isSelected && optIndex !== q.correct;

                              return (
                                <label
                                  key={optIndex}
                                  className={`relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    showCorrect
                                      ? 'bg-emerald-500/20 border-emerald-400/50'
                                      : showIncorrect
                                      ? 'bg-red-500/20 border-red-400/50'
                                      : isSelected
                                      ? 'bg-cyan-500/20 border-cyan-400/50'
                                      : 'bg-white/5 border-white/10 hover:border-white/20'
                                  } ${quizSubmitted ? 'cursor-default' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={optIndex}
                                    checked={isSelected}
                                    onChange={() => {
                                      if (!quizSubmitted) {
                                        const newAnswers = [...quizAnswers];
                                        newAnswers[index] = optIndex;
                                        setQuizAnswers(newAnswers);
                                      }
                                    }}
                                    disabled={quizSubmitted}
                                    className="w-4 h-4"
                                  />
                                  <span className={`text-sm font-medium ${
                                    showCorrect ? 'text-emerald-200' : showIncorrect ? 'text-red-200' : 'text-white'
                                  }`}>
                                    {option}
                                  </span>
                                  {showCorrect && <CheckCircle className="h-4 w-4 text-emerald-400 ml-auto" />}
                                  {showIncorrect && <span className="text-red-400 ml-auto text-lg">✗</span>}
                                </label>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {!quizSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pt-8 border-t border-white/10"
                    >
                      <Button 
                        onClick={handleQuizSubmit}
                        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold py-3"
                      >
                        🚀 Submit Quiz
                      </Button>
                    </motion.div>
                  )}

                  {quizSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pt-8 border-t border-white/10 text-center"
                    >
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-4 py-2 text-emerald-300 font-semibold">
                        <Trophy className="h-4 w-4" />
                        Quiz Completed!
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Achievement Toast Notification */}
      <AnimatePresence>
        {newAchievement && (
          <AchievementToast 
            achievement={newAchievement} 
            onClose={() => setNewAchievement(null)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideInLeft 0.5s ease-out forwards;
        }

        .group:hover .prose {
          color: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
}
