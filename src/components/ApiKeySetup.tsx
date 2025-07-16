import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TTSService } from "@/services/TTSService";
import { useToast } from "@/hooks/use-toast";
import { Key, Volume2 } from "lucide-react";

export const ApiKeySetup = () => {
  const [apiKey, setApiKey] = useState(TTSService.getApiKey() || '');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isVerified, setIsVerified] = useState(!!TTSService.getApiKey());
  const { toast } = useToast();

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your ElevenLabs API key",
        variant: "destructive",
      });
      return;
    }

    setIsTestingKey(true);
    try {
      const isValid = await TTSService.testApiKey(apiKey);
      
      if (isValid) {
        TTSService.saveApiKey(apiKey);
        setIsVerified(true);
        toast({
          title: "Success",
          description: "API key verified and saved!",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid API key. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleTestVoice = async () => {
    try {
      await TTSService.generateSpeech("Hello! This is a test of your voice synthesis.");
      toast({
        title: "Voice Test",
        description: "Playing test audio...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test audio",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Key className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">ElevenLabs API Setup</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">ElevenLabs API Key</Label>
          <div className="flex space-x-2">
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
              className="flex-1"
            />
            <Button
              onClick={handleTestKey}
              disabled={isTestingKey}
              variant="outline"
            >
              {isTestingKey ? "Testing..." : "Verify"}
            </Button>
          </div>
          {isVerified && (
            <p className="text-sm text-green-600">✓ API key verified and saved</p>
          )}
        </div>

        {isVerified && (
          <div className="pt-2">
            <Button
              onClick={handleTestVoice}
              variant="outline"
              className="w-full"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Test Voice
            </Button>
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>Currently using Web Speech API for voice synthesis.</p>
        <p>ElevenLabs integration coming soon for premium voices.</p>
      </div>
    </Card>
  );
};