import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import RequestBuilder from '../components/RequestBuilder'
import ResponseViewer from '../components/ResponseViewer'


 export default function ToolHome(){
  const [collections, setCollections] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [response, setResponse] = useState(null)
  const [environments, setEnvironments] = useState([
    { id: '1', name: 'Environment 1', variables: {} }
  ])
  const [selectedEnvironment, setSelectedEnvironment] = useState('1')
  const [history, setHistory] = useState([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCollections = localStorage.getItem('postman-collections')
    const savedEnvironments = localStorage.getItem('postman-environments')
    const savedHistory = localStorage.getItem('postman-history')

    if (savedCollections) setCollections(JSON.parse(savedCollections))
    else {
      setCollections([{
        id: '1',
        name: 'My Collection',
        requests: [{
          id: '1',
          name: 'Sample GET Request',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          headers: {},
          body: '',
          description: 'A sample GET request'
        }]
      }])
    }

    if (savedEnvironments) setEnvironments(JSON.parse(savedEnvironments))
    if (savedHistory) setHistory(JSON.parse(savedHistory))
  }, [])

  useEffect(() => {
    localStorage.setItem('postman-collections', JSON.stringify(collections))
  }, [collections])

  useEffect(() => {
    localStorage.setItem('postman-environments', JSON.stringify(environments))
  }, [environments])

  useEffect(() => {
    localStorage.setItem('postman-history', JSON.stringify(history))
  }, [history])

  const addCollection = (name) => {
    setCollections([...collections, { id: Date.now().toString(), name, requests: [] }])
  }

  const addRequest = (collectionId, request) => {
    const newRequest = { id: Date.now().toString(), ...request }
    setCollections(collections.map(c =>
      c.id === collectionId ? { ...c, requests: [...c.requests, newRequest] } : c
    ))
  }

  const updateRequest = (collectionId, requestId, updatedRequest) => {
    setCollections(collections.map(c =>
      c.id === collectionId
        ? { ...c, requests: c.requests.map(r => r.id === requestId ? { ...r, ...updatedRequest } : r) }
        : c
    ))
  }

  const deleteRequest = (collectionId, requestId) => {
    setCollections(collections.map(c =>
      c.id === collectionId ? { ...c, requests: c.requests.filter(r => r.id !== requestId) } : c
    ))
  }

  const deleteCollection = (collectionId) => {
    setCollections(collections.filter(c => c.id !== collectionId))
  }

  const addToHistory = (request, response) => {
    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      request: { ...request },
      response: { ...response }
    }
    setHistory([historyItem, ...history.slice(0, 49)])
  }

  const handleSendRequest = async (requestData) => {
    const startTime = Date.now()
    try {
      const headers = { ...requestData.headers }
      if (requestData.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'

      const res = await fetch(requestData.url, {
        method: requestData.method,
        headers,
        body: requestData.body ? JSON.stringify(requestData.body) : undefined
      })

      const responseTime = Date.now() - startTime
      const data = await res.text()
      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data,
        time: responseTime
      }

      setResponse(responseObj)
      addToHistory(requestData, responseObj)
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: error.message,
        time: Date.now() - startTime
      })
      addToHistory(requestData, {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: error.message,
        time: Date.now() - startTime
      })
    }
  }

  return (
 <div className="flex flex-col h-screen  m-6 bg-(--background)">
     <div className="flex flex-col h-screen   rounded-xl ">
<div className='mb-5'>
  <h1 className="heading text-center pt-6 animate-fade-up">API TESTER</h1>
  <p className="description text-center  animate-fade-up ">Build, send, and test API requests with ease.</p>
</div>

      {/* <Header
        environments={environments}
        selectedEnvironment={selectedEnvironment}
        onEnvironmentChange={setSelectedEnvironment}
      /> */}
      <div className=" flex flex-1 overflow-hidden  border border-(--border) rounded-xl">
       
         <Sidebar
          collections={collections}
          selectedRequest={selectedRequest}
          onRequestSelect={setSelectedRequest}
          onAddCollection={addCollection}
          onAddRequest={addRequest}
          onUpdateRequest={updateRequest}
          onDeleteRequest={deleteRequest}
          onDeleteCollection={deleteCollection}
          history={history}
          environments={environments}
          onUpdateEnvironments={setEnvironments}
         
        />
       
        <div className="flex-1 flex flex-col overflow-auto m-5">
          <RequestBuilder
            request={selectedRequest}
            onSendRequest={handleSendRequest}
            environment={environments.find(e => e.id === selectedEnvironment)}
          />
          <ResponseViewer response={response} />
        </div>
      </div>
    </div>
 </div>
  )
}


