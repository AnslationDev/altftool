import React from "react";

export default function TriggerSelector({ trigger, setTrigger }) {

  return (

    <div className="space-y-2">

      <h3 className="font-semibold">
        Trigger Selector
      </h3>

      <select
        value={trigger}
        onChange={(e)=>setTrigger(e.target.value)}
        className="  w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
      >

        <option value="auto">
          Auto Play
        </option>

        <option value="hover">
          On Hover
        </option>

        <option value="click">
          On Click
        </option>

      </select>

    </div>

  );

}