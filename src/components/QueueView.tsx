import { PlaybackControls } from "@/components/PlaybackControls";
import { QueueItem } from "@/components/QueueItem";

// Mock queue data for development
const mockQueue = [
  {
    id: "1",
    sender: "Sarah Johnson",
    subject: "Q4 Budget Review Meeting",
    duration: "2:30",
    isPlaying: true,
    progress: 45,
  },
  {
    id: "2",
    sender: "GitHub",
    subject: "New pull request in react-project",
    duration: "1:45",
    isPlaying: false,
    progress: 0,
  },
  {
    id: "3",
    sender: "Dr. Emily Chen",
    subject: "Appointment Confirmation",
    duration: "1:20",
    isPlaying: false,
    progress: 0,
  },
];

export const QueueView = () => {
  const currentEmail = mockQueue.find(item => item.isPlaying);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Queue</h1>
      
      {currentEmail && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="text-center space-y-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {currentEmail.subject}
              </h2>
              <p className="text-muted-foreground">{currentEmail.sender}</p>
            </div>
            <PlaybackControls 
              isPlaying={true}
              progress={currentEmail.progress}
              duration={currentEmail.duration}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">Up Next</h3>
        <div className="space-y-2">
          {mockQueue.filter(item => !item.isPlaying).map((item) => (
            <QueueItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};