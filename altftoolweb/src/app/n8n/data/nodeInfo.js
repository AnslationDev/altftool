// Human-readable descriptions for n8n node types + a helper that derives the
// "Node Details" section of a workflow detail page directly from its
// workflow JSON. No API/LLM needed.
import { stripEmojis } from "./text";

// Keyed by the leaf of the node type (e.g. "n8n-nodes-base.httpRequest" -> "httpRequest").
const NODE_DESCRIPTIONS = {
  // Triggers
  manualTrigger: "Starts the workflow manually when you click 'Execute workflow' — used for testing and manual runs.",
  scheduleTrigger: "Starts the workflow automatically on a schedule (cron / fixed interval).",
  cron: "Starts the workflow on a recurring cron schedule.",
  webhook: "Starts the workflow when an external service sends an HTTP request to a webhook URL.",
  formTrigger: "Starts the workflow from a public form submission, capturing the submitted fields.",
  chatTrigger: "Starts the workflow when a chat message is received through the chat interface.",
  telegramTrigger: "Starts the workflow when a message is received by the Telegram bot.",
  gmailTrigger: "Starts the workflow when a new email arrives in Gmail.",
  mcpTrigger: "Exposes this workflow as an MCP server so external AI agents can call it as a tool.",
  executeWorkflowTrigger: "Entry point used when this workflow is executed by another workflow.",

  // Core logic / data
  set: "Sets or transforms workflow data — prepares, renames, or injects fields before the next step.",
  code: "Runs custom JavaScript to transform or manipulate the data flowing through the workflow.",
  if: "Branches the workflow based on a true/false condition.",
  switch: "Routes the workflow down one of several paths based on a value.",
  filter: "Keeps only the items that match a condition and discards the rest.",
  merge: "Combines data from multiple branches back into a single stream.",
  aggregate: "Combines multiple items into a single aggregated item.",
  splitOut: "Splits an array field into individual items so each can be processed separately.",
  splitInBatches: "Loops over items in batches, processing each one in turn (used for iteration).",
  wait: "Pauses the workflow for a set time or until a condition is met (used for polling / async jobs).",
  noOp: "A pass-through step that does nothing — used to organize the flow.",
  stickyNote: "A note on the canvas documenting part of the workflow (not an executable step).",
  html: "Extracts data from, or generates, HTML content.",
  htmlExtract: "Extracts specific values from an HTML document.",
  dataTable: "Reads or writes rows in an n8n Data Table.",
  itemLists: "Manipulates lists of items — sorting, limiting, or removing duplicates.",
  dateTime: "Formats, parses, or calculates dates and times.",
  functionItem: "Runs custom JavaScript against each item individually.",

  // HTTP / integrations
  httpRequest: "Makes an external API call (HTTP request) to send or retrieve data from a third-party service.",
  respondToWebhook: "Sends the workflow's response back to the caller of the webhook.",

  // Google
  googleSheets: "Reads from or writes rows to a Google Sheets spreadsheet.",
  googleSheetsTool: "Lets the AI agent read from or write to Google Sheets as a callable tool.",
  googleDrive: "Uploads, downloads, or manages files in Google Drive.",
  googleDocs: "Reads from or writes to a Google Docs document.",
  googleCalendar: "Reads or creates events in Google Calendar.",
  googleCalendarTool: "Lets the AI agent read or create Google Calendar events as a tool.",
  googleTasksTool: "Lets the AI agent manage Google Tasks as a tool.",
  gmail: "Sends or reads email through Gmail.",
  gmailTool: "Lets the AI agent send email via Gmail as a callable tool.",
  googleGemini: "Calls Google Gemini for text, vision, or audio generation.",

  // Messaging / social
  telegram: "Sends or receives messages through a Telegram bot.",
  slack: "Sends or reads messages in Slack.",
  whatsApp: "Sends or receives WhatsApp messages.",
  discord: "Sends messages to a Discord channel.",
  blotato: "Publishes content to social media platforms via Blotato.",
  blotatoTool: "Lets the AI agent publish to social media via Blotato as a tool.",
  uploadPost: "Uploads and publishes a post to a social platform.",

  // Databases
  airtable: "Reads or writes records in an Airtable base.",
  nocoDb: "Reads or writes records in a NocoDB database.",
  postgres: "Runs queries against a PostgreSQL database.",
  mySql: "Runs queries against a MySQL database.",
  supabase: "Reads or writes rows in a Supabase (Postgres) database.",
  redis: "Reads or writes values in a Redis store.",
  mongoDb: "Reads or writes documents in a MongoDB collection.",

  // AI / LangChain
  agent: "The AI agent that orchestrates the workflow — it reasons over the input and decides which tools to call.",
  chainLlm: "A basic LLM chain that sends a prompt to the model and returns the formatted result.",
  lmChatOpenAi: "Provides the OpenAI chat model (GPT) that powers the AI reasoning in this workflow.",
  lmChatGoogleGemini: "Provides Google Gemini as the chat model for the AI steps.",
  lmChatOpenRouter: "Provides a language model via OpenRouter as the chat model.",
  lmChatAnthropic: "Provides an Anthropic Claude chat model for the AI steps.",
  lmChatGroq: "Provides a Groq-hosted chat model for fast AI inference.",
  lmChatMistralCloud: "Provides a Mistral chat model for the AI steps.",
  openAi: "Calls the OpenAI API for chat, image, or audio generation.",
  memoryBufferWindow: "Gives the AI short-term conversational memory of recent messages.",
  outputParserStructured: "Forces the AI output into a structured JSON schema for reliable downstream use.",
  toolThink: "Gives the AI agent a 'think' scratchpad step for intermediate reasoning.",
  toolWorkflow: "Exposes another n8n workflow to the AI agent as a callable tool.",
  toolHttpRequest: "Lets the AI agent call an external API (HTTP request) as a tool.",
  toolCode: "Lets the AI agent run custom code as a tool.",
  mcpClientTool: "Connects the AI agent to external tools via an MCP (Model Context Protocol) server.",
  vectorStorePinecone: "Stores and retrieves embeddings in a Pinecone vector database (for RAG).",
  vectorStoreSupabase: "Stores and retrieves embeddings in Supabase (for RAG).",
  embeddingsOpenAi: "Turns text into vector embeddings using OpenAI (for semantic search / RAG).",
  documentDefaultDataLoader: "Loads and prepares documents for the AI to read (RAG ingestion).",
  textSplitterRecursiveCharacterTextSplitter: "Splits long documents into chunks the AI can process.",

  // Media
  editImage: "Edits or composes images (resize, crop, overlay text, etc.).",
  firecrawlTool: "Lets the AI agent scrape and crawl web pages via Firecrawl as a tool.",
};

