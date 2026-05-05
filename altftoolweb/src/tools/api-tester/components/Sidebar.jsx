import React, { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, Folder } from 'lucide-react'
import EnvironmentManager from './EnvironmentManager'

const Sidebar = ({
  collections,
  selectedRequest,
  onRequestSelect,
  onAddCollection,
  onAddRequest,
  onUpdateRequest,
  onDeleteRequest,
  onDeleteCollection,
  history,
  environments,
  onUpdateEnvironments
}) => {
  const [expandedCollections, setExpandedCollections] = useState({})
  const [showAddCollection, setShowAddCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showAddRequest, setShowAddRequest] = useState(null)
  const [newRequestName, setNewRequestName] = useState('')
  const [activeTab, setActiveTab] = useState('collections')

  const toggleCollection = (id) => setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }))
  const handleAddCollection = () => { if (newCollectionName.trim()) { onAddCollection(newCollectionName); setNewCollectionName(''); setShowAddCollection(false) } }
  const handleAddRequest = (collectionId) => { if (newRequestName.trim()) { onAddRequest(collectionId, { name: newRequestName, method: 'GET', url: '', headers: {}, body: '', description: '' }); setNewRequestName(''); setShowAddRequest(null) } }
  const handleDeleteCollection = (id) => { if (window.confirm('Delete collection?')) onDeleteCollection(id) }
  const handleDeleteRequest = (collectionId, requestId) => { if (window.confirm('Delete request?')) onDeleteRequest(collectionId, requestId) }

  return (
    <div className="w-80 bg-(--background) border border-(--border) flex flex-col overflow-auto text-(--secondary) rounded-xl ">
      <div className="flex gap-2 pt-3 px-1">
        <button className={`flex-1 py-2  rounded-md border border(--border) ${activeTab === 'collections' ? 'bg-(--primary) text-white' : ''}`} onClick={() => setActiveTab('collections')}>Collections</button>
        <button className={`flex-1 rounded-md border border(--border) py-2 ${activeTab === 'environments' ? 'bg-(--primary) text-white' : ''}`} onClick={() => setActiveTab('environments')}>Environments</button>
      </div>

      {activeTab === 'collections' && (
        <div className="flex-1 overflow-auto px-2 py-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Collections</h3>
            <button className="p-1" onClick={() => setShowAddCollection(true)}><Plus size={16} /></button>
          </div>
          {showAddCollection && (
            <div className="mb-2">
              <input type="text" className="w-full p-1 border rounded mb-1" placeholder="Collection name" value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} />
              <div className="flex space-x-2 pt-1">
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleAddCollection}>Add</button>
                <button className="bg-(--background) text-red-500 px-2 py-1 rounded-md border border(--border) cursor-pointer" onClick={() => setShowAddCollection(false)}>Cancel</button>
              </div>
            </div>
          )}

          {collections.map(c => (
            <div key={c.id} className="mb-2">
              <div className="flex items-center justify-between">
                <button className="flex items-center space-x-1" onClick={() => toggleCollection(c.id)}>
                  {expandedCollections[c.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                  <Folder size={16}/>
                  <span>{c.name}</span>
                </button>
                <div className="flex space-x-1">
                  <button onClick={() => setShowAddRequest(c.id)}><Plus size={14}/></button>
                  <button onClick={() => handleDeleteCollection(c.id)}><Trash2 size={14}/></button>
                </div>
              </div>
              {expandedCollections[c.id] && (
                <div className="pl-6">
                  {showAddRequest === c.id && (
                    <div className="mb-1">
                      <input type="text" className="w-full p-1 border rounded mb-1" placeholder="Request name" value={newRequestName} onChange={e => setNewRequestName(e.target.value)} />
                      <div className="flex space-x-2 mb-1">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleAddRequest(c.id)}>Add</button>
                        <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setShowAddRequest(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {c.requests.map(r => (
                    <div key={r.id} className={`flex justify-between items-center p-1 rounded cursor-pointer ${selectedRequest?.id === r.id ? 'bg-blue-100' : ''}`} onClick={() => onRequestSelect(r)}>
                      <span>{r.method} - {r.name}</span>
                      <button onClick={e => { e.stopPropagation(); handleDeleteRequest(c.id, r.id) }}><Trash2 size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-4">
            <h3 className="font-bold mb-1">History</h3>
            <div className="flex flex-col space-y-1">
              {history.slice(0, 10).map(h => (
                <div key={h.id} className="p-1 bg-(--background) text-(--secondary) rounded border border-(--border) cursor-pointer hover:bg-gray-200" onClick={() => onRequestSelect(h.request)}>
                  <span className="text-sm">{h.request.method} {h.request.url}</span>
                  <span className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'environments' && (
        <EnvironmentManager environments={environments} onUpdateEnvironments={onUpdateEnvironments} />
      )}
    </div>
  )
}

export default Sidebar
