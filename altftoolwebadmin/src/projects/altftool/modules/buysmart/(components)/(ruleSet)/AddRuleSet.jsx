

import React, { useEffect, useState } from "react";
import { firebaseBuySmartRuleSetSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartRuleSet";

function AddRuleSet({setActive ,editRule,setEditRule}) {
  const [form, setForm] = useState({
    title: "",
    redirectUrl: "",
    active: false,
    idleTime: "5",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.redirectUrl.trim()) newErrors.redirectUrl = "Link is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      title: form.title,
      redirectUrl: form.redirectUrl,
      active:form.active,
      idleTime:form.idleTime,
      updatedAt: Date.now(),
    };

    if(editRule){
      await  firebaseBuySmartRuleSetSource.update(editRule.id , payload)
    }else{
      await firebaseBuySmartRuleSetSource.add({...payload, createdAt: Date.now(),})
    }

    

    setForm(
      { 
        title: "",
        redirectUrl: "",
        active:"",
        idleTime:""
       });

       setEditRule(null)

       setActive(false)

  
  }

  useEffect(() => {
     if(editRule){
        setForm({
          title:editRule.title || "",
          redirectUrl:editRule.redirectUrl || "",
          active : editRule.active || "",
          idleTime : editRule.idleTime || ""
        })
     }
  } , [editRule])


  return (

    <div className="flex justify-center  " >
      
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white w-1/2 p-6 rounded-md border"
    >
          <h1 className="flex font-[poppins] justify-center text-2xl font-bold" >RULESET FORM</h1>
      <div>
        <label className="block text-sm font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-sm"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      {/* LINK */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Link <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="redirectUrl"
          value={form.redirectUrl}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-sm"
        />
        {errors.link && (
          <p className="text-red-500 text-xs mt-1">{errors.link}</p>
        )}
      </div>

      {/* ACTIVE */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="active"
          checked={form.active}
          onChange={handleChange}
        />
        <label className="text-sm font-medium">
          Active
        </label>
      </div>

      {/* TIME */}
      <div>
        <p className="text-sm font-medium mb-2">Display Time</p>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="idleTime"
              value="5"
              checked={form.idleTime === "5"}
              onChange={handleChange}
            />
            5 seconds
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="idleTime"
              value="10"
              checked={form.idleTime === "10"}
              onChange={handleChange}
            />
            10 seconds
          </label>
        </div>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-full cursor-pointer hover:bg-green-600 bg-black text-white py-2 rounded-sm hover:bg-gray-800"
      >
        Save
      </button>
    </form>
    </div>
  );
}

export default AddRuleSet;