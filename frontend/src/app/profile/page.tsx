'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUserProfile, fetchUserProfile } from '@/store/slices/authSlice';

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationBrowser, setNotificationBrowser] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  // Load user profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        await dispatch(fetchUserProfile()).unwrap();
        if (user) {
          setUsername(user.username || '');
          setEmail(user.email || '');
          setTimezone(user.preferences?.timezone || 'UTC');
          setTheme(user.preferences?.theme || 'system');
          setNotificationEmail(user.preferences?.notificationSettings?.email || true);
          setNotificationBrowser(user.preferences?.notificationSettings?.browser || true);
        }
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [dispatch, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim()) {
      setError('Username and email are required');
      return;
    }

    try {
      const profileUpdates = {
        username,
        email,
        preferences: {
          timezone,
          theme,
          notificationSettings: {
            email: notificationEmail,
            browser: notificationBrowser,
            inApp: true, // Adding the missing inApp property
          }
        }
      };

      await dispatch(updateUserProfile(profileUpdates)).unwrap();
      setSuccess('Profile updated successfully!');
      setError('');
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">User Profile</CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md" role="status">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full"
                  aria-required="true"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full"
                  aria-required="true"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Asia/Kolkata">India Standard Time</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Theme Preference
                </label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="notification-email"
                    name="notification-email"
                    type="checkbox"
                    checked={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notification-email" className="ml-2 block text-sm text-gray-900">
                    Email notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="notification-browser"
                    name="notification-browser"
                    type="checkbox"
                    checked={notificationBrowser}
                    onChange={(e) => setNotificationBrowser(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notification-browser" className="ml-2 block text-sm text-gray-900">
                    Browser notifications
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="text-sm text-gray-500">
          <p>Manage your account settings and preferences</p>
        </CardFooter>
      </Card>
    </div>
  );
}