import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Play, Plus, Sparkles } from "lucide-react";
import { GmailEmail, processEmailWithAI } from "@/services/GmailService";
import { useAudioStore } from "@/stores/audioStore";
import { useState, useEffect } from "react";

interface EmailPreviewProps {
  email: GmailEmail;
  onClose: () => void;
}

export const EmailPreview = ({ email, onClose }: EmailPreviewProps) => {
  const { addToQueue, playEmail } = useAudioStore();
  const [processedContent, setProcessedContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processEmail = async () => {
      if (email.fullContent && email.fullContent.length > 200) {
        setIsProcessing(true);
        try {
          const processed = await processEmailWithAI(
            email.fullContent,
            email.subject,
            email.sender
          );
          setProcessedContent(processed);
        } catch (error) {
          console.error('Failed to process email:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    processEmail();
  }, [email.fullContent, email.subject, email.sender]);

  const getEmailContent = () => {
    return processedContent || email.fullContent || email.preview;
  };

  const handlePlayNow = () => {
    const emailData = {
      id: email.id,
      sender: email.sender,
      subject: email.subject,
      content: getEmailContent(),
      isRead: false
    };
    playEmail(emailData);
  };

  const handleAddToQueue = () => {
    const emailData = {
      id: email.id,
      sender: email.sender,
      subject: email.subject,
      content: getEmailContent(),
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
        {processedContent && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-enhanced content</span>
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4 animate-spin text-primary" />
            <span>Processing with AI...</span>
          </div>
        )}
        <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {getEmailContent()}
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