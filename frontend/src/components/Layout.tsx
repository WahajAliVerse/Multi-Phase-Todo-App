import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  headerContent?: ReactNode;
  className?: string;
}

const Layout = ({ 
  children, 
  sidebarContent, 
  headerContent, 
  className 
}: LayoutProps) => {
  return (
    <div className={cn("flex h-screen bg-background", className)}>
      {/* Sidebar */}
      <Sidebar>
        {sidebarContent || (
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Tasks
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Calendar
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Tags
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Settings
            </Button>
          </div>
        )}
      </Sidebar>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border p-4 flex items-center justify-between">
          {headerContent || (
            <>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </Button>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">U</span>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export { Layout };