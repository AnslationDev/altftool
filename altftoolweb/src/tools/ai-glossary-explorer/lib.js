/**
 * AI Glossary Explorer — a plain-English glossary of artificial intelligence and
 * machine learning terminology, plus pure search, cross-reference and quiz helpers.
 *
 * No React, no JSX, no DOM. Every export is deterministic: same input -> same
 * output. The quiz takes a seed argument rather than reading the clock, so the
 * same seed always produces the same question.
 */

/** Term difficulty bands, ordered from most to least approachable. */
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

/**
 * The glossary. Each entry:
 *  id       stable slug used for cross-references
 *  term     the name as it is normally written
 *  aliases  other spellings and abbreviations people search for
 *  category grouping used by the filter
 *  level    rough difficulty band
 *  short    one-sentence definition, written to stand alone
 *  long     two or three sentences of detail
 *  example  a concrete instance, never a restatement of the definition
 *  related  ids of terms worth reading next
 */
export const TERMS = [
  {
    id: "artificial-intelligence",
    term: "Artificial intelligence",
    aliases: ["AI"],
    category: "Foundations",
    level: "Beginner",
    short: "The field of building systems that perform tasks normally associated with human intelligence, such as recognising speech or planning a route.",
    long: "Artificial intelligence is an umbrella term rather than a single technique. It covers rule-based systems written by hand as well as statistical methods that learn from data, and what counts as AI shifts over time as techniques become routine.",
    example: "A spam filter, a chess engine and a language model are all AI, despite working in completely different ways.",
    related: ["machine-learning", "agi", "algorithm"],
  },
  {
    id: "machine-learning",
    term: "Machine learning",
    aliases: ["ML"],
    category: "Foundations",
    level: "Beginner",
    short: "A branch of AI in which a program improves at a task by finding patterns in data rather than following rules a person wrote.",
    long: "Instead of coding the rule 'emails containing this phrase are spam', you show the system labelled examples and it derives the rule itself. The output is a model: a set of numbers that map an input to a prediction.",
    example: "Showing a system 50,000 labelled emails and letting it work out which features predict spam.",
    related: ["supervised-learning", "model", "training-data"],
  },
  {
    id: "algorithm",
    term: "Algorithm",
    aliases: [],
    category: "Foundations",
    level: "Beginner",
    short: "A fixed procedure for turning an input into an output, written as a sequence of steps.",
    long: "In machine learning the word is used for the learning procedure — the recipe that adjusts a model's numbers — rather than for the trained model itself. Confusing the two is the most common misuse of the word.",
    example: "Gradient descent is an algorithm; the trained image classifier it produces is a model.",
    related: ["model", "gradient-descent"],
  },
  {
    id: "model",
    term: "Model",
    aliases: [],
    category: "Foundations",
    level: "Beginner",
    short: "The trained artefact — a set of parameters plus the structure that uses them — that turns an input into a prediction.",
    long: "A model is what you save to disk and load at inference time. Its behaviour is fixed once training stops, so any change in output comes from a change in the input, the prompt or the sampling settings.",
    example: "A 4 GB file of weights that, given a photo, returns probabilities across 1,000 object classes.",
    related: ["parameter", "inference", "training"],
  },
  {
    id: "training",
    term: "Training",
    aliases: ["fitting"],
    category: "Foundations",
    level: "Beginner",
    short: "The process of adjusting a model's parameters so its predictions on known examples get closer to the correct answers.",
    long: "Training repeatedly measures error with a loss function and nudges parameters in the direction that reduces it. It is compute-intensive and happens once; using the finished model afterwards is comparatively cheap.",
    example: "Running 90,000 batches of images through a network over three days on eight GPUs.",
    related: ["inference", "loss-function", "epoch"],
  },
  {
    id: "inference",
    term: "Inference",
    aliases: ["prediction", "serving"],
    category: "Foundations",
    level: "Beginner",
    short: "Using a trained model to produce an output for a new input, without changing the model.",
    long: "Inference is where nearly all real-world cost sits, because a model is trained once and queried millions of times. Nothing a user types during inference is learned by the model unless it is separately collected and used in a later training run.",
    example: "Sending a sentence to a translation model and getting the translated sentence back.",
    related: ["training", "latency", "quantisation"],
  },
  {
    id: "parameter",
    term: "Parameter",
    aliases: ["weight"],
    category: "Foundations",
    level: "Beginner",
    short: "One of the numbers inside a model that training adjusts, and that together determine what the model does.",
    long: "Parameter counts are quoted in millions or billions and are a rough proxy for capacity, not for quality. A well-trained smaller model routinely beats a poorly trained larger one on the same task.",
    example: "A model described as '7B' has about seven billion parameters.",
    related: ["hyperparameter", "model", "quantisation"],
  },
  {
    id: "hyperparameter",
    term: "Hyperparameter",
    aliases: [],
    category: "Foundations",
    level: "Intermediate",
    short: "A setting chosen before training that controls how learning happens, rather than a value learned from the data.",
    long: "Learning rate, batch size, number of layers and dropout rate are hyperparameters. They are usually chosen by searching over a range and keeping whichever setting scores best on a validation set.",
    example: "Trying learning rates of 0.1, 0.01 and 0.001 and keeping the one with the lowest validation loss.",
    related: ["learning-rate", "batch-size", "cross-validation"],
  },
  {
    id: "supervised-learning",
    term: "Supervised learning",
    aliases: [],
    category: "Machine learning",
    level: "Beginner",
    short: "Learning from examples that already carry the correct answer, so the model can be scored against a known target.",
    long: "It is the most widely used setting because the error signal is unambiguous. Its cost is the labelling: someone has to produce the correct answers, and their mistakes become the model's mistakes.",
    example: "Training on 10,000 chest X-rays each marked by a radiologist as normal or abnormal.",
    related: ["unsupervised-learning", "labelled-data", "classification"],
  },
  {
    id: "unsupervised-learning",
    term: "Unsupervised learning",
    aliases: [],
    category: "Machine learning",
    level: "Intermediate",
    short: "Learning structure from data that carries no labels, such as grouping similar items together.",
    long: "Because there is no correct answer to score against, evaluation is harder and more subjective. Clustering and dimensionality reduction are the classic examples.",
    example: "Grouping a retailer's customers into segments by purchase behaviour without deciding the segments in advance.",
    related: ["clustering", "supervised-learning", "embedding"],
  },
  {
    id: "reinforcement-learning",
    term: "Reinforcement learning",
    aliases: ["RL"],
    category: "Machine learning",
    level: "Advanced",
    short: "Learning by acting in an environment and receiving rewards, so the model learns a policy that maximises reward over time.",
    long: "There are no labelled correct actions, only consequences that may arrive long after the action that caused them. Designing the reward is the hard part: a reward that is easy to score is usually also easy to game.",
    example: "A game-playing agent that gets +1 for a win and learns which moves lead there.",
    related: ["rlhf", "alignment"],
  },
  {
    id: "classification",
    term: "Classification",
    aliases: [],
    category: "Machine learning",
    level: "Beginner",
    short: "Predicting which of a fixed set of categories an input belongs to.",
    long: "Binary classification has two classes; multiclass has more. Most classifiers output a probability per class, and the decision threshold applied to that probability is a separate choice from the model itself.",
    example: "Deciding whether a transaction is fraudulent or legitimate.",
    related: ["regression", "precision-recall", "confusion-matrix"],
  },
  {
    id: "regression",
    term: "Regression",
    aliases: [],
    category: "Machine learning",
    level: "Beginner",
    short: "Predicting a continuous number rather than a category.",
    long: "Error is measured as a distance — mean absolute error or root mean squared error — rather than as right or wrong. Squared error punishes large misses much harder than small ones, which changes what the model optimises for.",
    example: "Predicting tomorrow's electricity demand in megawatts.",
    related: ["classification", "loss-function"],
  },
  {
    id: "clustering",
    term: "Clustering",
    aliases: [],
    category: "Machine learning",
    level: "Intermediate",
    short: "Grouping data points so that items in the same group are more similar to each other than to items in other groups.",
    long: "The number of clusters is usually a choice, not a discovery, and different distance measures produce different groupings of the same data. Clusters are a hypothesis to inspect, not a fact.",
    example: "k-means splitting sensor readings into three operating regimes.",
    related: ["unsupervised-learning", "embedding"],
  },
  {
    id: "feature",
    term: "Feature",
    aliases: ["input variable"],
    category: "Machine learning",
    level: "Beginner",
    short: "One measurable property of an input that the model uses to make its prediction.",
    long: "Feature engineering — choosing, combining and scaling these properties — often matters more than the choice of algorithm for tabular data. Deep learning reduces the need for it by learning representations directly from raw input.",
    example: "For house price prediction: floor area, number of bedrooms, distance to a station.",
    related: ["embedding", "data-leakage"],
  },
  {
    id: "overfitting",
    term: "Overfitting",
    aliases: [],
    category: "Machine learning",
    level: "Beginner",
    short: "When a model learns the noise in its training data and therefore performs much worse on data it has not seen.",
    long: "The signature is a training score that keeps improving while the validation score stalls or worsens. Common remedies are more data, regularisation, early stopping and a simpler model.",
    example: "99% accuracy on the training set and 71% on the test set.",
    related: ["underfitting", "regularisation", "cross-validation"],
  },
  {
    id: "underfitting",
    term: "Underfitting",
    aliases: [],
    category: "Machine learning",
    level: "Beginner",
    short: "When a model is too simple or too constrained to capture the pattern, so it performs poorly even on its training data.",
    long: "Both training and validation scores are bad and close together. The fix is usually more capacity, better features or longer training, not more data.",
    example: "Fitting a straight line to data that clearly curves.",
    related: ["overfitting", "regularisation"],
  },
  {
    id: "cross-validation",
    term: "Cross-validation",
    aliases: ["k-fold"],
    category: "Machine learning",
    level: "Intermediate",
    short: "Splitting the data into k parts, training on k-1 of them and testing on the one held out, then rotating so every part is tested once.",
    long: "It gives a more stable estimate of performance than a single split, and a spread across folds that tells you how much the estimate can be trusted. With time-series data the folds must respect time order, or the model sees the future.",
    example: "Five-fold cross-validation reporting 84.2% accuracy with a spread of plus or minus 1.8 points.",
    related: ["overfitting", "data-leakage", "benchmark"],
  },
  {
    id: "gradient-descent",
    term: "Gradient descent",
    aliases: ["SGD", "stochastic gradient descent"],
    category: "Deep learning",
    level: "Intermediate",
    short: "The optimisation method that repeatedly nudges each parameter in the direction that most reduces the loss.",
    long: "The gradient says which way is downhill; the learning rate says how big a step to take. Stochastic gradient descent estimates the gradient from a small batch rather than the whole dataset, which is noisier but far cheaper.",
    example: "Reducing loss from 2.31 to 0.42 over 40,000 steps.",
    related: ["learning-rate", "loss-function", "backpropagation"],
  },
  {
    id: "loss-function",
    term: "Loss function",
    aliases: ["objective function", "cost function"],
    category: "Deep learning",
    level: "Intermediate",
    short: "The formula that turns the gap between a prediction and the correct answer into a single number to minimise.",
    long: "The loss defines what the model is actually optimising, which is not always what you want it to do. Cross-entropy is standard for classification; mean squared error is standard for regression.",
    example: "Cross-entropy loss falling from 2.3 (random guessing over ten classes) to 0.2.",
    related: ["gradient-descent", "regression", "perplexity"],
  },
  {
    id: "learning-rate",
    term: "Learning rate",
    aliases: [],
    category: "Deep learning",
    level: "Intermediate",
    short: "The size of the step taken in the direction of the gradient at each update.",
    long: "Too high and training diverges or oscillates; too low and it crawls or gets stuck. Most modern training schedules change it over time, typically warming up then decaying.",
    example: "Starting at 3e-4 and decaying to 3e-5 over the run.",
    related: ["gradient-descent", "hyperparameter", "epoch"],
  },
  {
    id: "epoch",
    term: "Epoch",
    aliases: [],
    category: "Deep learning",
    level: "Beginner",
    short: "One complete pass of the training algorithm over the whole training dataset.",
    long: "Small datasets are usually run for many epochs; very large ones are often trained for a single pass, because seeing fresh data beats revisiting old data. Watching validation loss across epochs is the standard way to spot overfitting.",
    example: "Training for 30 epochs and keeping the checkpoint from epoch 22, where validation loss was lowest.",
    related: ["batch-size", "overfitting", "training"],
  },
  {
    id: "batch-size",
    term: "Batch size",
    aliases: ["mini-batch"],
    category: "Deep learning",
    level: "Intermediate",
    short: "How many training examples are processed together before the parameters are updated once.",
    long: "Larger batches give a smoother gradient estimate and use hardware better, but need more memory and often a higher learning rate to match. It is one of the first settings limited by the GPU you actually have.",
    example: "A batch size of 32 images, so 1,563 updates per epoch on a 50,000-image set.",
    related: ["epoch", "learning-rate", "hyperparameter"],
  },
  {
    id: "regularisation",
    term: "Regularisation",
    aliases: ["regularization", "weight decay"],
    category: "Deep learning",
    level: "Intermediate",
    short: "Any technique that constrains a model to discourage it from fitting noise.",
    long: "Weight decay penalises large parameter values, dropout removes units at random during training, and early stopping halts before the model has time to memorise. All of them trade a little training accuracy for better performance on unseen data.",
    example: "Adding weight decay of 0.01 and watching the train-test gap narrow from 28 points to 6.",
    related: ["overfitting", "dropout", "hyperparameter"],
  },
  {
    id: "neural-network",
    term: "Neural network",
    aliases: ["deep learning", "ANN"],
    category: "Deep learning",
    level: "Beginner",
    short: "A model built from layers of simple units, each combining its inputs with learned weights and passing the result through a non-linear function.",
    long: "Depth — many layers stacked — lets later layers build on the representations found by earlier ones. The 'neuron' analogy is loose; the units are arithmetic, not biological models.",
    example: "An image classifier whose early layers respond to edges and whose later layers respond to whole objects.",
    related: ["activation-function", "backpropagation", "cnn"],
  },
  {
    id: "activation-function",
    term: "Activation function",
    aliases: ["ReLU", "sigmoid"],
    category: "Deep learning",
    level: "Intermediate",
    short: "The non-linear function applied to a unit's output, without which stacked layers would collapse into a single linear one.",
    long: "ReLU, which passes positive values and zeroes negatives, is the default in most modern networks because it is cheap and trains well. Sigmoid and softmax are used at the output when a probability is needed.",
    example: "ReLU turning an input of -1.4 into 0 and 2.7 into 2.7.",
    related: ["neural-network", "backpropagation"],
  },
  {
    id: "backpropagation",
    term: "Backpropagation",
    aliases: ["backprop"],
    category: "Deep learning",
    level: "Advanced",
    short: "The method for computing how much each parameter contributed to the error, by applying the chain rule backwards through the network.",
    long: "It makes gradient descent practical for deep models by computing all the gradients in roughly the cost of one forward pass. It is a way of calculating gradients, not a learning rule in itself.",
    example: "Propagating the error at the output layer back through twelve hidden layers to update every weight.",
    related: ["gradient-descent", "neural-network", "loss-function"],
  },
  {
    id: "cnn",
    term: "Convolutional neural network",
    aliases: ["CNN", "convnet"],
    category: "Deep learning",
    level: "Intermediate",
    short: "A network that slides small learned filters across an input, so the same pattern is detected wherever it appears.",
    long: "Sharing filters across positions cuts the parameter count dramatically and builds in the assumption that a feature means the same thing anywhere in the image. This is why CNNs dominated computer vision before transformers arrived.",
    example: "A 3x3 filter learning to respond to a vertical edge anywhere in a photograph.",
    related: ["neural-network", "transformer"],
  },
  {
    id: "rnn",
    term: "Recurrent neural network",
    aliases: ["RNN", "LSTM"],
    category: "Deep learning",
    level: "Advanced",
    short: "A network that processes a sequence one step at a time, carrying a hidden state forward from step to step.",
    long: "The sequential dependency makes RNNs hard to parallelise and prone to losing information across long spans, which LSTMs partly fixed with gating. Transformers largely replaced them for language work because they process a sequence in parallel.",
    example: "An LSTM reading a sentence word by word to predict the next word.",
    related: ["transformer", "attention", "neural-network"],
  },
  {
    id: "transformer",
    term: "Transformer",
    aliases: [],
    category: "Deep learning",
    level: "Advanced",
    short: "The neural network architecture behind most modern language models, built around attention rather than recurrence.",
    long: "Introduced in the 2017 paper 'Attention Is All You Need', it processes every position in a sequence in parallel and lets each position attend directly to every other. That parallelism is what made training on internet-scale text practical.",
    example: "GPT-style and BERT-style models are both transformers, differing in how they attend and what they are trained to predict.",
    related: ["attention", "llm", "embedding"],
  },
  {
    id: "attention",
    term: "Attention",
    aliases: ["self-attention"],
    category: "Deep learning",
    level: "Advanced",
    short: "A mechanism that lets each position in a sequence weigh how much every other position matters to it.",
    long: "Each position produces a query, a key and a value; the query is compared with every key to produce weights, which are used to blend the values. Because every position is compared with every other, cost grows with the square of the sequence length.",
    example: "In 'the cup fell because it was full', attention linking 'it' to 'cup' rather than to 'because'.",
    related: ["transformer", "context-window"],
  },
  {
    id: "embedding",
    term: "Embedding",
    aliases: ["vector representation"],
    category: "Deep learning",
    level: "Intermediate",
    short: "A list of numbers representing an item, arranged so that items with similar meaning sit close together.",
    long: "Embeddings turn words, images or products into coordinates where distance means similarity, which is what makes semantic search and recommendation possible. The dimensions are learned and usually have no individual human meaning.",
    example: "A 768-number vector for a paragraph, compared with others by cosine similarity.",
    related: ["transformer", "clustering", "feature"],
  },
  {
    id: "fine-tuning",
    term: "Fine-tuning",
    aliases: [],
    category: "Language models",
    level: "Intermediate",
    short: "Continuing to train an already-trained model on a smaller, targeted dataset so it specialises.",
    long: "It is far cheaper than training from scratch because the model already has general representations. Fine-tuning teaches format, tone and task behaviour reliably; it is a poor way to inject facts, which retrieval handles better.",
    example: "Taking a general language model and fine-tuning it on 4,000 support tickets to match a company's reply style.",
    related: ["transfer-learning", "llm", "training"],
  },
  {
    id: "transfer-learning",
    term: "Transfer learning",
    aliases: [],
    category: "Machine learning",
    level: "Intermediate",
    short: "Reusing a model trained on one task as the starting point for a different but related task.",
    long: "The early layers of a large model capture general structure that transfers well, so a new task can be learned from far fewer examples. It is the reason a useful classifier can be built from a few hundred labelled images.",
    example: "Starting from an image model trained on millions of photos to build a 12-class plant disease classifier from 900 images.",
    related: ["fine-tuning", "training"],
  },
  {
    id: "dropout",
    term: "Dropout",
    aliases: [],
    category: "Deep learning",
    level: "Intermediate",
    short: "A regularisation technique that randomly switches off a fraction of units during each training step.",
    long: "Because no unit can rely on any particular other unit being present, the network is pushed to spread information across many units. Dropout is applied during training only and switched off at inference.",
    example: "A dropout rate of 0.2 zeroing one unit in five at each step.",
    related: ["regularisation", "overfitting", "neural-network"],
  },
  {
    id: "llm",
    term: "Large language model",
    aliases: ["LLM"],
    category: "Language models",
    level: "Beginner",
    short: "A model with billions of parameters trained on very large amounts of text to predict what comes next, which produces broadly useful language behaviour.",
    long: "Everything an LLM does — answering, summarising, translating, writing code — comes out of next-token prediction plus later tuning on instructions and human preferences. It has no separate database of facts to consult unless one is attached to it.",
    example: "A model that continues 'The capital of France is' with 'Paris' because that continuation is overwhelmingly likely in its training data.",
    related: ["token", "context-window", "hallucination"],
  },
  {
    id: "token",
    term: "Token",
    aliases: ["tokenisation", "tokenization"],
    category: "Language models",
    level: "Beginner",
    short: "The unit of text a language model actually reads and writes — usually a word fragment rather than a whole word.",
    long: "For ordinary English prose one token is roughly four characters, so about 750 words per 1,000 tokens. Rare words, code, numbers and non-Latin scripts split into more tokens, which is why identical-looking texts can cost very differently.",
    example: "'unbelievable' splitting into 'un', 'bel', 'iev', 'able'.",
    related: ["context-window", "llm", "perplexity"],
  },
  {
    id: "context-window",
    term: "Context window",
    aliases: ["context length"],
    category: "Language models",
    level: "Beginner",
    short: "The maximum number of tokens a model can consider at once, covering the prompt and the answer together.",
    long: "Anything outside the window is invisible to the model, so long documents must be summarised or retrieved in pieces. Because the answer shares the budget, a prompt that fills the window leaves no room for a reply.",
    example: "A 128,000-token window holding roughly 300 pages of ordinary prose, minus whatever the answer needs.",
    related: ["token", "attention", "rag"],
  },
  {
    id: "prompt",
    term: "Prompt",
    aliases: ["prompt engineering"],
    category: "Language models",
    level: "Beginner",
    short: "The text given to a language model to specify the task, including any instructions, context and examples.",
    long: "Since the model has no memory between separate calls, everything it needs must be in the prompt or in the conversation history sent with it. Adding worked examples in the prompt is called few-shot prompting.",
    example: "'Summarise the text below in three bullet points, each under 15 words' followed by the text.",
    related: ["llm", "context-window", "temperature"],
  },
  {
    id: "temperature",
    term: "Temperature",
    aliases: ["sampling temperature"],
    category: "Language models",
    level: "Intermediate",
    short: "A sampling setting that controls how much randomness is allowed when the model picks the next token.",
    long: "At 0 the model always takes the most likely token, which is repeatable and best for extraction and classification. Higher values flatten the probabilities and produce more variety, at the cost of accuracy and consistency.",
    example: "Temperature 0 for pulling dates out of an invoice, around 0.8 for brainstorming names.",
    related: ["prompt", "llm", "hallucination"],
  },
  {
    id: "hallucination",
    term: "Hallucination",
    aliases: ["confabulation"],
    category: "Language models",
    level: "Beginner",
    short: "A fluent, confident output from a language model that is factually wrong or entirely invented.",
    long: "It happens because the model optimises for plausible continuations, not for truth, and nothing in the mechanism separates a remembered fact from a well-formed guess. Retrieval, citation requirements and verification steps reduce the rate but do not eliminate it.",
    example: "A model inventing a case citation with a realistic-looking number that does not exist.",
    related: ["rag", "llm", "temperature"],
  },
  {
    id: "rag",
    term: "Retrieval-augmented generation",
    aliases: ["RAG"],
    category: "Language models",
    level: "Intermediate",
    short: "Fetching relevant documents from a source you control and putting them in the prompt so the model answers from them rather than from memory.",
    long: "Retrieval is usually done with embeddings and a vector search, sometimes combined with keyword search. It is the standard way to keep answers current and to make them checkable, because the retrieved passages can be cited.",
    example: "Searching a 40,000-page policy library, passing the four best passages to the model and asking it to answer only from those.",
    related: ["embedding", "hallucination", "context-window"],
  },
  {
    id: "rlhf",
    term: "Reinforcement learning from human feedback",
    aliases: ["RLHF"],
    category: "Language models",
    level: "Advanced",
    short: "A training stage that tunes a model against human preferences between candidate answers, rather than against a fixed correct answer.",
    long: "People rank sampled outputs, a reward model is trained to predict those rankings, and the language model is optimised against that reward. It is what turns a raw next-token predictor into something that follows instructions and declines unsafe requests.",
    example: "Annotators choosing which of two answers is more helpful, thousands of times, to build the reward model.",
    related: ["reinforcement-learning", "alignment", "fine-tuning"],
  },
  {
    id: "diffusion-model",
    term: "Diffusion model",
    aliases: [],
    category: "Language models",
    level: "Advanced",
    short: "A generative model that learns to reverse a gradual noising process, turning random noise into a sample step by step.",
    long: "Training adds noise to real data in known amounts and teaches the model to predict what to remove. Diffusion models dominate image and audio generation, where they replaced earlier adversarial approaches.",
    example: "Starting from static and denoising over 30 steps into a photograph-like image.",
    related: ["multimodal", "neural-network"],
  },
  {
    id: "multimodal",
    term: "Multimodal model",
    aliases: ["vision-language model"],
    category: "Language models",
    level: "Intermediate",
    short: "A model that takes in or produces more than one kind of data, such as text together with images or audio.",
    long: "The usual approach maps each modality into a shared representation space so the model can relate a caption to a picture. Capability in one modality does not transfer automatically: a model may read charts well and hear speech poorly.",
    example: "Uploading a photograph of a receipt and asking for the total as text.",
    related: ["embedding", "llm", "diffusion-model"],
  },
  {
    id: "training-data",
    term: "Training data",
    aliases: ["corpus", "dataset"],
    category: "Data",
    level: "Beginner",
    short: "The examples a model learns from, which set the ceiling on what it can do.",
    long: "A model cannot learn a pattern absent from its data, and it will reproduce patterns present in it whether or not they are wanted. Provenance, licensing and consent for training data are live legal and ethical questions, not settled ones.",
    example: "A quality inspection model trained only on daylight photographs failing on the night shift.",
    related: ["labelled-data", "dataset-bias", "data-leakage"],
  },
  {
    id: "labelled-data",
    term: "Labelled data",
    aliases: ["annotation", "ground truth"],
    category: "Data",
    level: "Beginner",
    short: "Examples that carry the correct answer, produced by people or by a trusted process.",
    long: "Labelling is usually the most expensive part of a supervised project and the most common source of a hidden ceiling on accuracy. Where two competent annotators disagree, no model can be reliably right.",
    example: "Two radiologists agreeing on 91% of cases, which caps what the model can be scored against.",
    related: ["supervised-learning", "training-data"],
  },
  {
    id: "data-leakage",
    term: "Data leakage",
    aliases: ["target leakage"],
    category: "Data",
    level: "Advanced",
    short: "When information that would not be available at prediction time gets into training, producing scores that collapse in production.",
    long: "The classic forms are testing on rows that also appear in training, and including a feature that is a consequence of the answer. It is the usual explanation for a model that scores brilliantly offline and fails on the first real day.",
    example: "Including 'date claim was paid' as a feature when predicting whether a claim will be approved.",
    related: ["cross-validation", "overfitting", "benchmark"],
  },
  {
    id: "dataset-bias",
    term: "Dataset bias",
    aliases: ["bias"],
    category: "Safety and ethics",
    level: "Intermediate",
    short: "A systematic skew in the training data that the model learns and then reproduces at scale.",
    long: "It arises from who was measured, how they were labelled and what was left out, so it cannot be fixed by the algorithm alone. Measuring performance separately for each affected group is the only reliable way to see it.",
    example: "A hiring model trained on a decade of past hires reproducing that decade's hiring pattern.",
    related: ["training-data", "alignment", "model-card"],
  },
  {
    id: "accuracy",
    term: "Accuracy",
    aliases: [],
    category: "Evaluation",
    level: "Beginner",
    short: "The share of predictions that were correct.",
    long: "Accuracy is misleading whenever classes are imbalanced: predicting 'not fraud' every time on a dataset with 1% fraud is 99% accurate and useless. Precision, recall and the confusion matrix say what accuracy hides.",
    example: "980 correct out of 1,000 predictions is 98% accuracy — which may still mean every fraud was missed.",
    related: ["precision-recall", "confusion-matrix", "f1-score"],
  },
  {
    id: "precision-recall",
    term: "Precision and recall",
    aliases: ["sensitivity"],
    category: "Evaluation",
    level: "Intermediate",
    short: "Precision is the share of positive predictions that were right; recall is the share of actual positives that were found.",
    long: "They trade against each other through the decision threshold: catching more true cases usually means more false alarms. Which one matters more is a decision about consequences, not about statistics.",
    example: "A screening test with 95% recall and 30% precision finds almost every case but sends many healthy people for further tests.",
    related: ["f1-score", "confusion-matrix", "accuracy"],
  },
  {
    id: "f1-score",
    term: "F1 score",
    aliases: ["F-measure"],
    category: "Evaluation",
    level: "Intermediate",
    short: "The harmonic mean of precision and recall, giving one number that only rises when both are reasonable.",
    long: "The harmonic mean is used precisely because it punishes imbalance: precision 1.0 with recall 0.1 gives an F1 of about 0.18, not 0.55. Report precision and recall alongside it, since very different pairs can share an F1.",
    example: "Precision 0.8 and recall 0.6 give an F1 of 0.686.",
    related: ["precision-recall", "accuracy", "benchmark"],
  },
  {
    id: "confusion-matrix",
    term: "Confusion matrix",
    aliases: [],
    category: "Evaluation",
    level: "Beginner",
    short: "A table of predicted class against actual class, showing exactly which errors the model makes.",
    long: "For two classes it gives true positives, false positives, true negatives and false negatives, from which every other classification metric is derived. It is the first thing to look at when a headline score seems too good.",
    example: "A matrix revealing that all the errors are one class being mistaken for one other.",
    related: ["precision-recall", "accuracy", "f1-score"],
  },
  {
    id: "benchmark",
    term: "Benchmark",
    aliases: ["leaderboard"],
    category: "Evaluation",
    level: "Intermediate",
    short: "A standard dataset and scoring procedure used to compare models on the same footing.",
    long: "Benchmarks age badly: once a test set is widely published it tends to leak into training data, and scores rise without capability rising. Treat a leaderboard as one weak signal and test on your own task before believing it.",
    example: "Two models one point apart on a public benchmark performing very differently on your documents.",
    related: ["data-leakage", "cross-validation", "perplexity"],
  },
  {
    id: "perplexity",
    term: "Perplexity",
    aliases: [],
    category: "Evaluation",
    level: "Advanced",
    short: "A measure of how surprised a language model is by a text — the exponential of its average per-token loss.",
    long: "A perplexity of 20 means the model was about as uncertain as if it had been choosing uniformly among 20 options at each token. It is comparable only between models that use the same tokenizer and the same evaluation text.",
    example: "Perplexity falling from 34 to 18 on a held-out corpus after further training.",
    related: ["loss-function", "token", "benchmark"],
  },
  {
    id: "alignment",
    term: "Alignment",
    aliases: [],
    category: "Safety and ethics",
    level: "Intermediate",
    short: "The problem of getting a system to pursue what people actually intend rather than a proxy that is easier to measure.",
    long: "It covers both the technical work of training toward intended behaviour and the harder question of whose intentions count. Reward hacking — scoring well while defeating the purpose — is the everyday form of misalignment.",
    example: "A model told to maximise engagement learning that outrage is engaging.",
    related: ["rlhf", "dataset-bias", "explainability"],
  },
  {
    id: "explainability",
    term: "Explainability",
    aliases: ["interpretability", "XAI"],
    category: "Safety and ethics",
    level: "Intermediate",
    short: "The extent to which a person can understand why a model produced a particular output.",
    long: "Simple models such as decision trees are inspectable by construction; large networks need post-hoc methods that give an approximation, not the true reason. In several regulated settings an explanation is a legal requirement rather than a nice-to-have.",
    example: "A loan decision accompanied by the three features that most moved the score.",
    related: ["model-card", "alignment"],
  },
  {
    id: "model-card",
    term: "Model card",
    aliases: ["datasheet"],
    category: "Safety and ethics",
    level: "Beginner",
    short: "A short document published with a model that states what it was trained on, how it was evaluated and where it should not be used.",
    long: "Proposed in 2019 as a way to travel with the model the way a datasheet travels with a component. A card that reports performance broken down by group is far more useful than one quoting a single headline number.",
    example: "A card noting that accuracy falls from 94% to 71% on recordings with background noise.",
    related: ["dataset-bias", "explainability", "benchmark"],
  },
  {
    id: "agi",
    term: "Artificial general intelligence",
    aliases: ["AGI"],
    category: "Foundations",
    level: "Beginner",
    short: "A hypothetical system able to learn and perform any intellectual task a person can, rather than excelling at narrow ones.",
    long: "There is no agreed definition or test, and claims about its arrival should be read as opinion rather than measurement. Everything in production today is narrow AI, however broad its apparent range.",
    example: "A chess engine is superhuman at chess and cannot make a cup of tea; AGI is the claim that both could come from one system.",
    related: ["artificial-intelligence", "alignment"],
  },
  {
    id: "quantisation",
    term: "Quantisation",
    aliases: ["quantization", "int8", "4-bit"],
    category: "Deployment",
    level: "Advanced",
    short: "Storing a model's parameters at lower numerical precision to cut memory use and speed up inference.",
    long: "Moving from 16-bit to 8-bit roughly halves the memory a model needs, and 4-bit halves it again, with a quality cost that varies by model and task. It is what allows a model that needed a data-centre GPU to run on a laptop.",
    example: "A 13-billion-parameter model dropping from about 26 GB at 16-bit to about 7 GB at 4-bit.",
    related: ["parameter", "inference", "latency"],
  },
  {
    id: "latency",
    term: "Inference latency",
    aliases: ["time to first token"],
    category: "Deployment",
    level: "Intermediate",
    short: "How long a model takes to respond, usually split into time to the first token and the rate of tokens after it.",
    long: "For streamed text the first number governs how responsive the system feels while the second governs how long the whole answer takes. Longer prompts raise the first because the whole input must be processed before generation starts.",
    example: "400 ms to the first token, then 60 tokens a second.",
    related: ["inference", "quantisation", "context-window"],
  },
  {
    id: "mlops",
    term: "MLOps",
    aliases: [],
    category: "Deployment",
    level: "Intermediate",
    short: "The practices for getting models into production and keeping them working: versioning, deployment, monitoring and retraining.",
    long: "Models decay because the world changes, so the interesting question after launch is drift rather than accuracy on a frozen test set. Versioning data and training code matters as much as versioning the model file.",
    example: "An alert firing when the distribution of incoming requests shifts far enough from the training distribution.",
    related: ["inference", "benchmark", "data-leakage"],
  },
  {
    id: "edge-ai",
    term: "Edge AI",
    aliases: ["on-device AI"],
    category: "Deployment",
    level: "Intermediate",
    short: "Running a model on the device that captured the data rather than sending the data to a server.",
    long: "It removes network round trips and keeps raw data local, which helps both latency and privacy, at the cost of a smaller model and the device's power budget. Quantisation and distillation are the usual ways to make a model fit.",
    example: "Wake-word detection running on a phone so audio never leaves it.",
    related: ["quantisation", "latency", "inference"],
  },
];

