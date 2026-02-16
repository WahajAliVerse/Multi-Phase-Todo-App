import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface TaskDataPoint {
  name: string;
  tasks: number;
  completed: number;
  pending: number;
}

interface TaskPieData {
  name: string;
  value: number;
}

interface TaskChartsProps {
  data: TaskDataPoint[];
  pieData: TaskPieData[];
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  highPriorityTasks?: number;
  mediumPriorityTasks?: number;
  lowPriorityTasks?: number;
  overdueTasks?: number;
  completionRate?: number;
}

const TaskCharts: React.FC<TaskChartsProps> = ({ 
  data, 
  pieData,
  totalTasks = 0,
  completedTasks = 0,
  pendingTasks = 0,
  highPriorityTasks = 0,
  mediumPriorityTasks = 0,
  lowPriorityTasks = 0,
  overdueTasks = 0,
  completionRate = 0
}) => {
  // Define theme-aware colors using CSS variables
  const barColors = {
    completed: 'var(--success-color, #10B981)',
    pending: 'var(--destructive-color, #EF4444)',
  };

  const lineColors = {
    tasks: 'var(--primary-color, #3B82F6)',
    completed: 'var(--success-color, #10B981)',
  };

  // Define theme-aware pie chart colors
  const pieColors = [
    'var(--primary-color, #3B82F6)',      // High Priority
    'var(--warning-color, #F59E0B)',      // Medium Priority
    'var(--muted-color, #6B7280)',        // Low Priority
    'var(--success-color, #10B981)',      // Completed
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Bar Chart for Task Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card p-3 sm:p-4 rounded-xl shadow"
      >
        <h3 className="text-base sm:text-lg font-medium text-foreground mb-4">Task Statistics</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #E5E7EB)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground-color, #6B7280)" tick={{ fill: 'var(--muted-foreground-color, #6B7280)' }} />
            <YAxis stroke="var(--muted-foreground-color, #6B7280)" tick={{ fill: 'var(--muted-foreground-color, #6B7280)' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card-bg, #FFFFFF)', 
                borderColor: 'var(--border-color, #E5E7EB)',
                color: 'var(--foreground, #1F2937)'
              }} 
              itemStyle={{ color: 'var(--foreground, #1F2937)' }}
            />
            <Legend />
            <Bar dataKey="completed" fill={barColors.completed} name="Completed" />
            <Bar dataKey="pending" fill={barColors.pending} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Line Chart for Task Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card p-3 sm:p-4 rounded-xl shadow"
      >
        <h3 className="text-base sm:text-lg font-medium text-foreground mb-4">Task Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #E5E7EB)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground-color, #6B7280)" tick={{ fill: 'var(--muted-foreground-color, #6B7280)' }} />
            <YAxis stroke="var(--muted-foreground-color, #6B7280)" tick={{ fill: 'var(--muted-foreground-color, #6B7280)' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card-bg, #FFFFFF)', 
                borderColor: 'var(--border-color, #E5E7EB)',
                color: 'var(--foreground, #1F2937)'
              }} 
              itemStyle={{ color: 'var(--foreground, #1F2937)' }}
            />
            <Legend />
            <Line type="monotone" dataKey="tasks" stroke={lineColors.tasks} activeDot={{ r: 8 }} name="Total Tasks" />
            <Line type="monotone" dataKey="completed" stroke={lineColors.completed} name="Completed" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie Chart for Task Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card p-3 sm:p-4 rounded-xl shadow col-span-2"
      >
        <h3 className="text-base sm:text-lg font-medium text-foreground mb-4">Task Distribution & Analytics</h3>
        <div className="flex flex-col lg:flex-row items-center justify-center">
          <div className="w-full lg:w-1/2 h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg, #FFFFFF)',
                    borderColor: 'var(--border-color, #E5E7EB)',
                    color: 'var(--foreground, #1F2937)'
                  }}
                  formatter={(value, name, props) => [`${value} tasks`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 mt-4 lg:mt-0 lg:pl-8">
            <h4 className="text-sm sm:text-base font-medium text-foreground mb-4">Analytics Summary</h4>
            
            {/* Priority Distribution */}
            <div className="mb-4">
              <h5 className="text-xs sm:text-sm font-medium text-foreground mb-2">By Priority</h5>
              <div className="space-y-1.5 sm:space-y-2">
                {highPriorityTasks > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: pieColors[0] }}></div>
                      <span className="text-xs sm:text-sm text-muted-foreground">High Priority</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground">{highPriorityTasks} ({totalTasks > 0 ? Math.round((highPriorityTasks / totalTasks) * 100) : 0}%)</span>
                  </div>
                )}
                {mediumPriorityTasks > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: pieColors[1] }}></div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Medium Priority</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground">{mediumPriorityTasks} ({totalTasks > 0 ? Math.round((mediumPriorityTasks / totalTasks) * 100) : 0}%)</span>
                  </div>
                )}
                {lowPriorityTasks > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: pieColors[2] }}></div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Low Priority</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground">{lowPriorityTasks} ({totalTasks > 0 ? Math.round((lowPriorityTasks / totalTasks) * 100) : 0}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="mb-4">
              <h5 className="text-xs sm:text-sm font-medium text-foreground mb-2">By Status</h5>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: pieColors[3] }}></div>
                    <span className="text-xs sm:text-sm text-muted-foreground">Completed</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{completedTasks} ({completionRate}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--warning-color, #F59E0B)' }}></div>
                    <span className="text-xs sm:text-sm text-muted-foreground">Pending</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{pendingTasks} ({totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}%)</span>
                </div>
                {overdueTasks > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--destructive-color, #EF4444)' }}></div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Overdue</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-destructive">{overdueTasks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="pt-3 sm:pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="text-base sm:text-lg font-bold text-success">{completionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{totalTasks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskCharts;