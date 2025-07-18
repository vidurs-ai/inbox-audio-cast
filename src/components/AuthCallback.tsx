import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens via our edge function
        const response = await fetch(`${window.location.origin.replace('localhost:3000', 'bqazfwlwlatzmaibbvrr.supabase.co')}/functions/v1/gmail-oauth?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Authentication failed');
        }

        if (data.session_url) {
          // Use the session URL to authenticate
          window.location.href = data.session_url;
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with Gmail. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Authenticating with Gmail...</p>
      </div>
    </div>
  );
};