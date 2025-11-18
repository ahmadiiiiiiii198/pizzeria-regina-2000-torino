import React, { useState, useEffect } from 'react';
import { Play, Video, Youtube } from 'lucide-react';
import { youtubeService, YouTubeVideo } from '@/services/youtubeService';

const YouTubeSection = () => {
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Default content for fallback
  const defaultContent = {
    title: "Guarda Come Prepariamo le Nostre Pizze",
    description: "Scopri i segreti della nostra cucina e la passione che mettiamo nella preparazione di ogni pizza. Dal nostro forno a legna alla tua tavola.",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  };

  useEffect(() => {
    const loadVideoContent = async () => {
      try {
        setIsLoading(true);
        const video = await youtubeService.getFirstActiveVideo();

        if (video) {
          setCurrentVideo(video);
        } else {
          console.log('No active YouTube videos found, using default content');
        }
      } catch (error) {
        console.error('Error loading YouTube video:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoContent();
  }, []);

  // Get current video data or fallback to default
  const getVideoData = () => {
    if (currentVideo) {
      return {
        title: currentVideo.title,
        description: currentVideo.description,
        youtubeUrl: currentVideo.youtube_url,
        thumbnailUrl: currentVideo.thumbnail_url || youtubeService.getThumbnailUrl(currentVideo.youtube_url)
      };
    }
    return defaultContent;
  };

  const videoData = getVideoData();

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-8"></div>
              <div className="h-64 bg-gray-300 rounded-3xl max-w-5xl mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Youtube className="w-8 h-8 text-red-600" />
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                {videoData.title}
              </span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {videoData.description}
          </p>
        </div>

        {/* Video Container */}
        <div className="max-w-5xl mx-auto animate-fade-in-up animate-stagger-1">
          <div className="relative group">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-red-100 to-orange-100">
              {!showVideo ? (
                <>
                  {/* Video Thumbnail */}
                  <div className="relative">
                    <img
                      src={videoData.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-64 md:h-96 lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                      onLoad={() => setIsVideoLoaded(true)}
                      onError={(e) => {
                        // Fallback to default thumbnail
                        e.currentTarget.src = defaultContent.thumbnailUrl;
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setShowVideo(true)}
                        className="group/play bg-red-600 hover:bg-red-700 text-white rounded-full p-6 md:p-8 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-red-500/25 animate-pulse-glow"
                      >
                        <Play className="w-8 h-8 md:w-12 md:h-12 ml-1 group-hover/play:scale-110 transition-transform duration-300" fill="currentColor" />
                      </button>
                    </div>
                    
                    {/* Video Badge */}
                    <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce-gentle">
                      <div className="flex items-center space-x-2">
                        <Video className="w-4 h-4" />
                        <span>Video Esclusivo</span>
                      </div>
                    </div>
                    
                    {/* Duration Badge (placeholder) */}
                    <div className="absolute bottom-6 right-6 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      <span>3:45</span>
                    </div>
                  </div>
                </>
              ) : (
                /* YouTube Embed */
                <div className="relative pb-[56.25%] h-0 overflow-hidden">
                  <iframe
                    src={youtubeService.getEmbedUrl(videoData.youtubeUrl)}
                    title={videoData.title}
                    className="absolute top-0 left-0 w-full h-full rounded-3xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
          
          {/* Video Info */}
          <div className="mt-8 text-center animate-fade-in-up animate-stagger-2">
            {/* Pizza Design Animation - No Text */}
            <div className="flex items-center justify-center space-x-6 md:space-x-12 py-6">
              {/* Animated Pizza Elements */}
              <div className="relative">
                <div className="text-5xl md:text-6xl animate-pizza-spin">🍕</div>
                <div className="absolute -top-2 -right-2 text-xl md:text-2xl animate-bounce">🔥</div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="text-3xl md:text-4xl animate-pizza-ingredients-dance">🍅</div>
                <div className="text-2xl md:text-3xl animate-pizza-ingredients-dance animation-delay-1000">🧀</div>
              </div>

              <div className="relative">
                <div className="text-4xl md:text-5xl animate-pizza-ingredients-dance animation-delay-2000">🌿</div>
                <div className="absolute -bottom-1 -left-1 text-xl md:text-2xl animate-sparkle-twinkle">✨</div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="text-3xl md:text-4xl animate-chef-cooking">👨‍🍳</div>
                <div className="text-2xl md:text-3xl animate-pizza-ingredients-dance animation-delay-4000">🥄</div>
              </div>

              <div className="relative">
                <div className="text-5xl md:text-6xl animate-pizza-spin animation-delay-2000">🍕</div>
                <div className="absolute -top-2 -left-2 text-xl md:text-2xl animate-sparkle-twinkle animation-delay-1000">⭐</div>
              </div>
            </div>
            
            {!showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="mt-6 bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:from-red-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Guarda il Video</span>
                </span>
              </button>
            )}
          </div>
        </div>
        
        {/* Animated Logo Section */}
        <div className="mt-16 flex justify-center animate-fade-in-up animate-stagger-3">
          <div className="relative">
            {/* Main Logo with Animation */}
            <div className="relative group">
              <img
                src="/logo.png"
                alt="Pizzeria Regina 2000 Torino Logo"
                className="h-48 md:h-64 lg:h-80 w-auto object-contain animate-logo-float-rotate hover:animate-logo-glow-pulse transition-all duration-500 filter drop-shadow-2xl group-hover:drop-shadow-3xl cursor-pointer"
                onError={(e) => {
                  // Try alternative logo paths in order of preference
                  const alternatives = [
                    '/flegrea-logo.png',
                    '/pizzeria-regina-logo.png',
                    '/lovable-uploads/72b893e6-73f5-4bd7-b55c-1b555cee0e99.png',
                    '/lovable-uploads/44e4c09e-3903-45ca-ad9a-3f959538961b.png',
                    '/lovable-uploads/37fe252a-4e9e-4c35-ab69-05ac659f434b.png'
                  ];

                  const currentSrc = e.currentTarget.src;
                  const currentIndex = alternatives.findIndex(alt => currentSrc.includes(alt.split('/').pop()));
                  const nextAlt = alternatives[currentIndex + 1];

                  if (nextAlt) {
                    console.log(`🔄 Trying alternative logo: ${nextAlt}`);
                    e.currentTarget.src = nextAlt;
                  } else {
                    // All alternatives failed, show beautiful fallback
                    console.log('🍕 Using animated pizza fallback');
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />

              {/* Fallback Pizza Logo */}
              <div className="hidden flex-col items-center justify-center h-48 md:h-64 lg:h-80 w-48 md:w-64 lg:w-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full backdrop-blur-sm border-4 border-yellow-400/30">
                <div className="text-8xl md:text-9xl animate-pizza-spin">🍕</div>
                <div className="text-2xl md:text-3xl font-bold text-red-600 mt-4 font-serif">Regina 2000</div>
              </div>

              {/* Animated Elements Around Logo */}
              <div className="absolute -top-4 -left-4 text-3xl animate-sparkle-twinkle">✨</div>
              <div className="absolute -top-2 -right-6 text-2xl animate-bounce animation-delay-1000">🔥</div>
              <div className="absolute -bottom-4 -left-6 text-3xl animate-sparkle-twinkle animation-delay-2000">⭐</div>
              <div className="absolute -bottom-2 -right-4 text-2xl animate-bounce animation-delay-3000">🍅</div>
              <div className="absolute top-1/2 -left-8 text-2xl animate-pizza-ingredients-dance animation-delay-4000">🌿</div>
              <div className="absolute top-1/2 -right-8 text-2xl animate-pizza-ingredients-dance animation-delay-5000">🧀</div>
            </div>

            {/* Glowing Ring Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 blur-xl animate-pulse-glow -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
