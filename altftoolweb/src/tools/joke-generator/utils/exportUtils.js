import { safeCopyText } from "@/shared/utils/clipboard";

export function formatJokeText(joke) {
  if (!joke) return "";
  const author = joke.author ? ` — ${joke.author}` : "";
  return `"${joke.joke}"${author}`;
}

export function getWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getCharCount(text) {
  if (!text) return 0;
  return text.length;
}

export async function copyJoke(joke) {
  return safeCopyText(formatJokeText(joke));
}

export async function shareJoke(joke) {
  const text = formatJokeText(joke);
  if (navigator?.share) {
    try {
      await navigator.share({ title: "Funny Joke", text });
      return true;
    } catch (err) {
      if (err.name !== "AbortError") {
        return copyJoke(joke);
      }
      return false;
    }
  }
  return copyJoke(joke);
}

export function downloadAsTxt(joke, filename) {
  const text = formatJokeText(joke);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "joke.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJokesAsTxt(jokes, filename) {
  const text = jokes.map((j, i) => `${i + 1}. ${formatJokeText(j)}`).join("\n\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "jokes.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
