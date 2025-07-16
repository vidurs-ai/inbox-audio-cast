import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Play } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";

interface QueueItemData {
  id: string;
  sender: string;
  subject: string;
  content: string;
  isRead: boolean;
}

interface QueueItemProps {
  item: QueueItemData;
}

export const QueueItem = ({ item }: QueueItemProps) => {
  const { removeFromQueue, playEmail, currentEmailId } = useAudioStore();
  const isCurrentlyPlaying = currentEmailId === item.id;

  const handlePlay = () => {
    playEmail(item);
  };

  const handleRemove = () => {
    removeFromQueue(item.id);
  };

  return (
    <Card className={`p-3 ${isCurrentlyPlaying ? 'border-primary bg-primary/5' : ''}`}>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-medium text-foreground line-clamp-1">
            {item.subject}
          </h4>
          <p className="text-xs text-muted-foreground">{item.sender}</p>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 p-0"
            onClick={handlePlay}
          >
            <Play className="h-3 w-3 text-muted-foreground" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </Card>
  );
};