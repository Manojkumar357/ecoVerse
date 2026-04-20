import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import SignupAnimatedBackground from "@/components/SignupAnimatedBackground";
import { Play, Clock, Eye, ThumbsUp, BookOpen, Star, Award, Zap, TrendingUp } from "lucide-react";

// Fallback images for different environmental topics
const FALLBACK_IMAGES: Record<string, string> = {
  'Green Living': '/api/image/nature-319.jpg',
  'Forest Conservation': '/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg',
  'Transportation': '/api/image/ai-generated-earth-globe-illustration-animation-horizontal-with-plants-copy-space-banner-ecological-earth-day-hour-safe-clouds-clear-trees-mountains-environmental-problems-on-blue-background-free-video.jpg',
  'Air Quality': '/api/image/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg',
  'Marine Life': '/api/image/360_F_819000674_C4KBdZyevZiKOZUXUqDnx7Vq1Hjskq3g.jpg',
  'Biodiversity': '/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg',
  'Renewable Energy': '/api/image/golden-sunset-hd-backgrounds-captivatings-for-serene-scenes-photo.jpg',
  'Waste Management': '/api/image/360_F_628835191_EMMgdwXxjtd3yLBUguiz5UrxaxqByvUc.jpg',
  'Water Conservation': '/api/image/background-pictures-nature-hd-images-1920x1200-wallpaper-preview.jpg',
  'Climate Change': '/api/image/b1573252592009209d45a186360dea8c.jpg',
  'Agriculture': '/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg',
  'General': '/api/image/1080p-nature-background-nfkrrkh7da3eonyn.jpg'
};

// Function to get appropriate fallback image based on video category or title keywords
const getFallbackImage = (category: string, title: string): string => {
  // Direct category match
  if (FALLBACK_IMAGES[category]) {
    return FALLBACK_IMAGES[category];
  }
  
  // Title-based matching for better context
  const titleLower = title.toLowerCase();
  if (titleLower.includes('ocean') || titleLower.includes('marine') || titleLower.includes('sea')) {
    return FALLBACK_IMAGES['Marine Life'];
  }
  if (titleLower.includes('forest') || titleLower.includes('tree') || titleLower.includes('deforestation')) {
    return FALLBACK_IMAGES['Forest Conservation'];
  }
  if (titleLower.includes('energy') || titleLower.includes('solar') || titleLower.includes('wind')) {
    return FALLBACK_IMAGES['Renewable Energy'];
  }
  if (titleLower.includes('air') || titleLower.includes('pollution') || titleLower.includes('atmosphere')) {
    return FALLBACK_IMAGES['Air Quality'];
  }
  if (titleLower.includes('water') || titleLower.includes('rain') || titleLower.includes('river')) {
    return FALLBACK_IMAGES['Water Conservation'];
  }
  if (titleLower.includes('waste') || titleLower.includes('recycle') || titleLower.includes('garbage')) {
    return FALLBACK_IMAGES['Waste Management'];
  }
  if (titleLower.includes('climate') || titleLower.includes('global warming') || titleLower.includes('greenhouse')) {
    return FALLBACK_IMAGES['Climate Change'];
  }
  if (titleLower.includes('farming') || titleLower.includes('agriculture') || titleLower.includes('food')) {
    return FALLBACK_IMAGES['Agriculture'];
  }
  if (titleLower.includes('transport') || titleLower.includes('electric') || titleLower.includes('vehicle')) {
    return FALLBACK_IMAGES['Transportation'];
  }
  if (titleLower.includes('eco') || titleLower.includes('green') || titleLower.includes('sustainable')) {
    return FALLBACK_IMAGES['Green Living'];
  }
  
  // Default fallback
  return FALLBACK_IMAGES['General'];
};

// Function to check if a YouTube thumbnail exists and get the best quality available
const getYouTubeThumbnail = async (videoId: string): Promise<string | null> => {
  const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];
  
  for (const quality of qualities) {
    try {
      const url = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      // Continue to next quality
    }
  }
  
  return null; // No valid thumbnail found
};

// Component for video thumbnail with fallback handling
const VideoThumbnail = ({ video, className }: { video: Video, className?: string }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(video.thumbnail);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      const fallbackUrl = getFallbackImage(video.category || 'General', video.title || '');
      setThumbnailUrl(fallbackUrl);
    }
  };

  return (
    <div 
      className={`w-full h-full bg-cover bg-center transition-transform group-hover:scale-110 ${className || ''}`}
      style={{ backgroundImage: `url(${thumbnailUrl})` }}
    >
      {/* Hidden image to trigger onError */}
      <img 
        src={thumbnailUrl} 
        alt={video.title}
        style={{ display: 'none' }}
        onError={handleImageError}
      />
    </div>
  );
};

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: number;
  likes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  embedUrl: string;
  educationalPoints: string[];
  credits: number; // Credits earned for watching this video
  uploadedBy?: string; // Teacher/Admin who uploaded
  uploadDate?: string;
}