export const CATEGORIES = Array.from(new Set(TERMS.map((entry) => entry.category))).sort();

/** Case-insensitive AND search across term, aliases, definition and example. */
export function searchTerms({ query = "", category = "All", level = "All" } = {}) {
  const terms = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return TERMS.filter((entry) => {
    if (category && category !== "All" && entry.category !== category) return false;
    if (level && level !== "All" && entry.level !== level) return false;
    if (terms.length === 0) return true;
    const haystack = `${entry.term} ${entry.aliases.join(" ")} ${entry.category} ${entry.short} ${entry.long} ${entry.example}`.toLowerCase();
    return terms.every((word) => haystack.includes(word));
  });
}

export function getTerm(id) {
  return TERMS.find((entry) => entry.id === id) || null;
}

/** Resolve an entry's `related` ids into entries, dropping any that do not exist. */
export function relatedTerms(id) {
  const entry = getTerm(id);
  if (!entry) return [];
  return entry.related.map((relatedId) => getTerm(relatedId)).filter(Boolean);
}

/** Entries that link to this one but are not linked from it — the reverse index. */
export function backlinks(id) {
  const entry = getTerm(id);
  if (!entry) return [];
  return TERMS.filter((other) => other.id !== id && other.related.includes(id) && !entry.related.includes(other.id));
}

