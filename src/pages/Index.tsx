import { useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { TabNavigation } from "@/components/TabNavigation";
import { InboxView } from "@/components/InboxView";
import { QueueView } from "@/components/QueueView";
import { SettingsView } from "@/components/SettingsView";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
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