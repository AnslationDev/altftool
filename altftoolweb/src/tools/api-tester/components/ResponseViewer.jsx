import React, { useState } from 'react'
import { Copy, Download } from 'lucide-react'

const ResponseViewer = ({ response }) => {
  const [activeTab, setActiveTab] = useState('body')
  if(!response) return <div className="p-4 text-(--secondary)">Send a request to see response</div>

  const copyToClipboard = text => navigator.clipboard.writeText(text)
  const downloadResponse = () => {
    const blob = new Blob([response.data], { type:'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download='response.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const isJson = () => { try { JSON.parse(response.data); return true } catch{return false} }
  const formatJson = text => isJson() ? JSON.stringify(JSON.parse(text),null,2) : text

  return (
    <div className="p-4  bg-(--background) flex flex-col gap-4 overflow-auto text-(--secondary) border border-(--border) rounded-xl">
      <div className="flex justify-between items-center">
        <div>
          <span className={`px-2 py-1 rounded text-white ${response.status<300?'bg-green-600':response.status<400?'bg-blue-600':response.status<500?'bg-yellow-600':'bg-red-600'}`}>
            {response.status} {response.statusText}
          </span>
          <span className="ml-2 text-gray-500">{response.time}ms</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border rounded cursor-pointer" onClick={()=>copyToClipboard(response.data)}><Copy size={16}/></button>
          <button className="p-2 border rounded cursor-pointer" onClick={downloadResponse}><Download size={16}/></button>
        </div>
      </div>

      <div className="flex gap-2">
        {['body','headers'].map(tab=>(
          <button key={tab} className={`px-3 py-1 rounded-sm border border(--border) cursor-pointer ${activeTab===tab?'bg-blue-600 text-white':'bg-(--background) text-(--secondary)'}`} onClick={()=>setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab==='body' && (
        <pre className="p-2 bg-(--background) border border(--border) text-(--secondary) rounded overflow-auto max-h-96">{formatJson(response.data)}</pre>
      )}

      {activeTab==='headers' && (
        <pre className="p-2 bg-(--background) border border(--border) text-(--secondary) rounded overflow-auto max-h-96">{JSON.stringify(response.headers,null,2)}</pre>
      )}
    </div>
  )
}

export default ResponseViewer
