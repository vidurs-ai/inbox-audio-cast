import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipBack, SkipForward, Loader2 } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";

export const PlaybackControls = () => {
  const { 
    isPlaying, 
    progress, 
    duration, 
    isLoading,
    play, 
    pause, 
    playNext, 
    playPrevious, 
    seekTo 
  } = useAudioStore();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={duration ? (progress / duration) * 100 : 0} 
          className="w-full cursor-pointer"
          onClick={(e) => {
            if (duration) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = clickX / rect.width;
              const newTime = percentage * duration;
              handleSeek([newTime]);
            }
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10"
          onClick={playPrevious}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full"
          onClick={handlePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10"
          onClick={playNext}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};