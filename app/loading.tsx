import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* اللوغو كيدور */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-75"></div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
        
        <p className="animate-pulse text-sm font-bold text-gray-500">
          جاري التحميل... (Loading)
        </p>
      </div>
    </div>
  );
}
