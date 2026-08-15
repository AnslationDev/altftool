const seo = {
  title: "AI Learning Roadmap: Prerequisite-Ordered Study",
  metaDescription:
    "Pick a goal and your hours per week to get an ordered plan from how LLMs work through retrieval and LoRA, with each module placed in a study week.",
  steps: [
    "Choose a goal under 'What do you want to be able to do?' - Prompt reliably at work, Build AI features and RAG apps, Fine-tune open models or Go deep on training and alignment - then set Prompting experience and Coding background.",
    "Enter Study hours per week (1 to 60), pick a Start date, and optionally type a figure into 'Weeks available (optional)'; there is no calculate button, the plan rebuilds as you type.",
    "Read Plan length in weeks with Modules to study, Total study hours, Calendar length and Target finish, then the Week-by-week modules list and the Hours by stage table; Copy result copies the roadmap.",
  ],
  intro:
    "AI Learning Roadmap Builder turns a goal, a starting point and your weekly study hours into an ordered curriculum that runs from how language models work through retrieval, evaluation and parameter-efficient fine-tuning. Modules are linked by hard prerequisites and sorted topologically, so nothing is scheduled before the thing it depends on, and each module's hour budget is divided by your available hours to place it in a specific study week. Useful for self-taught learners and for managers who need a defensible upskilling plan rather than a reading list.",
  useCases: [
    "Plan a 12-week upskilling block for an engineer moving from API integration to fine-tuning open-weight models.",
    "Check whether 4 hours a week is enough to reach a working RAG application before the next quarter starts.",
    "Skip the Python and ML foundations modules you already have and see only the gap between you and the goal.",
    "Give a team a shared sequence so everyone learns evaluation before they start shipping agent loops.",
  ],
  benefits: [
    ["Prerequisite-correct order", "A depth-first topological sort guarantees embeddings come before retrieval and transformers before LoRA."],
    ["Honest hour budgets", "Each module carries a study-hour estimate that assumes you build the practice project, not just watch a video."],
    ["Deadline check", "Enter the weeks you have and the plan tells you the hours per week required to actually finish."],
  ],
  faqs: [
    [
      "How long does it take to learn AI from scratch?",
      "It depends entirely on the end point. Reaching reliable prompting takes roughly 15-25 study hours, building a retrieval application on top of model APIs adds around 60-90 hours if you already code, and fine-tuning open-weight models typically needs 150+ hours because it requires machine-learning foundations and transformer internals first.",
    ],
    [
      "Do I need to know Python to work with AI?",
      "Not for prompting, structured output or governance work, which are all covered without code. You do need Python the moment you call model APIs directly, build retrieval pipelines or fine-tune anything — the roadmap adds a 20-hour Python module automatically unless you say you already have it.",
    ],
    [
      "What is the difference between prompting, RAG and fine-tuning?",
      "Prompting changes what you say to a fixed model, retrieval-augmented generation adds your own documents to the context at query time, and fine-tuning changes the model's weights on your data. Retrieval is the right answer for facts that change; fine-tuning is for format, tone or a task the base model handles badly even with good context.",
    ],
    [
      "Should I learn LoRA or full fine-tuning first?",
      "Learn parameter-efficient tuning such as LoRA or QLoRA first. It trains a small number of adapter parameters instead of all the weights, so it runs on a single consumer GPU and gives you the whole workflow — data formatting, training run, evaluation — at a fraction of the compute cost before you decide whether full-weight training is justified.",
    ],
  ],
};

export default seo;
