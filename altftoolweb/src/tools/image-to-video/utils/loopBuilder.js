export function buildLoopSequence(slides, pattern) {
  if (!slides.length) return [];

  switch (pattern) {

    case "reverse":
      return [...slides].reverse();

    case "bounce": {
      // A B C → A B C B A
      const forward = [...slides];
      const backward = [...slides].slice(1, -1).reverse();
      return [...forward, ...backward];
    }

    case "abab": {
      // A B C → A B A B
      if (slides.length < 2) return slides;
      return [slides[0], slides[1], slides[0], slides[1]];
    }

    case "normal":
    default:
      return slides;
  }
}