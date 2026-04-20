import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ContactHelpPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewCategory = formData.category || "general";
  const previewSubject = formData.subject.trim() || "No subject yet";
  const previewMessage = formData.message.trim() || "Your message preview will appear here as you type.";
  const previewSender = formData.name.trim() || "Anonymous";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit contact form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send message');
      }
      
      toast({
        title: 'Message Sent',
        description: `Your message was delivered to ${data.deliveredTo || 'our support inbox'}.`,
      });
      setFormData({ name: '', email: '', category: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: 'Message Failed',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white p-6 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.12),_transparent_24%),linear-gradient(160deg,_#07141a_0%,_#0a2a26_45%,_#040b10_100%)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-[-5rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
        <div className="absolute top-28 right-[-4rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" style={{ animationDelay: '900ms' }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/5 blur-3xl animate-pulse" style={{ animationDelay: '1800ms' }} />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-2 text-sm text-white/80 mb-4 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Support is active 24/7
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white/95">Contact & Help</h1>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">We're here to help. Send a message, browse quick answers, or reach support directly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4 shadow-xl transition-transform duration-300"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-200/70 mb-1">Inbox</div>
            <div className="text-lg font-semibold text-white">ecoverse.academy@gmail.com</div>
            <div className="text-sm text-white/60 mt-1">Messages are delivered here instantly.</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4 shadow-xl transition-transform duration-300"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/70 mb-1">Reply Time</div>
            <div className="text-lg font-semibold text-white">Within 24 hours</div>
            <div className="text-sm text-white/60 mt-1">Fast support for account and access issues.</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.19 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4 shadow-xl transition-transform duration-300"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-amber-200/70 mb-1">Coverage</div>
            <div className="text-lg font-semibold text-white">24/7 Online Support</div>
            <div className="text-sm text-white/60 mt-1">Submit anytime, even outside school hours.</div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/20 p-8"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300" />
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-2xl">💬</span>
                <div>
                  <h2 className="text-2xl font-semibold text-white/95">Send us a Message</h2>
                  <p className="text-sm text-white/60">Tell us what’s going on and we’ll route it to support.</p>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                Secure support form
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-2xl px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder-white/45 outline-none transition-all duration-300 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10 hover:border-white/25"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-2xl px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder-white/45 outline-none transition-all duration-300 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10 hover:border-white/25"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full rounded-2xl px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white outline-none transition-all duration-300 focus:border-amber-300/60 focus:ring-4 focus:ring-amber-300/10 hover:border-white/25"
                  required
                >
                  <option value="" className="text-gray-900">Select a category</option>
                  <option value="technical" className="text-gray-900">Technical Support</option>
                  <option value="account" className="text-gray-900">Account Issues</option>
                  <option value="general" className="text-gray-900">General Inquiry</option>
                  <option value="feedback" className="text-gray-900">Feedback</option>
                  <option value="partnership" className="text-gray-900">Partnership</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help you?"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full rounded-2xl px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder-white/45 outline-none transition-all duration-300 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10 hover:border-white/25"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
                <textarea
                  placeholder="Describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  className="w-full rounded-2xl px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder-white/45 outline-none transition-all duration-300 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10 hover:border-white/25 resize-none"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-600 hover:from-emerald-400 hover:via-cyan-400 hover:to-emerald-500 text-white font-semibold py-3.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>
          
          {/* Right Side - Help & Info */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/15 text-2xl">👀</span>
                <div>
                  <h3 className="text-xl font-semibold text-white/95">Live Message Preview</h3>
                  <p className="text-sm text-white/60">This is exactly how your support note is packaged.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-cyan-200/70">{previewCategory}</div>
                <h4 className="text-lg font-semibold text-white break-words">{previewSubject}</h4>
                <p className="text-sm text-white/75 whitespace-pre-wrap break-words">{previewMessage}</p>
                <div className="pt-2 text-xs text-white/55">From: {previewSender}</div>
              </div>
            </div>
            
            {/* Quick Help */}
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-2xl">❓</span>
                <div>
                  <h3 className="text-xl font-semibold text-white/95">Quick Help</h3>
                  <p className="text-sm text-white/60">Common questions before you send a ticket.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20">
                  <h4 className="font-medium text-white/95 mb-2">How do I reset my password?</h4>
                  <p className="text-sm text-white/70">Go to the sign-in page and click "Forgot Password" to receive a reset link.</p>
                </div>
                
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20">
                  <h4 className="font-medium text-white/95 mb-2">How do I earn more Eco-Points?</h4>
                  <p className="text-sm text-white/70">Play games, complete quizzes, and participate in challenges to earn points and badges.</p>
                </div>
                
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20">
                  <h4 className="font-medium text-white/95 mb-2">Can't access my account?</h4>
                  <p className="text-sm text-white/70">Make sure your account is approved by an admin. Contact us if you're still having issues.</p>
                </div>
              </div>
            </div>
            
            {/* Get in Touch */}
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-2xl">📞</span>
                <div>
                  <h3 className="text-xl font-semibold text-white/95">Get in Touch</h3>
                  <p className="text-sm text-white/60">Direct support details and response window.</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="font-medium text-white/95">Email Support</p>
                    <p className="text-sm text-white/70">ecoverse.academy@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
                  <span className="text-lg">⏰</span>
                  <div>
                    <p className="font-medium text-white/95">Response Time</p>
                    <p className="text-sm text-white/70">Within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
                  <span className="text-lg">🌐</span>
                  <div>
                    <p className="font-medium text-white/95">Support Hours</p>
                    <p className="text-sm text-white/70">24/7 Online Support</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Helpful Resources */}
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-2xl">📖</span>
                <div>
                  <h3 className="text-xl font-semibold text-white/95">Helpful Resources</h3>
                  <p className="text-sm text-white/60">A few places to check before reaching out.</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <h4 className="font-medium text-white/95">User Guide</h4>
                  <p className="text-sm text-white/70">Learn how to use EcoVision effectively</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <h4 className="font-medium text-white/95">Teacher Resources</h4>
                  <p className="text-sm text-white/70">Guides for educators and administrators</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <h4 className="font-medium text-white/95">Environmental Tips</h4>
                  <p className="text-sm text-white/70">Daily actions to help the environment</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
