import { EmailCard } from "@/components/EmailCard";

// Mock email data for development
const mockEmails = [
  {
    id: "1",
    sender: "Sarah Johnson",
    senderEmail: "sarah@company.com",
    subject: "Q4 Budget Review Meeting",
    preview: "Hi team, I'd like to schedule our quarterly budget review for next week...",
    timestamp: "2 min ago",
    isUnread: true,
  },
  {
    id: "2",
    sender: "GitHub",
    senderEmail: "notifications@github.com",
    subject: "New pull request in react-project",
    preview: "John Doe opened a new pull request: Fix authentication flow...",
    timestamp: "15 min ago",
    isUnread: true,
  },
  {
    id: "3",
    sender: "Dr. Emily Chen",
    senderEmail: "emily.chen@clinic.com",
    subject: "Appointment Confirmation",
    preview: "This confirms your appointment scheduled for Thursday, March 14th at 2:00 PM...",
    timestamp: "1 hour ago",
    isUnread: true,
  },
];

export const InboxView = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        <span className="text-sm text-muted-foreground">
          {mockEmails.length} unread
        </span>
      </div>
      
      <div className="space-y-3">
        {mockEmails.map((email) => (
          <EmailCard key={email.id} email={email} />
        ))}
      </div>
    </div>
  );
};