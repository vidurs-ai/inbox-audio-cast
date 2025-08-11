import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { TabNavigation } from "@/components/TabNavigation";
import { InboxView } from "@/components/InboxView";
import { QueueView } from "@/components/QueueView";
import { SettingsView } from "@/components/SettingsView";
import { ReadView } from "@/components/ReadView";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { AppHeader } from "@/components/AppHeader";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");

  useEffect(() => {
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
    });

    // Then get current session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "inbox":
        return <InboxView />;
      case "queue":
        return <QueueView />;
      case "read":
        return <ReadView />;
      case "settings":
        return <SettingsView />;
      default:
        return <InboxView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/10 to-background">
      <AppHeader />
      <main className="flex-1 pb-24 container mx-auto px-4 pt-4 animate-fade-in">
        {renderActiveView()}
      </main>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;