import React, { useState, useEffect } from 'react'
import { Send, Plus, Trash2 } from 'lucide-react'

const RequestBuilder = ({ request, onSendRequest, environment }) => {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState([])
  const [body, setBody] = useState('')
  const [bodyType, setBodyType] = useState('raw')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('params')

  useEffect(() => {
    if (request) {
      setMethod(request.method || 'GET')
      setUrl(request.url || '')
      setHeaders(Object.entries(request.headers || {}).map(([key, value]) => ({ key, value })))
      setBody(request.body || '')
    }
  }, [request])

  const handleSendRequest = async () => {
    if (!url.trim()) return alert('Please enter a URL')
    setIsLoading(true)
    const headersObj = {}
    headers.forEach(h => { if (h.key && h.value) headersObj[h.key] = h.value })
    let requestBody = bodyType === 'raw' && body.trim() ? JSON.parse(body) : undefined
    try { await onSendRequest({ method, url, headers: headersObj, body: requestBody }) } catch(e){ console.error(e) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="p-4  border border-(--border) bg-(--background) rounded-xl">
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <select className="px-3 py-2 rounded border border-(--border) bg-(--background) text-(--secondary) cursor-pointer" value={method} onChange={e => setMethod(e.target.value)}>
          {['GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="text" className="flex-1 px-3 py-2 rounded border border-(--border) text-(--secondary)" placeholder="https://api.example.com/users" value={url} onChange={e => setUrl(e.target.value)} />
        <button className="flex items-center gap-1 px-4 py-2 bg-(--primary) text-white rounded hover:bg-(--primary) cursor-pointer" onClick={handleSendRequest} disabled={isLoading}>
          <Send size={16} /> {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="flex mt-4 space-x-2 overflow-x-auto">
        {['params','authorization','headers','body','pre-request','tests'].map(tab => (
          <button key={tab} className={`px-3 py-1 rounded border border(--border) cursor-pointer ${activeTab===tab?'bg-(--primary) text-white':'bg-(--background) text-(--secondary)'}`} onClick={()=>setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'body' && (
          <textarea className="w-full p-3 border border-(--border) text-(--secondary) rounded min-h-[200px]" placeholder="Enter request body" value={body} onChange={e => setBody(e.target.value)} />
        )}
        {activeTab === 'headers' && (
          <div className="flex flex-col gap-2">
            {headers.map((h,i)=>(
              <div key={i} className="flex gap-2 items-center">
                <input className="flex-1 p-2 border border-(--border) text-(--secondary) rounded" placeholder="Key" value={h.key} onChange={e=>{const nh=[...headers]; nh[i].key=e.target.value; setHeaders(nh)}}/>
                <input className="flex-1 p-2 border border-(--border) text-(--secondary) rounded" placeholder="Value" value={h.value} onChange={e=>{const nh=[...headers]; nh[i].value=e.target.value; setHeaders(nh)}}/>
                <button onClick={()=>setHeaders(headers.filter((_,idx)=>idx!==i))} className="p-2 text-red-600 cursor-pointer"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={()=>setHeaders([...headers,{key:'',value:''}])} className="flex items-center gap-1 text-(--primary) cursor-pointer"><Plus size={16}/> Add Header</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestBuilder
