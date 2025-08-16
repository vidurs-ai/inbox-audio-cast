import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailContent, subject, sender } = await req.json();
    
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set');
    }

    console.log('Processing email with Groq AI:', { subject, sender });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an email processing assistant. Your job is to clean up email content and make it more readable for text-to-speech conversion. 

Please:
1. Remove any promotional/marketing fluff 
2. Extract the key information and main message
3. Format it in a clear, concise way
4. Remove any redundant content
5. Make it suitable for audio reading
6. Keep important details like dates, amounts, confirmations, etc.
7. If it's a newsletter, extract the main news points
8. If it's transactional, focus on the key transaction details

Return ONLY the cleaned content, no extra formatting or explanations.`
          },
          {
            role: 'user',
            content: `Clean up this email for audio reading:

Subject: ${subject}
From: ${sender}

Content:
${emailContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const processedContent = data.choices[0]?.message?.content || emailContent;

    console.log('Email processed successfully');

    return new Response(JSON.stringify({ 
      processedContent,
      originalLength: emailContent.length,
      processedLength: processedContent.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-email-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      processedContent: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});