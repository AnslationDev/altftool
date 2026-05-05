




import React from 'react'

const Header = ({ environments, selectedEnvironment, onEnvironmentChange }) => {
  return (
    <header className="  bg-(--background) border-b border-gray-300 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-(--primary)">API TESTER</h1>
        {/* <span className="text-(--secondary) text-sm"></span> */}
      </div>

      {/* <div className="flex items-center gap-3 w-full md:w-auto">
        <label className="text-gray-700 font-medium text-sm">Environment:</label>
        <select
          value={selectedEnvironment}
          onChange={(e) => onEnvironmentChange(e.target.value)}
          className="border border-gray-400 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
      </div> */}

      <div className="flex items-center gap-3">
        <button className="bg-(--primary) text-white px-4 py-1 rounded  transition">
          New Request
        </button>
        <button className="border border(--border) text-(--primary) px-4 py-1 rounded bg-(--background) transition"> 
          Import
        </button>
      </div>
    </header>
  )
}

export default Header
