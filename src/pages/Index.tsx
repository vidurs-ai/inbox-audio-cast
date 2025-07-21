import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { TabNavigation } from "@/components/TabNavigation";
import { InboxView } from "@/components/InboxView";
import { QueueView } from "@/components/QueueView";
import { SettingsView } from "@/components/SettingsView";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inbox");

  useEffect(() => {
    const handleAuth = async () => {
      // Check if we have auth tokens in the URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in');
      const tokenType = hashParams.get('token_type');

      if (accessToken && refreshToken) {
        console.log('Found auth tokens in URL hash, setting session...');
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Session set successfully:', data);
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (error) {
          console.error('Error processing auth tokens:', error);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Handle auth tokens first, then check for existing session
    handleAuth().then(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Initial session check:', session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={() => {}} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "inbox":
        return <InboxView />;
      case "queue":
        return <QueueView />;
      case "settings":
        return <SettingsView />;
      default:
        return <InboxView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20">
        {renderActiveView()}
      </main>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;