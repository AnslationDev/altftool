export default function Header() {
  return (
    <div className="text-center pt-4 sm:pt-5 px-4">
      <h1 className="heading mb-2 sm:mb-1 animate-fade-up">
        Gradient Generator
      </h1>
      <p className="description mb-4 sm:mb-8 animate-fade-up text-(--muted-foreground)">
        Create beautiful CSS gradients for your projects. Select colors, <br /> adjust the angle, and copy the CSS code.
      </p>
    </div>
  );
}