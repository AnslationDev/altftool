export default function AnimationGuide() {

return (

<section className="py-16 sm:py-20 px-4 bg-(--background)">
<div className="mx-auto max-w-6xl">

<div className="text-center mb-12 sm:mb-16">
<h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
How It Works ?
</h2>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

{[
{ title: "Choose Animation", description: "Select animation type like fade, slide or bounce." },
{ title: "Adjust Controls", description: "Set duration, delay and easing easily." },
{ title: "Preview Animation", description: "See real-time animation output instantly." },
{ title: "Replay & Pause", description: "Control playback anytime." },
{ title: "Copy CSS Code", description: "Copy ready CSS animation code." },
{ title: "Download CSS", description: "Download animation stylesheet instantly." }
].map((card, index) => (

<div
key={index}
className="group bg-(--card) rounded-2xl shadow-md border border-(--border) p-6 sm:p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
>

<h3 className="text-lg sm:text-xl font-bold mb-3 transition-colors duration-300 group-hover:text-blue-500">
{card.title}
</h3>

<p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
{card.description}
</p>

</div>

))}

</div>
</div>
</section>

);

}