import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const gmailTokens = user.user_metadata?.gmail_tokens;
    if (!gmailTokens) {
      throw new Error('No Gmail tokens found');
    }

    let accessToken = gmailTokens.access_token;

    // Check if token is expired and refresh if needed
    if (Date.now() >= gmailTokens.expires_at) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          refresh_token: gmailTokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        accessToken = refreshData.access_token;
        
        // Update user metadata with new token
        await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            gmail_tokens: {
              ...gmailTokens,
              access_token: accessToken,
              expires_at: Date.now() + (refreshData.expires_in * 1000),
            },
          },
        });
      }
    }

    // Fetch unread emails from Gmail
    const messagesResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const messagesData = await messagesResponse.json();
    
    if (!messagesResponse.ok) {
      throw new Error(`Gmail API error: ${messagesData.error?.message}`);
    }

    const emails = [];
    
    // Fetch details for each message
    for (const message of messagesData.messages || []) {
      const messageResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const messageData = await messageResponse.json();
      
      if (messageResponse.ok) {
        const headers = messageData.payload.headers;
        const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || '';
        
        // Get email body
        let body = '';
        if (messageData.payload.parts) {
          const textPart = messageData.payload.parts.find((part: any) => part.mimeType === 'text/plain');
          if (textPart && textPart.body.data) {
            body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
        } else if (messageData.payload.body.data) {
          body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }

        emails.push({
          id: message.id,
          sender: getHeader('From').replace(/<.*>/, '').trim(),
          senderEmail: getHeader('From').match(/<(.+)>/)?.[1] || getHeader('From'),
          subject: getHeader('Subject'),
          preview: body.slice(0, 100) + '...',
          timestamp: new Date(parseInt(messageData.internalDate)).toLocaleString(),
          isUnread: true,
          threadId: messageData.threadId,
        });
      }
    }

    return new Response(JSON.stringify({ emails }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Gmail fetch error:', error);
    return new Response(JSON.stringify({
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});