import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const EnvironmentManager = ({ environments, onUpdateEnvironments }) => {
  const [newEnvName, setNewEnvName] = useState('')

  const addEnvironment = () => {
    if(!newEnvName.trim()) return
    const newEnv = { id: Date.now().toString(), name: newEnvName, variables: {} }
    onUpdateEnvironments([...environments, newEnv])
    setNewEnvName('')
  }

  const deleteEnvironment = (id) => {
    if(window.confirm('Delete environment?')) onUpdateEnvironments(environments.filter(e=>e.id!==id))
  }

  return (
    <div className="p-4 ">
      <div className="flex gap-2 mb-2  ">
        <input type="text" className="flex-1 p-2 border rounded" placeholder="Environment name" value={newEnvName} onChange={e=>setNewEnvName(e.target.value)}/>
        <button className="bg-blue-500 text-white px-2 py-1 rounded cursor-pointer" onClick={addEnvironment}><Plus size={16}/></button>
      </div>
      <div className="flex flex-col gap-2">
        {environments.map(env=>(
          <div key={env.id} className="flex justify-between items-center p-2 bg-(--background) border border(--border) rounded text-(--secondary)">
            <span>{env.name}</span>
            <button onClick={()=>deleteEnvironment(env.id)}><Trash2 size={16} className='text-red-500 cursor-pointer'/></button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EnvironmentManager
