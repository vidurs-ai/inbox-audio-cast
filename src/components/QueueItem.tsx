import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";

interface QueueItemData {
  id: string;
  sender: string;
  subject: string;
  duration: string;
  isPlaying: boolean;
  progress: number;
}

interface QueueItemProps {
  item: QueueItemData;
}

export const QueueItem = ({ item }: QueueItemProps) => {
  return (
    <Card className="p-3">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-medium text-foreground line-clamp-1">
            {item.subject}
          </h4>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{item.sender}</p>
            <span className="text-xs text-muted-foreground">{item.duration}</span>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
          <X className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    </Card>
  );
};