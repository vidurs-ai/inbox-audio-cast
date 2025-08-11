import { Inbox, List, Settings, BookOpen } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "queue", label: "Queue", icon: List },
    { id: "read", label: "Read", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/70 supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="max-w-xl mx-auto flex items-center justify-around py-3 px-2 pb-[calc(env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center py-2 px-5 rounded-2xl transition-colors hover-scale ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[11px] font-medium mt-1">{tab.label}</span>
              {isActive && (
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};