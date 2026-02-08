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
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const TaskCharts: React.FC<TaskChartsProps> = ({ data, pieData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart for Task Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#10B981" name="Completed" />
            <Bar dataKey="pending" fill="#EF4444" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Line Chart for Task Trends */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tasks" stroke="#3B82F6" activeDot={{ r: 8 }} name="Total Tasks" />
            <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie Chart for Task Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow col-span-2"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Distribution</h3>
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="w-full md:w-1/2 h-80">
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Distribution by Priority</h4>
            <ul className="space-y-2">
              {pieData.map((item, index) => (
                <li key={index} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300">{item.name}: {item.value} tasks</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskCharts;