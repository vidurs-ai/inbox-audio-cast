import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Play, Plus } from "lucide-react";
import { GmailEmail } from "@/services/GmailService";
import { useAudioStore } from "@/stores/audioStore";

interface EmailPreviewProps {
  email: GmailEmail;
  onClose: () => void;
}

export const EmailPreview = ({ email, onClose }: EmailPreviewProps) => {
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
    <Card className="w-full bg-card/95 supports-[backdrop-filter]:backdrop-blur-sm border shadow-lg animate-scale-in">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1 pr-4">
          <CardTitle className="text-lg font-semibold">{email.subject}</CardTitle>
          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            <span>From: {email.sender}</span>
            <span>{email.senderEmail}</span>
            <span>{email.timestamp}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {email.preview}
          </p>
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handlePlayNow} className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            Play Now
          </Button>
          <Button variant="outline" onClick={handleAddToQueue} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add to Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};