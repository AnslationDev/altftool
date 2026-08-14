const seo = {
  title: "Convert Chat Logs to OpenAI, Anthropic, Gemini or Llama",
  metaDescription:
    "Paste a messages array or Markdown transcript and re-emit it as OpenAI, Anthropic, Gemini, Cohere, Llama prompt or Markdown — live as you type.",
  intro:
    "Codex Chat Transfer emits a conversation in six target formats used by today's chat models: OpenAI JSON, Anthropic JSON, Google Gemini, Cohere, the Llama 2/3 prompt string, and plain Markdown. Paste an array of role/content objects, a payload with a messages array, a headed Markdown transcript, or one unheaded plain-text user turn, and the selected output appears as you type. It is built for developers reshaping prompts, evaluations or saved chat logs for another target API.",
  useCases: [
    "You have a working prompt as an OpenAI messages array and need the Anthropic shape, where the system prompt is hoisted into its own top-level system field instead of sitting in the array.",
    "You are moving an evaluation set to Gemini and need every assistant turn relabelled as role \"model\" with the text wrapped in parts, plus a systemInstruction block.",
    "A teammate pasted a chat transcript into a doc as Markdown, and you want it back as a valid JSON messages array you can drop into a test fixture.",
  ],
  benefits: [
    ["Six formats from one paste", "Switch the output tab and the same conversation is re-emitted as OpenAI, Anthropic, Gemini, Cohere, Llama or Markdown."],
    ["Handles the awkward role mappings", "Assistant becomes model for Gemini and CHATBOT for Cohere, and the system turn is moved or wrapped wherever each API expects it."],
    ["Reads Markdown transcripts too", "Input does not have to be JSON — a log with **User:** and **Assistant:** headings is parsed back into structured messages."],
  ],
  faqs: [
    [
      "What formats can it convert between?",
      "Six: OpenAI JSON, Anthropic JSON, Google Gemini, Cohere JSON, the Llama 2/3 prompt string, and Markdown text. Any of them can be the output; input is JSON (a messages array or an object containing one) or a Markdown transcript.",
    ],
    [
      "How does it handle the system prompt?",
      "It is repositioned to match each format. OpenAI keeps it as a message with role system, Anthropic moves it to a top-level system field beside messages, Gemini wraps it in systemInstruction, Cohere marks it SYSTEM in chat_history, and Llama wraps it in <<SYS>> tags inside the first [INST] block.",
    ],
    [
      "Can it parse a chat log that is not JSON?",
      "Yes. Recognised **User:**, **Assistant:**, **Bot:** and **System:** headings split Markdown into messages. Unheaded plain text is accepted as one user message; malformed JSON that begins with [ or { produces a parse error instead of falling back to text.",
    ],
    [
      "What does the Llama output look like?",
      "It produces the raw prompt string, not JSON: a system turn becomes <s>[INST] <<SYS>>…<</SYS>>, the user turn closes with [/INST], and each assistant reply ends with </s>. Downloads of the Llama and Markdown outputs are saved as .txt; the other four save as .json.",
    ],
  ],
};

export default seo;
