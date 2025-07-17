import { Button } from "@/components/ui/button";
import { Mail, Play } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const handleGoogleLogin = async () => {
    try {
      // Get the auth URL from our edge function
      const response = await fetch(`https://bqazfwlwlatzmaibbvrr.supabase.co/functions/v1/auth-google`, {
        method: 'GET',
      });

      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get auth URL');
      }
    } catch (error) {
      console.error('Error initiating Google auth:', error);
    }
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