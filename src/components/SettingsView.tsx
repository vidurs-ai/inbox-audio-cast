import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiKeySetup } from "@/components/ApiKeySetup";
import { useAudioStore } from "@/stores/audioStore";
import { TTSService } from "@/services/TTSService";

export const SettingsView = () => {
  const { settings, setPlaybackSpeed, setVoice } = useAudioStore();
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = TTSService.getAvailableVoices();
      setVoices([
        { id: 'default', name: 'Default' },
        ...availableVoices.map(voice => ({ id: voice.name, name: voice.name }))
      ]);
    };

    updateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      
      <ApiKeySetup />
      
      <div className="space-y-4">
        {/* Playback Settings */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium text-foreground">Playback</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select 
                value={settings.voice} 
                onValueChange={setVoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Playback Speed</Label>
              <div className="space-y-2">
                <Slider
                  value={[settings.rate]}
                  onValueChange={(value) => setPlaybackSpeed(value[0])}
                  max={2}
                  min={0.5}
                  step={0.25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>{settings.rate}x</span>
                  <span>2x</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-mark-read">Auto-mark as read</Label>
              <Switch id="auto-mark-read" defaultChecked />
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium text-foreground">Email</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="primary-only">Primary inbox only</Label>
              <Switch id="primary-only" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="skip-promotions">Skip promotions</Label>
              <Switch id="skip-promotions" defaultChecked />
            </div>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium text-foreground">Account</h2>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Connected as: user@gmail.com
            </p>
            <Button variant="outline" className="w-full">
              Disconnect Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};