/** Counts for the header. Pure and cheap enough to call on every render. */
export function glossaryStats() {
  const byCategory = {};
  const byLevel = {};
  for (const entry of TERMS) {
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
    byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
  }
  return { total: TERMS.length, categories: CATEGORIES.length, byCategory, byLevel };
}

/**
 * mulberry32 — a small, well-known 32-bit seeded generator. Used so the quiz is
 * reproducible from a seed instead of reading the clock inside the maths.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build one multiple-choice question: a definition, and four term names of which
 * one is correct. Deterministic for a given seed.
 *
 * @param {object} input
 * @param {number} input.seed Any integer. The same seed always gives the same question.
 * @param {number} input.optionCount How many choices to offer, 2 to 6.
 * @returns {object} { termId, prompt, options, answerIndex, category } or { error }.
 */
export function buildQuizQuestion({ seed, optionCount = 4 } = {}) {
  const seedValue = Number(seed);
  const count = Number(optionCount);

  if (!Number.isFinite(seedValue) || !Number.isInteger(seedValue)) {
    return { error: "Give the quiz a whole-number seed." };
  }
  if (!Number.isInteger(count) || count < 2 || count > 6) {
    return { error: "A question needs between 2 and 6 options." };
  }
  if (TERMS.length < count) {
    return { error: "The glossary does not hold enough terms for that many options." };
  }

  const random = mulberry32(Math.abs(seedValue) + 1);
  const answerIndexInGlossary = Math.floor(random() * TERMS.length) % TERMS.length;
  const answer = TERMS[answerIndexInGlossary];

  const distractors = [];
  const used = new Set([answer.id]);
  let guard = 0;
  while (distractors.length < count - 1 && guard < 500) {
    guard += 1;
    const candidate = TERMS[Math.floor(random() * TERMS.length) % TERMS.length];
    if (used.has(candidate.id)) continue;
    used.add(candidate.id);
    distractors.push(candidate);
  }
  // Deterministic fallback if the generator kept colliding.
  for (const candidate of TERMS) {
    if (distractors.length >= count - 1) break;
    if (used.has(candidate.id)) continue;
    used.add(candidate.id);
    distractors.push(candidate);
  }

  const pool = [answer, ...distractors];
  // Fisher-Yates with the same seeded generator, so the answer position varies.
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const temporary = pool[index];
    pool[index] = pool[swap];
    pool[swap] = temporary;
  }

  return {
    termId: answer.id,
    prompt: answer.short,
    options: pool.map((entry) => ({ id: entry.id, term: entry.term })),
    answerIndex: pool.findIndex((entry) => entry.id === answer.id),
    category: answer.category,
  };
}
