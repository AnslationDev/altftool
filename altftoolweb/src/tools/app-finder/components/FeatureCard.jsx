

 export const FeatureCard = ({ icon: Icon, title, description, gradient }) => {
return (
<div className=" bg-(--background) group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 transition-all hover:shadow-xl ">
<div className="inline-flex p-3 rounded-xl gap-3 mb-4 group-hover:scale-110 transition-transform">
<Icon className="w-6 h-6 text-(--primary) pt-1" />
<h3 className="subheading mb-2">{title}</h3>
</div>

<p className="content">{description}</p>
</div>
);
};
