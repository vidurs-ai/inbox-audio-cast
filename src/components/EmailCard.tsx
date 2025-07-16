import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
  isUnread: boolean;
}

interface EmailCardProps {
  email: Email;
}

export const EmailCard = ({ email }: EmailCardProps) => {
  const { addToQueue, playEmail } = useAudioStore();

  const handlePlayNow = () => {
    const emailData = {
      id: email.id,
      sender: email.sender,
      subject: email.subject,
      content: email.preview,
      isRead: false
    };
    playEmail(emailData);
  };

  const handleAddToQueue = () => {
    const emailData = {
      id: email.id,
      sender: email.sender,
      subject: email.subject,
      content: email.preview,
      isRead: false
    };
    addToQueue(emailData);
  };

  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start space-x-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground truncate">
              {email.sender}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {email.timestamp}
            </span>
          </div>
          
          <h4 className="text-sm font-medium text-foreground line-clamp-1">
            {email.subject}
          </h4>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {email.preview}
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            onClick={handlePlayNow}
          >
            <Play className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={handleAddToQueue}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};