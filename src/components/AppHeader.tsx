import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Play, Search, User } from "lucide-react";

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/60 supports-[backdrop-filter]:backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between animate-fade-in">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary">
            <Mail className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="p-2 rounded-xl bg-secondary">
            <Play className="h-5 w-5 text-secondary-foreground" />
          </div>
          <span className="ml-2 text-sm font-semibold tracking-tight">InboxCast</span>
        </div>

        {/* Search (placeholder) */}
        <div className="hidden md:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails (coming soon)"
              className="pl-9 rounded-xl"
              disabled
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="rounded-full pl-2 pr-3">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>
      </div>
    </header>
  );
};
