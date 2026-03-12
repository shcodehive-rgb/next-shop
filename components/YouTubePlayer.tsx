"use client";

interface YouTubePlayerProps {
    videoUrl: string;
    className?: string;
}

export default function YouTubePlayer({ videoUrl, className = "" }: YouTubePlayerProps) {
    // Extract YouTube video ID from URL
    const getYouTubeId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const videoId = getYouTubeId(videoUrl);
    
    if (!videoId) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 text-center ${className}`}>
                <p className="text-red-600 text-sm">
                    Invalid YouTube URL. Please provide a valid YouTube link.
                </p>
            </div>
        );
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

    return (
        <div className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 sm:border-4 border-emerald-50 bg-black ${className}`}>
            {/* Responsive video container with proper aspect ratio */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 'inherit'
                    }}
                />
            </div>
        </div>
    );
}
