"use client";

export default function PlanForm({
  values,
  setters,
  onGenerate,
  onExport,
  onPrint,
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold mb-1 block">Plan Name</label>
          <input value={values.name} onChange={(e) => setters.setName(e.target.value)} className={`w-full px-4 py-3 wp-field`} />
        </div>
        <div>
          <label className="text-sm font-semibold mb-1 block">Goal</label>
          <select value={values.goal} onChange={(e) => setters.setGoal(e.target.value)} className={`w-full px-4 py-3 wp-field`}>
            <option value="strength">Strength</option>
            <option value="muscle-gain">Muscle Gain</option>
            <option value="fat-loss">Fat Loss</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold mb-1 block">Level</label>
          <select value={values.level} onChange={(e) => setters.setLevel(e.target.value)} className={`w-full px-4 py-3 wp-field`}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div><label className="text-sm font-semibold mb-1 block">Days</label><input type="number" min="1" max="7" value={values.daysPerWeek} onChange={(e) => setters.setDaysPerWeek(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
        <div><label className="text-sm font-semibold mb-1 block">Duration</label><input type="number" min="20" max="120" value={values.duration} onChange={(e) => setters.setDuration(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
        <div><label className="text-sm font-semibold mb-1 block">Weeks</label><select value={values.blockWeeks} onChange={(e) => setters.setBlockWeeks(e.target.value)} className={`w-full px-4 py-3 wp-field`}><option>4</option><option>8</option><option>12</option></select></div>
        <div><label className="text-sm font-semibold mb-1 block">Weight</label><input type="number" min="35" value={values.weight} onChange={(e) => setters.setWeight(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
        <div><label className="text-sm font-semibold mb-1 block">Time Cap</label><input type="number" min="20" max="120" value={values.timeCap} onChange={(e) => setters.setTimeCap(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
        <div><label className="text-sm font-semibold mb-1 block">Equipment</label><select value={values.equipment} onChange={(e) => setters.setEquipment(e.target.value)} className={`w-full px-4 py-3 wp-field`}><option value="none">None</option><option value="basic">Basic</option><option value="full">Full Gym</option></select></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-sm font-semibold mb-1 block">Focus Area</label><input value={values.focusArea} onChange={(e) => setters.setFocusArea(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-semibold mb-1 block">Rest Days</label><input value={values.restDays} onChange={(e) => setters.setRestDays(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
          <div><label className="text-sm font-semibold mb-1 block">Reminder</label><input type="time" value={values.reminderTime} onChange={(e) => setters.setReminderTime(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-sm font-semibold mb-1 block">Workout Days (Calendar)</label><input value={values.calendarDays} onChange={(e) => setters.setCalendarDays(e.target.value)} className={`w-full px-4 py-3 wp-field`} /></div>
        <label className="flex items-center gap-2 text-sm font-semibold mt-7"><input type="checkbox" checked={values.injuryFlag} onChange={(e) => setters.setInjuryFlag(e.target.checked)} /> Injury-aware mode</label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={onGenerate} className={`px-5 py-3 rounded-xl font-bold wp-btn-primary`}>Generate Pro Plan</button>
        <button onClick={onExport} className={`px-5 py-3 rounded-xl font-semibold wp-btn-secondary`}>Export JSON</button>
        <button onClick={onPrint} className={`px-5 py-3 rounded-xl font-semibold wp-btn-secondary`}>Print / PDF</button>
      </div>
    </>
  );
}
