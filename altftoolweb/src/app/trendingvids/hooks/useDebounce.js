import { useEffect, useState } from "react";



const useDebounce=(value,delay=600)=>{
  const [deboucedValue,setDebouncedValue]=useState(value);
  useEffect(()=>{
    const timer=setTimeout(()=>{
      setDebouncedValue(value);

    },delay);
    return ()=> clearTimeout(timer);
  },[value,delay]);
  return deboucedValue;
}

export default useDebounce;