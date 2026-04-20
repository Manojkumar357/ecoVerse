import { motion } from "framer-motion";
import { Trees, Home, Leaf, Sprout, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl"
        />
        
        {/* Floating Leaves */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -100 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              y: ["0vh", "100vh"],
              x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
              rotate: [0, 360]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `-100px`
            }}
          >
            <Leaf className="w-8 h-8 text-emerald-400/40" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl mx-auto px-6 text-center"
      >
        {/* Animated 404 Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex items-center justify-center gap-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trees className="w-24 h-24 text-emerald-400" />
          </motion.div>
          
          <motion.div 
            className="text-9xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            404
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Sprout className="w-20 h-20 text-cyan-400" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Oops! This Path Hasn't Been Planted Yet
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            Looks like you've wandered off the eco-trail. The page you're looking for 
            doesn't exist in our sustainable ecosystem.
          </p>
          <p className="text-lg text-emerald-300/80 italic">
            🌱 "Every journey begins with returning to the roots"
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all group"
            >
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Return to Home
            </Button>
          </Link>
          
          <Link href="/learn">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-emerald-400/40 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all group"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Continue Learning
            </Button>
          </Link>
        </motion.div>

        {/* Fun Eco Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
        >
          <p className="text-sm text-white/60 mb-2 uppercase tracking-wider font-semibold">
            Did You Know?
          </p>
          <p className="text-white/80">
            A single tree can absorb up to 48 pounds of CO₂ per year and produce 
            enough oxygen for two people annually. Let's plant more knowledge trees! 🌳
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
