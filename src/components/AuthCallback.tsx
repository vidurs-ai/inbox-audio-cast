import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase parses hash params and sets the session automatically.
    // We just wait a tick and redirect to home.
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/", { replace: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-foreground">Signing you in…</h1>
        <p className="text-muted-foreground">Please wait while we complete authentication.</p>
      </div>
    </div>
  );
}
