'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { fetchTasks } from '@/lib/store/slices/taskSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { openModal } from '@/lib/store/slices/modalSlice';
import { ModalType } from '@/lib/types';

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.task);

  useEffect(() => {
    // Fetch a limited number of tasks for the home page
    dispatch(fetchTasks({ limit: 5 }));
  }, [dispatch]);

  const handleGetStarted = () => {
    dispatch(openModal({ type: ModalType.TASK_MODAL, data: null }));
  };

  // Calculate quick stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const tasksDueSoon = tasks.filter(task => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Organize Your Life with Ease</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            A powerful task management application designed to help you stay organized, focused, and productive.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100"
              onClick={handleGetStarted}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl">{totalTasks}</CardTitle>
                <CardDescription>Total Tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl">{completedTasks}</CardTitle>
                <CardDescription>Completed</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl">{pendingTasks}</CardTitle>
                <CardDescription>Pending</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl">{tasksDueSoon}</CardTitle>
                <CardDescription>Due Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <Clock className="mx-auto h-10 w-10 text-orange-500" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features for Better Productivity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Smart Task Management</CardTitle>
                <CardDescription>Create, organize, and prioritize your tasks with ease</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Easily create tasks with due dates, priorities, and tags. Organize your work efficiently.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recurring Tasks</CardTitle>
                <CardDescription>Set up tasks that repeat automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Don't create the same tasks repeatedly. Set up recurring tasks with customizable patterns.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Smart Reminders</CardTitle>
                <CardDescription>Never miss a deadline with timely reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Get notified via browser notifications and email when tasks are due or coming up.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Boost Your Productivity?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already organizing their lives with our task management application.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-gray-100"
            asChild
          >
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;