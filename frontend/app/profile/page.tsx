'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import ProfileForm from '@/components/forms/ProfileForm';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/common/ThemeToggle';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
            <ThemeToggle />
          </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : user ? (
                <ProfileForm user={user} />
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-foreground">No profile data</h3>
                  <p className="mt-1 text-muted-foreground">
                    Unable to load profile information.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Activity Summary Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">Tasks Completed This Week</h4>
                      <p className="text-sm text-muted-foreground">Last 7 days</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">12</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">Tasks Created This Month</h4>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">24</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">Current Streak</h4>
                      <p className="text-sm text-muted-foreground">Days in a row</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">7</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;