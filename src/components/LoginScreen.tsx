import { Button } from "@/components/ui/button";
import { Mail, Play } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const handleGoogleLogin = () => {
    const clientId = "YOUR_GOOGLE_CLIENT_ID"; // You'll need to set this
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "https://www.googleapis.com/auth/gmail.readonly";
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 bg-primary rounded-2xl">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="p-3 bg-secondary rounded-2xl">
            <Play className="h-8 w-8 text-secondary-foreground" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">InboxCast</h1>
          <p className="text-lg text-muted-foreground">
            Turn your inbox into a podcast
          </p>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium rounded-xl"
            size="lg"
          >
            Continue with Gmail
          </Button>
          
          <p className="text-sm text-muted-foreground px-4">
            We'll only access your unread emails to read them aloud. 
            No emails are stored or shared.
          </p>
        </div>
      </div>
    </div>
  );
};