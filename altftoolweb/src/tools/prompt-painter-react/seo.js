const seo = {
  intro:
    "Prompt Painter is a split-screen HTML playground: you type markup in a Monaco code editor on the left and a sandboxed iframe on the right re-renders it instantly with the Tailwind CSS CDN already loaded, so utility classes like bg-blue-500 and hover:scale-105 work without any build step. It is built for developers and designers checking a snippet of AI-generated or hand-written HTML, and it includes device presets, zoom, and a js-beautify formatter. Nothing is compiled or uploaded — the preview runs from a srcdoc iframe in your own tab.",
  useCases: [
    "An LLM hands you a block of Tailwind HTML for a pricing card and you want to see what it actually renders as before pasting it into your component file.",
    "You are checking whether a hero section survives a narrow screen, so you flip the preview to the 375x667 iPhone frame and then the 768x1024 tablet frame instead of resizing your whole browser window.",
    "A colleague pastes minified or badly indented HTML into chat and you need it readable, so you drop it in and hit the format button to get 2-space indented markup back.",
  ],
  benefits: [
    ["Tailwind works out of the box", "The preview document injects the Tailwind CDN and a config block, so utility classes render without you setting up a project."],
    ["Real device frames, not guesses", "Mobile (375x667), tablet (768x1024) and full-width desktop modes with a portrait/landscape flip, plus 50%-200% zoom."],
    ["Editor shortcuts that match the toolbar", "Cmd/Ctrl+S formats with js-beautify, Cmd/Ctrl+K clears the buffer, and Cmd/Ctrl+Shift+C copies the current code."],
  ],
  faqs: [
    [
      "Do I need to add the Tailwind CDN script to my HTML?",
      "No — the preview wrapper already injects the Tailwind CDN and a small tailwind.config block before your markup, so utility classes work on a bare snippet. You can still include your own <style> or <script> tags and they will run alongside it.",
    ],
    [
      "What screen sizes does the preview simulate?",
      "Three: mobile at 375x667, tablet at 768x1024, and desktop at the full width of the panel. Mobile and tablet also have a rotate control that swaps the dimensions to 667x375 and 1024x768 for landscape.",
    ],
    [
      "Does JavaScript in my HTML actually run?",
      "Yes. The preview iframe is loaded with the allow-scripts sandbox permission, so inline handlers such as onclick and <script> blocks execute, which is how the sample document's toggle button works.",
    ],
    [
      "How does the format button change my code?",
      "It runs js-beautify's HTML formatter with 2-space indentation, preserved newlines capped at 2 consecutive blank lines, and a trailing newline at the end of the file. It only reindents markup — it does not rewrite tags or classes.",
    ],
  ],
};

export default seo;
