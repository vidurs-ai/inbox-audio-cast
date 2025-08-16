import { useEffect, useState } from "react";
import { EmailCard } from "@/components/EmailCard";
import { EmailPreview } from "@/components/EmailPreview";
import { supabase } from "@/integrations/supabase/client";
import { listUnreadEmails, type GmailEmail } from "@/services/GmailService";
import { useToast } from "@/components/ui/use-toast";

export const InboxView = () => {
  const [emails, setEmails] = useState<GmailEmail[] | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = (session as any)?.provider_token as string | undefined;
      if (!accessToken) {
        setEmails([]);
        return;
      }
      try {
        const res = await listUnreadEmails(accessToken);
        setEmails(res);
      } catch (e: any) {
        toast({ title: "Failed to load Gmail", description: e?.message ?? String(e), variant: "destructive" });
        setEmails([]);
      }
    };
    load();
  }, [toast]);

  const unreadCount = emails?.length ?? 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        <span className="text-sm text-muted-foreground">
          {unreadCount} unread
        </span>
      </div>
      
      {selectedEmail ? (
        <EmailPreview 
          email={selectedEmail} 
          onClose={() => setSelectedEmail(null)} 
        />
      ) : (
        <div className="space-y-3">
          {(emails ?? []).map((email) => (
            <EmailCard 
              key={email.id} 
              email={email} 
              onClick={() => setSelectedEmail(email)}
            />
          ))}
          {emails !== null && emails.length === 0 && (
            <p className="text-muted-foreground text-sm">No unread messages found.</p>
          )}
        </div>
      )}
    </div>
  );
};