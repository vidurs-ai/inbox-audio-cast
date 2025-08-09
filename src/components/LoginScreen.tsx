import { Button } from "@/components/ui/button";
import { Mail, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const LoginScreen = () => {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid",
    ].join(" ");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes,
        queryParams: { access_type: "offline", prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data?.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast({ title: "Continue in new tab", description: "Finish Google sign-in, you'll be redirected back." });
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
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base font-medium rounded-xl"
            size="lg"
          >
            Continue with Google
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