// "n8n-nodes-base.httpRequest" / "@n8n/n8n-nodes-langchain.agent" -> leaf key
export function nodeLeaf(type) {
  return String(type || "").split(".").pop() || "";
}

export function prettifyType(type) {
  const leaf = nodeLeaf(type);
  const spaced = leaf
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();
  return spaced
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bApi\b/g, "API")
    .replace(/\bLm\b/g, "LLM")
    .replace(/\bHttp\b/g, "HTTP")
    .replace(/\bUrl\b/g, "URL")
    .replace(/\bDb\b/g, "DB")
    .replace(/\bMcp\b/g, "MCP")
    .trim();
}

// Description for a node type, with sensible pattern fallbacks for the long tail.
export function describeNodeType(type) {
  const leaf = nodeLeaf(type);
  if (NODE_DESCRIPTIONS[leaf]) return NODE_DESCRIPTIONS[leaf];
  const pretty = prettifyType(type);
  if (/Trigger$/.test(leaf)) return `Starts the workflow when the ${pretty.replace(/ Trigger$/, "")} event occurs.`;
  if (/Tool$/.test(leaf)) return `A tool the AI agent can call to work with ${pretty.replace(/ Tool$/, "")}.`;
  if (/^lm|^lmChat/.test(leaf)) return "Provides the language model used by the AI steps.";
  if (/^embeddings/.test(leaf)) return "Generates vector embeddings for semantic search / retrieval.";
  if (/^vectorStore/.test(leaf)) return "Stores and retrieves embeddings for retrieval-augmented generation (RAG).";
  if (/^memory/.test(leaf)) return "Gives the AI agent conversational memory.";
  if (/^outputParser/.test(leaf)) return "Shapes the AI output into a predictable structure.";
  if (/httpRequest|^http/i.test(leaf)) return "Makes an external API call (HTTP request).";
  return `Handles the ${pretty} step in this workflow.`;
}

const isSticky = (type) => /stickyNote/i.test(type || "");

// Ordered list of nodes with a description for each — powers the "Node Details" section.
export function deriveNodeDetails(wfJson) {
  const nodes = (wfJson?.nodes || []).filter((n) => !isSticky(n.type));
  return nodes.map((n) => ({
    name: stripEmojis(n.name) || prettifyType(n.type),
    typeName: prettifyType(n.type),
    description: describeNodeType(n.type),
  }));
}
