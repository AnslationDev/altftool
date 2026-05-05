export default function DateForm({
  birthDate,
  todayString,
  setBirthDate,
  handleCalculate,
}) {
  return (
    <form
      onSubmit={handleCalculate}
      className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-(--background) text-(--secondary) p-4"
    >
      <input
        type="date"
        value={birthDate}
        max={todayString}
        onChange={(e) => setBirthDate(e.target.value)}
        className="border border-(--border) rounded-lg px-4 py-2 focus:ring-2 text-(--secondary) cursor-pointer"
      />
      <button className="bg-(--primary) text-white px-6 py-2 rounded-lg cursor-pointer">
        Calculate
      </button>
    </form>
  );
}
