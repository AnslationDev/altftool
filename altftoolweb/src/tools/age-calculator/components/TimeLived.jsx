export default function TimeLived({ minutes, seconds }) {
  return (
    <div className="grid grid-cols-2 gap-4">
  {/* Minutes Card */}
  <div className="bg-(--background) p-4 rounded-lg border text-(--muted-foreground)  description ">
    <h3 className="font-light tracking-wide mb-5 text-xl sm:text-2xl md:text-3xl "> Alive in minutes</h3>
    <p className="text-md md:text-xl font-semibold text-(--foreground) opacity-75">
      {minutes.toLocaleString()} <span className="text-(--secondary)">minutes</span> 
    </p>
  </div>

  {/* Seconds Card */}
  <div className="bg-(--background) p-4 rounded-lg border text-(--muted-foreground) description ">
    <h3 className="font-light tracking-wide mb-5 text-xl sm:text-2xl md:text-3xl ">Alive in seconds</h3>
    <p className="text-md md:text-xl font-semibold text-(--foreground) opacity-75">
      {seconds.toLocaleString()} <span className="text-(--secondary)">seconds</span>
    </p>
  </div>
</div>

  );
}
