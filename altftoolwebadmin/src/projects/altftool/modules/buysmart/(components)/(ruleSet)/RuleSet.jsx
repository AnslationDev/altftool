import React, { useState } from 'react'
import AddRuleSet from './AddRuleSet'
import GetRuleSet from './GetRuleSet'

function RuleSet() {
  const[active , setActive] = useState(null)
  const [editRule , setEditRule] = useState(null)

  function handleComponent(){
      setActive((prev) => !(prev))
  }
  return (
    <div>
         <div className="flex items-center justify-end" >
          {!active &&   <div
        onClick={handleComponent}
        className='py-2   flex justify-center'
      >
        <button className='btn btn-primary '>
          Add RuleSet +
        </button>
      </div>}
      
         </div>
      {active ? (
        <AddRuleSet 
        setActive={setActive}
        editRule={editRule}
        setEditRule={setEditRule}
        />
      ) : (
        <GetRuleSet
        editRule={editRule}
        setEditRule={setEditRule} 
        setActive={setActive}
        />
      )}
    </div>
  )
}

export default RuleSet