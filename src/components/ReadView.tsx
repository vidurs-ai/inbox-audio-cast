import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/stores/audioStore";
import { Play, Plus } from "lucide-react";

export const ReadView = () => {
  const { readEmails, addToQueue, playEmail } = useAudioStore();

  const handleReplay = (email: any) => {
    addToQueue(email);
    playEmail(email);
  };

  if (!readEmails.length) {
    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Read</h1>
        <Card className="p-6 text-center text-muted-foreground">
          No read emails yet. Finish listening to items from your queue and they’ll appear here.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Read</h1>
      <div className="space-y-2">
        {readEmails.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-foreground line-clamp-1">{item.subject}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.sender}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => addToQueue(item)}>
                  <Plus className="h-4 w-4 mr-1" /> Queue
                </Button>
                <Button size="sm" onClick={() => handleReplay(item)}>
                  <Play className="h-4 w-4 mr-1" /> Play
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
