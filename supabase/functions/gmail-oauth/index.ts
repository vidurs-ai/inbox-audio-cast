import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/gmail-oauth`;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error_description}`);
    }

    // Get user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    if (!profile.email) {
      throw new Error('No email received from Google');
    }

    // Try to get existing user first
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(user => user.email === profile.email);

    let authData;
    if (existingUser) {
      // Update existing user's metadata
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: profile.name,
          avatar_url: profile.picture,
          provider: 'google',
          gmail_tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in * 1000),
          },
        },
      });
      
      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update user');
      }
      authData = updateData;
    } else {
      // Create new user
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: profile.email,
        email_confirm: true,
        user_metadata: {
          full_name: profile.name,
          avatar_url: profile.picture,
          provider: 'google',
          gmail_tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in * 1000),
          },
        },
      });

      if (createError) {
        console.error('Create error:', createError);
        throw new Error('Failed to create user');
      }
      authData = createData;
    }

    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
    });

    if (sessionError) {
      throw new Error('Failed to generate session');
    }

    // Extract the tokens from the magic link and redirect to our app URL
    const appUrl = 'https://a40028af-14d4-4078-a89d-803b3a984f7d.lovableproject.com/';
    if (sessionData.properties?.action_link) {
      const magicLinkUrl = new URL(sessionData.properties.action_link);
      const hashParams = magicLinkUrl.hash.substring(1); // Remove the #
      
      // Redirect to our app with the auth tokens
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${appUrl}#${hashParams}`,
        },
      });
    } else {
      // Fallback: redirect to the app homepage
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': appUrl,
        },
      });
    }

  } catch (error) {
    console.error('Gmail OAuth error:', error);
    return new Response(JSON.stringify({
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});