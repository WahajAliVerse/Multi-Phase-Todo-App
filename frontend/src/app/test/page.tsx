'use client';

export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Tailwind CSS Test</div>
          <p className="mt-2 text-gray-500">This page verifies that Tailwind CSS is working correctly.</p>
          
          <div className="mt-6 flex space-x-4">
            <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors">
              Primary Button
            </button>
            <button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-600 shadow hover:bg-indigo-50 transition-colors">
              Secondary Button
            </button>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-red-100 text-red-800 p-4 rounded text-center">Red</div>
            <div className="bg-green-100 text-green-800 p-4 rounded text-center">Green</div>
            <div className="bg-blue-100 text-blue-800 p-4 rounded text-center">Blue</div>
          </div>
        </div>
      </div>
    </div>
  );
}