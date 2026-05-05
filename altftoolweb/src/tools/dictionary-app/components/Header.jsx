export default function Header() {
  return (
    <div className="text-center pt-4 sm:pt-5 px-4">
      <h1 className="heading mb-2 sm:mb-1 animate-fade-up">
        Dictionary App
      </h1>
      <p className="description mb-4 sm:mb-8 animate-fade-up text-(--muted-foreground)">
        Search for definitions, synonyms, and antonyms of any word.
      </p>
    </div>
  );
}