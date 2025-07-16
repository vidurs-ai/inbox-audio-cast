import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const SettingsView = () => {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      
      <div className="space-y-4">
        {/* Playback Settings */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium text-foreground">Playback</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Playback Speed</Label>
              <div className="space-y-2">
                <Slider
                  defaultValue={[1]}
                  max={2}
                  min={0.5}
                  step={0.25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>1x</span>
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