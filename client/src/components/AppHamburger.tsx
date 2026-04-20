import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useState, useRef } from "react";

export function AppHamburger() {
  const { role, clear } = useAuth();
  const [profileId, setProfileId] = useState("");
  const [showProfileInput, setShowProfileInput] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  const navItemClass = (href: string) => {
    const isActive = location === href;
    return [
      "group flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold",
      "transition-all duration-200",
      isActive
        ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.8)]"
        : "bg-white/5 text-white/90 hover:bg-white/10 hover:translate-x-1 hover:shadow-[0_10px_24px_-16px_rgba(0,0,0,0.8)]",
    ].join(" ");
  };

  const handleViewProfile = () => {
    console.log("handleViewProfile called with profileId:", profileId);
    if (profileId.trim()) {
      // Check if it's a full URL or just the profile ID
      let extractedProfileId = profileId.trim();
      
      // If it's a full URL, extract the profile ID from it
      if (profileId.includes('/profile/')) {
        const parts = profileId.split('/profile/');
        if (parts.length > 1) {
          extractedProfileId = parts[1];
        }
      }
      
      const targetUrl = `/profile/${extractedProfileId}`;
      console.log("Navigating to:", targetUrl);
      
      // Close the sheet first, then navigate
      setShowProfileInput(false);
      setProfileId("");
      
      // Close the sheet
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      
      // Use setTimeout to ensure the sheet closes first
      setTimeout(() => {
        setLocation(targetUrl);
      }, 200);
    } else {
      console.log("No profile ID provided");
    }
  };

  return (
    <Sheet onOpenChange={setIsOpen}>
      {!isOpen && (
        <SheetTrigger asChild>
          <button
            aria-label="Open menu"
            className="w-9 h-9 rounded-lg bg-earth-orange/90 hover:bg-earth-orange-hover flex items-center justify-center shadow-orange transition-all duration-200 hover:scale-[1.03] pointer-events-auto"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </SheetTrigger>
      )}
      <SheetContent side="left" className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-r border-white/10 p-0">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-6 h-24 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_70%)]" />
          <div className="relative px-6 pt-5">
            <SheetHeader className="relative">
              <SheetTitle className="text-base tracking-wide text-white/90">Menu</SheetTitle>
            </SheetHeader>
          </div>
          <div className="mt-4 mx-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 flex items-center justify-center">
              <span className="text-sm font-semibold text-emerald-100">EV</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">EcoVerse</p>
              <p className="text-xs text-white/60">Learn, play, and act</p>
            </div>
          </div>
        </div>
        
        {/* Hidden close button for programmatic closing */}
        <SheetClose ref={sheetCloseRef} className="hidden" />
        
        <nav className="mt-6 grid gap-2 px-6 pb-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <SheetClose asChild>
            <Link href="/" className={navItemClass("/")}>Home</Link>
          </SheetClose>
          {!role && (
            <>
              <SheetClose asChild>
                <Link href="/signin" className={navItemClass("/signin")}>Sign In</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/signup" className={navItemClass("/signup")}>Sign Up</Link>
              </SheetClose>
            </>
          )}
          {role === 'student' && (
            <SheetClose asChild>
              <Link href="/student" className={navItemClass("/student")}>Student App</Link>
            </SheetClose>
          )}
          {role === 'teacher' && (
            <SheetClose asChild>
              <Link href="/teacher" className={navItemClass("/teacher")}>Teacher App</Link>
            </SheetClose>
          )}
          {role === 'admin' && (
            <SheetClose asChild>
              <Link href="/admin" className={navItemClass("/admin")}>Admin Portal</Link>
            </SheetClose>
          )}
          <SheetClose asChild>
            <Link href="/games" className={navItemClass("/games")}>Games</Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/learn" className={navItemClass("/learn")}>Learn</Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/quizzes" className={navItemClass("/quizzes")}>Quizzes</Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/videos" className={navItemClass("/videos")}>Videos</Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/ecovision" className={navItemClass("/ecovision")}>EcoVision AI</Link>
          </SheetClose>
          {role === 'teacher' ? (
            <>
              <SheetClose asChild>
                <Link href="/teacher?tab=Assignments" className={navItemClass("/teacher?tab=Assignments")}>Assignments</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/teacher?tab=Announcements" className={navItemClass("/teacher?tab=Announcements")}>Announcements</Link>
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Link href="/assignments" className={navItemClass("/assignments")}>Assignments</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/announcements" className={navItemClass("/announcements")}>Announcements</Link>
              </SheetClose>
            </>
          )}
          <SheetClose asChild>
            <Link href="/leaderboard" className={navItemClass("/leaderboard")}>Leaderboard</Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/tasks" className={navItemClass("/tasks")}>Tasks</Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/contact" className={navItemClass("/contact")}>Contact & Help</Link>
          </SheetClose>
          
          {/* View Public Profile Option */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <Button
                onClick={() => setShowProfileInput(!showProfileInput)}
                className="w-full justify-start rounded-xl bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 border border-emerald-400/30"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              
              {showProfileInput && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Paste profile link or ID here"
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                  <Button
                    onClick={handleViewProfile}
                    className="w-full text-sm rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                    disabled={!profileId.trim()}
                  >
                    View Profile
                  </Button>
                  <p className="text-white/50 text-xs">
                    Paste the full shareable link or just the profile ID
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {!!role && (
            <SheetClose asChild>
              <button
                onClick={() => clear()}
                className="w-full justify-start rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:translate-x-1"
              >
                Sign Out
              </button>
            </SheetClose>
          )}
        </nav>
        <div className="pointer-events-none px-6 pb-3">
          <div className="flex items-center justify-center gap-2 text-white/40">
            <span className="text-lg animate-bounce">&#x2304;</span>
            <span className="text-lg animate-bounce" style={{ animationDelay: "140ms" }}>&#x2304;</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
