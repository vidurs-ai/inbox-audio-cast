import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  progress: number;
  duration: string;
}

export const PlaybackControls = ({ isPlaying, progress, duration }: PlaybackControlsProps) => {
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.floor((progress / 100) * 150)}s</span>
          <span>{duration}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button size="icon" className="h-12 w-12 rounded-full">
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};