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
    const { code } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    const origin = req.headers.get('origin') || 'https://a40028af-14d4-4078-a89d-803b3a984f7d.lovableproject.com';
    
    // Exchange code for tokens
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
        redirect_uri: `${origin}/auth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to exchange code for tokens');
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Failed to get user info:', userData);
      throw new Error('Failed to get user information');
    }

    console.log('Got user data from Google:', userData.email);

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(user => user.email === userData.email);

    let authUser;
    if (existingUser) {
      console.log('Updating existing user:', existingUser.id);
      // Update existing user's metadata with Gmail tokens
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: userData.name,
          avatar_url: userData.picture,
          email_verified: userData.verified_email,
          provider: 'google',
          gmail_tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in * 1000),
          }
        },
      });

      if (updateError) {
        console.error('Failed to update user:', updateError);
        throw new Error('Failed to update user account');
      }
      
      authUser = updateData.user;
    } else {
      console.log('Creating new user for:', userData.email);
      // Create new user
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          full_name: userData.name,
          avatar_url: userData.picture,
          email_verified: userData.verified_email,
          provider: 'google',
          gmail_tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in * 1000),
          }
        },
      });

      if (createError) {
        console.error('Failed to create user:', createError);
        throw new Error('Failed to create user account');
      }
      
      authUser = createData.user;
    }

    // Generate auth tokens for the client
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.email,
    });

    if (sessionError || !sessionData) {
      console.error('Failed to generate session:', sessionError);
      throw new Error('Failed to generate authentication session');
    }

    // Extract tokens from the magic link
    if (sessionData.properties?.action_link) {
      const magicLinkUrl = new URL(sessionData.properties.action_link);
      const hashParams = new URLSearchParams(magicLinkUrl.hash.substring(1));
      
      return new Response(JSON.stringify({
        access_token: hashParams.get('access_token'),
        refresh_token: hashParams.get('refresh_token'),
        expires_in: hashParams.get('expires_in'),
        user: authUser,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Failed to generate authentication tokens');
    }

  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(JSON.stringify({
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});