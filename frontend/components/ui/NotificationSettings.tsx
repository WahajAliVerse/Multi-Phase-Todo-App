import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import notificationApi from '@/lib/api/notificationApi';

interface NotificationSettingsProps {
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    email: true,
    browser: true,
    push: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load current notification settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real implementation, we would fetch the user's notification settings
        // For now, we'll use the user's notification settings from the auth context
        if (user && user.notification_settings) {
          setSettings(user.notification_settings);
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSettingChange = (setting: 'email' | 'browser' | 'push') => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      await notificationApi.updateNotificationPreferences(settings);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <p>Loading notification settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how you receive notifications</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {saveSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Notification settings saved successfully!</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch
            checked={settings.email}
            onCheckedChange={() => handleSettingChange('email')}
            aria-label="Toggle email notifications"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Browser Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
          </div>
          <Switch
            checked={settings.browser}
            onCheckedChange={() => handleSettingChange('browser')}
            aria-label="Toggle browser notifications"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications on your mobile device</p>
          </div>
          <Switch
            checked={settings.push}
            onCheckedChange={() => handleSettingChange('push')}
            aria-label="Toggle push notifications"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;