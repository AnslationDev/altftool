"use-client";
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div
      className="
        h-full 
        bg-(--card) 
        border border-(--border)
        rounded-xl 
        shadow-sm 
        transition 
        hover:-translate-y-1 
        hover:border-(--primary) 
        hover:shadow-xl 
        p-6
        flex flex-col items-center text-center
      "
    >
      {/* Icon wrapper */}
      <div
        className="
          mb-3 
          inline-flex 
          p-3 
          rounded-full 
          bg-(--background) 
          shadow 
        "
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-(--foreground) mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-(--muted-foreground)">{description}</p>
    </div>
  );
};

export default FeatureCard;
