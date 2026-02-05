'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[70vh] bg-gray-50 py-8"> {/* Adjusted height and padding to account for navbar and footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Multi-Phase</span>
            <span className="block text-blue-600">Todo Application</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A feature-rich todo application with recurrence patterns, notifications, reminders, and tags.
          </p>
        </div>

        {/* Feature Highlights Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Powerful Features for Better Productivity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">Advanced Task Management</h3>
              <p className="text-gray-600 text-center">
                Create, organize, and track your tasks with due dates, priorities, and custom statuses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">Smart Tagging System</h3>
              <p className="text-gray-600 text-center">
                Organize your tasks with customizable tags and categories for better filtering and search.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">Personalized Experience</h3>
              <p className="text-gray-600 text-center">
                Customize your settings, themes, and notification preferences to match your workflow.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12 border border-blue-100">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Get Started in Seconds</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Ready to boost your productivity? Choose an option below to begin managing your tasks more efficiently.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/tasks"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors text-center"
            >
              View My Tasks
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow border border-blue-200 hover:bg-blue-50 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="mt-12 flex justify-center">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:grid-cols-3">
            <Link
              href="/tasks"
              className="group flex flex-col items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              tabIndex={0}
              aria-label="Go to task management page"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white group-hover:bg-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Task Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create, update, and manage your tasks with advanced features
              </p>
            </Link>

            <Link
              href="/tags"
              className="group flex flex-col items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              tabIndex={0}
              aria-label="Go to tag management page"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Tag Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                Organize your tasks with customizable tags and categories
              </p>
            </Link>

            <Link
              href="/profile"
              className="group flex flex-col items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              tabIndex={0}
              aria-label="Go to user profile page"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white group-hover:bg-purple-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Profile & Settings</h3>
              <p className="mt-2 text-sm text-gray-500">
                Manage your account and preferences
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}