const formatDuration = (duration?: number | string | null): string => {
  if (typeof duration === 'string' && duration.trim()) return duration.trim();
  const totalSeconds = Number(duration);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 'N/A';
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export default function VideosPage() {
  const { role, username } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [watchHistory, setWatchHistory] = useState<string[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [showCreditsAnimation, setShowCreditsAnimation] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Load videos from API
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/videos');
        if (response.ok) {
          const data = await response.json();
          // Transform API data to match our Video interface
          const transformedVideos = await Promise.all(data.map(async (video: any) => {
            // Extract YouTube video ID
            const extractVideoId = (url: string) => {
              if (!url) return null;
              const match = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
              return match ? match[1] : null;
            };

            // Backward compatibility: some older uploads stored no `url` due payload mismatch.
            // Recover YouTube source from thumbnail URL when possible.
            const extractVideoIdFromThumbnail = (thumb: string) => {
              if (!thumb) return null;
              const match = thumb.match(/img\.youtube\.com\/vi\/([\w-]{11})\//);
              return match ? match[1] : null;
            };

            let sourceUrl = video.url || '';
            if (!sourceUrl && video.type === 'youtube') {
              const thumbId = extractVideoIdFromThumbnail(video.thumbnail || '');
              if (thumbId) {
                sourceUrl = `https://www.youtube.com/watch?v=${thumbId}`;
              }
            }
            
            // Generate thumbnail URL with robust fallback system
            let thumbnailUrl = video.thumbnail;
            
            // If no thumbnail exists, try to get YouTube thumbnail
            if (!thumbnailUrl && sourceUrl && sourceUrl.includes('youtube')) {
              const videoId = extractVideoId(sourceUrl);
              if (videoId) {
                // Try different YouTube thumbnail qualities
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
              }
            }
            
            // If still no thumbnail, use category-based fallback
            if (!thumbnailUrl) {
              thumbnailUrl = getFallbackImage(video.category || 'General', video.title || '');
            }
            
            // Generate embed URL
            let embedUrl = sourceUrl;
            if (sourceUrl && sourceUrl.includes('youtube')) {
              const videoId = extractVideoId(sourceUrl);
              if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
              }
            }

            let durationLabel = formatDuration(video.duration);
            if (durationLabel === 'N/A' && sourceUrl && sourceUrl.includes('youtube')) {
              try {
                const metaRes = await fetch('/api/videos/youtube-metadata', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: sourceUrl })
                });
                if (metaRes.ok) {
                  const meta = await metaRes.json();
                  durationLabel = formatDuration(meta?.duration);
                }
              } catch {
                // Keep fallback label when metadata request fails.
              }
            }
            
            return {
              id: video.id,
              title: video.title,
              description: video.description,
              thumbnail: thumbnailUrl,
              duration: durationLabel,
              category: video.category || "General",
              views: Math.floor(Math.random() * 20000) + 1000, // Mock data for views
              likes: Math.floor(Math.random() * 2000) + 100, // Mock data for likes  
              difficulty: video.difficulty || "Beginner",
              credits: video.credits || 1,
              embedUrl: embedUrl,
              educationalPoints: [
                "Learn about environmental concepts",
                "Understand sustainability practices", 
                "Discover eco-friendly solutions",
                "Apply knowledge to daily life"
              ],
              uploadedBy: video.uploadedBy,
              uploadDate: new Date(video.uploadedAt).toLocaleDateString()
            };
          }));
          setVideos(transformedVideos);
        }
      } catch (error) {
        console.error('Failed to load videos:', error);
        // Fallback to sample data if API fails
        setVideos(sampleVideos);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Sample video data - fallback if API fails
  const sampleVideos: Video[] = [
    {
      id: "1",
      title: "Climate Change Explained",
      description: "Understanding the science behind global warming and its impacts on our planet.",
      thumbnail: "/api/image/360_F_819000674_C4KBdZyevZiKOZUXUqDnx7Vq1Hjskq3g.jpg",
      duration: "12:45",
      category: "Climate Change",
      views: 15420,
      likes: 1240,
      difficulty: "Beginner",
      credits: 2,
      embedUrl: "https://www.youtube.com/embed/G4H1N_yXBiA",
      educationalPoints: [
        "Greenhouse effect and greenhouse gases",
        "Human activities contributing to climate change",
        "Evidence of global warming",
        "Impacts on weather patterns and ecosystems"
      ]
    },
    {
      id: "2",
      title: "Renewable Energy Sources",
      description: "Exploring solar, wind, hydro, and other clean energy alternatives.",
      thumbnail: "/api/image/golden-sunset-hd-backgrounds-captivatings-for-serene-scenes-photo.jpg",
      duration: "18:30",
      category: "Renewable Energy",
      views: 8965,
      likes: 780,
      difficulty: "Intermediate",
      credits: 2,
      embedUrl: "https://www.youtube.com/embed/1kUE0BZtTRc",
      educationalPoints: [
        "Types of renewable energy sources",
        "How solar panels and wind turbines work",
        "Environmental benefits vs traditional energy",
        "Future of renewable energy technology"
      ]
    },
    {
      id: "3",
      title: "Ocean Pollution Crisis",
      description: "The devastating impact of plastic waste on marine ecosystems.",
      thumbnail: "/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg",
      duration: "15:20",
      category: "Ocean Conservation",
      views: 12380,
      likes: 950,
      difficulty: "Beginner",
      credits: 1,
      embedUrl: "https://www.youtube.com/embed/HQTUWK7CM-Y",
      educationalPoints: [
        "Sources of ocean pollution",
        "Impact on marine life and food chains",
        "Microplastics in our food system",
        "Solutions and prevention strategies"
      ]
    },
    {
      id: "4",
      title: "Sustainable Agriculture",
      description: "How modern farming can be both productive and environmentally friendly.",
      thumbnail: "/api/image/pexels-thatguycraig000-1563356.jpg",
      duration: "22:15",
      category: "Agriculture",
      views: 6750,
      likes: 520,
      difficulty: "Advanced",
      credits: 2,
      embedUrl: "https://www.youtube.com/embed/7brNT7f6kUw",
      educationalPoints: [
        "Principles of sustainable farming",
        "Organic vs conventional agriculture",
        "Soil health and biodiversity",
        "Water conservation in agriculture"
      ]
    },
    {
      id: "5",
      title: "Wildlife Conservation Success Stories",
      description: "Inspiring examples of species recovery and habitat restoration.",
      thumbnail: "/api/image/1080p-nature-background-nfkrrkh7da3eonyn.jpg",
      duration: "16:45",
      category: "Wildlife",
      views: 9840,
      likes: 1100,
      difficulty: "Beginner",
      credits: 1,
      embedUrl: "https://www.youtube.com/embed/lw5LjmVWqb8",
      educationalPoints: [
        "Endangered species recovery programs",
        "Habitat restoration techniques",
        "Role of national parks and reserves",
        "Community involvement in conservation"
      ]
    },
    {
      id: "6",
      title: "Green Building and Architecture",
      description: "Designing buildings that are energy-efficient and environmentally sustainable.",
      thumbnail: "/api/image/background-pictures-nature-hd-images-1920x1200-wallpaper-preview.jpg",
      duration: "19:30",
      category: "Green Technology",
      views: 5230,
      likes: 410,
      difficulty: "Intermediate",
      credits: 2,
      embedUrl: "https://www.youtube.com/embed/TUwOlEwSUMI",
      educationalPoints: [
        "Green building certification systems",
        "Energy-efficient design principles",
        "Sustainable building materials",
        "Smart home technology for energy savings"
      ]
    }
  ];

  const categories = ["All", ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredVideos = selectedCategory === "All" 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  // Load user credits and watch status on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (username) {
        try {
          const response = await fetch(`/api/users/${username}/credits`);
          if (response.ok) {
            const data = await response.json();
            setUserCredits(Number(data.totalCredits ?? data.credits ?? 0));
            setWatchedVideos(new Set(Array.isArray(data.watchedVideos) ? data.watchedVideos : []));
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }
    };
    loadUserData();
  }, [username]);

  const awardCredits = async (video: Video) => {
    if (!username || watchedVideos.has(video.id)) return;

    try {
      const response = await fetch('/api/videos/award-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Username': username
        },
        body: JSON.stringify({
          username,
          videoId: video.id,
          credits: video.credits
        })
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({} as any));
        if (result?.success) {
          const awarded = Number(result?.creditsAwarded ?? 0);
          if (awarded > 0) {
            setUserCredits(prev => prev + awarded);
            setWatchedVideos(prev => new Set([...prev, video.id]));
            setShowCreditsAnimation(video.id);
          }
        }
        
        // Hide animation after 3 seconds
        setTimeout(() => {
          setShowCreditsAnimation(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to award credits:', error);
    }
  };

  // Helper to extract YouTube video ID
  function extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }

  // Helper to get YouTube thumbnail
  function getYouTubeThumbnail(url: string): string {
    const id = extractYouTubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';
  }

  const watchVideo = async (video: Video) => {
    // Fallback to YouTube thumbnail if missing
    let thumb = video.thumbnail;
    if ((!thumb || thumb.trim() === '') && video.embedUrl && video.embedUrl.includes('youtube')) {
      thumb = getYouTubeThumbnail(video.embedUrl);
    }
    setSelectedVideo({ ...video, thumbnail: thumb });

    // Add to watch history if not already there
    if (!watchHistory.includes(video.id)) {
      const newHistory = [...watchHistory, video.id];
      setWatchHistory(newHistory);
      // Award credits if video not watched before
      setTimeout(() => {
        awardCredits(video);
      }, 30000); // Award credits after 30 seconds of watching
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <SignupAnimatedBackground elementCount={20} className="text-white">
      {/* Add custom CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 1s ease-out;
          }
          
          .animate-pulse-slow {
            animation: pulse 2s infinite;
          }
          
          .hover-glow:hover {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
        `
      }} />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white/90 animate-fade-in">Environmental Videos</h1>
              <p className="mt-1 text-white/70">Educational content for environmental awareness and action</p>
            </div>
            <div className="flex items-center gap-4">
              {role && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-lg border border-yellow-400/30">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-white/90 font-semibold">{userCredits} Credits</span>
                </div>
              )}
              <div className="text-sm text-white/70">
                {role && <span>Welcome, {username}!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white/90">{selectedVideo.title}</h2>
                <Button 
                  variant="secondary" 
                  onClick={() => setSelectedVideo(null)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  ✕
                </Button>
              </div>
              <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                {/* Support both YouTube and file videos */}
                {selectedVideo.embedUrl && selectedVideo.embedUrl.includes('youtube') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={selectedVideo.embedUrl}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : selectedVideo.embedUrl ? (
                  <video controls className="w-full h-full">
                    <source src={selectedVideo.embedUrl} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/40 text-white">No video available</div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-2">Description</h3>
                  <p className="text-white/70 mb-4">{selectedVideo.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {selectedVideo.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={16} />
                      {selectedVideo.likes.toLocaleString()} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {selectedVideo.duration}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-2 flex items-center gap-2">
                    <BookOpen size={20} />
                    Learning Points
                  </h3>
                  <ul className="space-y-2">
                    {selectedVideo.educationalPoints.map((point, index) => (
                      <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-4 mb-6 hover-glow">
          <h3 className="text-lg font-semibold text-white/90 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category 
                    ? "bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/80 hover:to-purple-600/80 text-white border border-blue-400/50 shadow-lg animate-pulse-slow"
                    : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white/90 mb-2">Loading Videos...</h3>
            <p className="text-white/70">Please wait while we fetch the latest educational content.</p>
          </div>
        ) : (
          <>
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => {
            return (
              <div 
                key={video.id} 
                className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl overflow-hidden hover:bg-white/20 transition-all cursor-pointer group transform hover:scale-105 hover:shadow-2xl relative"
                onClick={() => watchVideo(video)}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
              {/* Credits Animation */}
              {showCreditsAnimation === video.id && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    <span className="font-bold">+{video.credits} Credits!</span>
                    <Zap className="h-6 w-6" />
                  </div>
                </div>
              )}
              
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <VideoThumbnail video={video} />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="h-8 w-8 text-white drop-shadow-lg" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {video.credits}
                </div>
                {watchedVideos.has(video.id) && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Completed
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(video.difficulty)}`}>
                    {video.difficulty}
                  </span>
                  <span className="text-xs text-white/60">{video.category}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-white/90 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {video.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={12} />
                    {video.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {filteredVideos.length === 0 && !loading && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-white/90 mb-2">No videos found</h3>
            <p className="text-white/70">Try selecting a different category or check back later for new content.</p>
          </div>
        )}

        {/* Watch History for authenticated users */}
        {role && watchHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-white/90 mb-3">Your Watch History</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {watchHistory.map((videoId) => {
                const video = videos.find(v => v.id === videoId);
                if (!video) return null;
                return (
                  <div 
                    key={videoId}
                    className="cursor-pointer group"
                    onClick={() => watchVideo(video)}
                  >
                    <div className="aspect-video bg-cover bg-center rounded-lg mb-1 group-hover:scale-105 transition-transform">
                      <VideoThumbnail video={video} className="rounded-lg" />
                      <div className="w-full h-full bg-black/20 rounded-lg flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" fill="white" />
                      </div>
                    </div>
                    <p className="text-xs text-white/80 line-clamp-2">{video.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </SignupAnimatedBackground>
  );
}