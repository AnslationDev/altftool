// src/data/questions.js

export const domains = [
  { id: 'frontend', name: 'Frontend Developer', icon: '💻' },
  { id: 'backend', name: 'Backend Developer', icon: '⚙️' },
  { id: 'mobile', name: 'Mobile Developer', icon: '📱' },
  { id: 'devops', name: 'DevOps Engineer', icon: '🚀' },
  { id: 'security', name: 'Cybersecurity', icon: '🔒' },
  { id: 'datascience', name: 'Data Scientist', icon: '📊' },
  { id: 'uiux', name: 'UI/UX Designer', icon: '🎨' },
  { id: 'product', name: 'Product Manager', icon: '📈' },
  { id: 'qa', name: 'QA Engineer', icon: '🐞' },
  { id: 'cloud', name: 'Cloud Architect', icon: '☁️' }, // NEW
  { id: 'gamedev', name: 'Game Developer', icon: '🎮' }, // NEW
  { id: 'blockchain', name: 'Blockchain Dev', icon: '🔗' }, // NEW
  { id: 'network', name: 'Network Engineer', icon: '🌐' }, // NEW
  { id: 'dba', name: 'Database Admin', icon: '🗄️' }, // NEW
  { id: 'hr', name: 'HR / Behavioral', icon: '🤝' },
];

export const questionsData = [
  // --- Frontend ---
  { 
    id: 1, 
    domain: 'frontend', 
    question: 'What is the difference between Real DOM and Virtual DOM?', 
    difficulty: 'Intermediate',
    answer: 'The Real DOM updates the entire tree structure even for small changes, which is slow. The Virtual DOM is a lightweight copy; it compares changes (diffing) and only updates the specific parts of the Real DOM that changed.'
  },
  { 
    id: 2, 
    domain: 'frontend', 
    question: 'Explain the concept of closures in JavaScript.', 
    difficulty: 'Advanced',
    answer: 'A closure is a function that remembers the variables from its outer scope even after the outer function has finished executing.'
  },
  { 
    id: 3, 
    domain: 'frontend', 
    question: 'What are React Hooks? Name a few common ones.', 
    difficulty: 'Beginner',
    answer: 'Hooks allow functional components to use state and lifecycle features. Common ones include useState, useEffect, useContext, and useRef.'
  },
  { 
    id: 4, 
    domain: 'frontend', 
    question: 'Explain CSS Box Model.', 
    difficulty: 'Beginner',
    answer: 'It describes the layout of elements: Content (center), Padding (space inside), Border (line around), and Margin (space outside).'
  },
  { 
    id: 5, 
    domain: 'frontend', 
    question: 'What is the difference between "var", "let", and "const"?', 
    difficulty: 'Beginner',
    answer: 'Var is function-scoped and can be redeclared. Let is block-scoped and mutable. Const is block-scoped and immutable (cannot be reassigned).'
  },
  { 
    id: 6, 
    domain: 'frontend', 
    question: 'How do you optimize a React application for performance?', 
    difficulty: 'Advanced',
    answer: 'Techniques include code splitting (Lazy/Suspense), memoization (useMemo/useCallback), virtualization for long lists, and optimizing images.'
  },
  { 
    id: 7, 
    domain: 'frontend', 
    question: 'What is Redux and how does it work?', 
    difficulty: 'Intermediate',
    answer: 'Redux is a state management library. It uses a central Store to hold state, Actions to describe changes, and Reducers to update the state based on actions.'
  },
  { 
    id: 8, 
    domain: 'frontend', 
    question: 'Explain the difference between Local Storage, Session Storage, and Cookies.', 
    difficulty: 'Intermediate',
    answer: 'Local Storage persists until deleted (10MB). Session Storage lasts until the tab closes (5MB). Cookies are smaller (4KB), sent with server requests, and have expiration dates.'
  },
  { 
    id: 9, 
    domain: 'frontend', 
    question: 'What is semantic HTML?', 
    difficulty: 'Beginner',
    answer: 'Using HTML tags that convey meaning (e.g., <header>, <article>, <footer>) rather than just <div>, which improves SEO and accessibility.'
  },
  { 
    id: 10, 
    domain: 'frontend', 
    question: 'Explain Event Bubbling and Event Capturing.', 
    difficulty: 'Advanced',
    answer: 'Bubbling is when an event triggers on the innermost element and propagates up to parents. Capturing is the reverse: triggers on the outer element and goes down.'
  },

  // --- Backend ---
  { 
    id: 11, 
    domain: 'backend', 
    question: 'What is RESTful API?', 
    difficulty: 'Beginner',
    answer: 'REST (Representational State Transfer) is an architectural style using HTTP methods (GET, POST, PUT, DELETE) to manage resources via URLs.'
  },
  { 
    id: 12, 
    domain: 'backend', 
    question: 'Difference between SQL and NoSQL databases.', 
    difficulty: 'Intermediate',
    answer: 'SQL (e.g., MySQL) is relational, table-based, and vertically scalable. NoSQL (e.g., MongoDB) is non-relational, document-based, and horizontally scalable.'
  },
  { 
    id: 13, 
    domain: 'backend', 
    question: 'What is ACID property in a database?', 
    difficulty: 'Advanced',
    answer: 'It ensures data integrity: Atomicity (all or nothing), Consistency (valid state), Isolation (transactions don\'t interfere), Durability (saved permanently).'
  },
  { 
    id: 14, 
    domain: 'backend', 
    question: 'Explain the concept of Middleware in Node.js.', 
    difficulty: 'Intermediate',
    answer: 'Middleware functions have access to the request and response objects. They can modify requests, execute code, or end the request-response cycle.'
  },
  { 
    id: 15, 
    domain: 'backend', 
    question: 'What is the difference between PUT and PATCH?', 
    difficulty: 'Intermediate',
    answer: 'PUT replaces the entire resource. PATCH updates only specific fields of the resource.'
  },
  { 
    id: 16, 
    domain: 'backend', 
    question: 'How do you handle authentication (JWT vs Sessions)?', 
    difficulty: 'Advanced',
    answer: 'Sessions store user data on the server. JWT (JSON Web Token) is stateless; the token is stored on the client and verified by the server.'
  },
  { 
    id: 17, 
    domain: 'backend', 
    question: 'What is Database Indexing?', 
    difficulty: 'Intermediate',
    answer: 'Indexing allows the database engine to find data faster without scanning the whole table, similar to a book index.'
  },
  { 
    id: 18, 
    domain: 'backend', 
    question: 'Explain Microservices Architecture.', 
    difficulty: 'Advanced',
    answer: 'Splitting an application into small, independent services that communicate via APIs, making them easier to scale and maintain individually.'
  },
  { 
    id: 19, 
    domain: 'backend', 
    question: 'What is Docker and why is it used?', 
    difficulty: 'Beginner',
    answer: 'Docker is a platform for containerization. It packages apps and dependencies into containers, ensuring they run consistently across any environment.'
  },
  { 
    id: 20, 
    domain: 'backend', 
    question: 'How do you prevent SQL Injection?', 
    difficulty: 'Intermediate',
    answer: 'Use Prepared Statements (Parameterized Queries) which treat user input as data, not executable code. Also, validate and sanitize input.'
  },

  // --- Mobile Development (NEW) ---
  { 
    id: 51, 
    domain: 'mobile', 
    question: 'What is the difference between Native and Hybrid Apps?', 
    difficulty: 'Beginner',
    answer: 'Native apps are built for a specific OS (Swift/iOS, Kotlin/Android) offering high performance. Hybrid apps (React Native/Flutter) run on both using a shared codebase but may have slight performance trade-offs.'
  },
  { 
    id: 52, 
    domain: 'mobile', 
    question: 'Explain the Activity Lifecycle in Android.', 
    difficulty: 'Intermediate',
    answer: 'Key states include onCreate (created), onStart (visible), onResume (interactive), onPause (partial loss of focus), onStop (hidden), and onDestroy (removed).'
  },
  { 
    id: 53, 
    domain: 'mobile', 
    question: 'What is the difference between State and Props in React Native?', 
    difficulty: 'Beginner',
    answer: 'Props are read-only data passed from parent to child. State is mutable data managed within the component itself.'
  },
  { 
    id: 54, 
    domain: 'mobile', 
    question: 'What is an APK and an IPA?', 
    difficulty: 'Beginner',
    answer: 'APK (Android Package Kit) is the file format for Android apps. IPA (iOS App Store Package) is the file format for iOS apps.'
  },
  { 
    id: 55, 
    domain: 'mobile', 
    question: 'How do you handle offline storage in mobile apps?', 
    difficulty: 'Intermediate',
    answer: 'Common solutions include SQLite (local database), AsyncStorage (key-value pair), or Realm for local data persistence.'
  },
  { 
    id: 56, 
    domain: 'mobile', 
    question: 'Explain the concept of "Lazy Loading" in lists.', 
    difficulty: 'Advanced',
    answer: 'Lazy loading renders only the items currently visible on the screen (e.g., using FlatList in React Native), improving performance and memory usage.'
  },
  { 
    id: 57, 
    domain: 'mobile', 
    question: 'What are Push Notifications?', 
    difficulty: 'Beginner',
    answer: 'Messages sent from a server to a user\'s device, appearing even when the app is not running, used to re-engage users.'
  },
  { 
    id: 58, 
    domain: 'mobile', 
    question: 'What is Gradle in Android development?', 
    difficulty: 'Intermediate',
    answer: 'Gradle is a build automation tool that manages dependencies, compilation, packaging, and testing for Android applications.'
  },
  { 
    id: 59, 
    domain: 'mobile', 
    question: 'Explain Auto Layout in iOS.', 
    difficulty: 'Intermediate',
    answer: 'Auto Layout dynamically calculates the size and position of views based on constraints, ensuring the UI looks good on all screen sizes.'
  },
  { 
    id: 60, 
    domain: 'mobile', 
    question: 'How do you prevent memory leaks in mobile apps?', 
    difficulty: 'Advanced',
    answer: 'Avoid strong reference cycles (retain cycles), unsubscribe from observers/events when components unmount, and release unused resources.'
  },

  // --- DevOps ---
  { 
    id: 21, 
    domain: 'devops', 
    question: 'What is CI/CD?', 
    difficulty: 'Beginner',
    answer: 'Continuous Integration (merging code frequently) and Continuous Deployment/Delivery (automating releases to production).'
  },
  { 
    id: 22, 
    domain: 'devops', 
    question: 'Explain the difference between Virtualization and Containerization.', 
    difficulty: 'Intermediate',
    answer: 'Virtualization (VMs) runs a full OS on top of hardware. Containerization (Docker) shares the host OS kernel, making it lighter and faster.'
  },
  { 
    id: 23, 
    domain: 'devops', 
    question: 'What is Infrastructure as Code (IaC)?', 
    difficulty: 'Advanced',
    answer: 'Managing infrastructure (servers, networks) through code files (like Terraform) rather than manual configuration.'
  },
  { 
    id: 24, 
    domain: 'devops', 
    question: 'Explain the master-slave architecture in Jenkins.', 
    difficulty: 'Advanced',
    answer: 'The Master schedules builds and monitors slaves. Slaves (Agents) are small java programs that execute the actual build tasks.'
  },
  { 
    id: 25, 
    domain: 'devops', 
    question: 'What is Kubernetes?', 
    difficulty: 'Intermediate',
    answer: 'Kubernetes (K8s) is an orchestration tool for automating deployment, scaling, and management of containerized applications.'
  },
  { 
    id: 26, 
    domain: 'devops', 
    question: 'How do you monitor a production server?', 
    difficulty: 'Intermediate',
    answer: 'Using tools like Prometheus, Grafana, or Nagios to track CPU, memory, uptime, and logs, and setting up alerts for anomalies.'
  },
  { 
    id: 27, 
    domain: 'devops', 
    question: 'What is Blue-Green Deployment?', 
    difficulty: 'Advanced',
    answer: 'A technique running two identical environments. Blue is live; Green is the new version. Traffic is switched to Green after testing to minimize downtime.'
  },
  { 
    id: 28, 
    domain: 'devops', 
    question: 'Explain the concept of Load Balancing.', 
    difficulty: 'Beginner',
    answer: 'Distributing incoming network traffic across multiple servers to ensure no single server becomes overwhelmed.'
  },
  { 
    id: 29, 
    domain: 'devops', 
    question: 'What is Git? Explain the difference between fetch and pull.', 
    difficulty: 'Beginner',
    answer: 'Git is version control. "Fetch" downloads changes but doesn\'t merge them. "Pull" downloads changes and immediately merges them into the current branch.'
  },
  { 
    id: 30, 
    domain: 'devops', 
    question: 'What is Ansible used for?', 
    difficulty: 'Intermediate',
    answer: 'Ansible is a configuration management tool used for automating software provisioning, configuration management, and application deployment.'
  },

  // --- Cybersecurity (NEW) ---
  { 
    id: 61, 
    domain: 'security', 
    question: 'What is the CIA Triad?', 
    difficulty: 'Beginner',
    answer: 'Confidentiality (keeping data secret), Integrity (ensuring data isn\'t tampered with), and Availability (ensuring data is accessible).'
  },
  { 
    id: 62, 
    domain: 'security', 
    question: 'Explain XSS (Cross-Site Scripting).', 
    difficulty: 'Intermediate',
    answer: 'An attack where malicious scripts are injected into trusted websites. It happens when an application includes untrusted data without validation.'
  },
  { 
    id: 63, 
    domain: 'security', 
    question: 'What is the difference between Symmetric and Asymmetric encryption?', 
    difficulty: 'Advanced',
    answer: 'Symmetric uses the same key for encryption and decryption. Asymmetric (Public Key) uses a public key to encrypt and a private key to decrypt.'
  },
  { 
    id: 64, 
    domain: 'security', 
    question: 'What is a Firewall?', 
    difficulty: 'Beginner',
    answer: 'A network security system that monitors and controls incoming and outgoing traffic based on predetermined security rules.'
  },
  { 
    id: 65, 
    domain: 'security', 
    question: 'Explain Phishing.', 
    difficulty: 'Beginner',
    answer: 'A social engineering attack where attackers impersonate a trusted entity (via email/SMS) to steal sensitive data like passwords.'
  },
  { 
    id: 66, 
    domain: 'security', 
    question: 'What is CSRF (Cross-Site Request Forgery)?', 
    difficulty: 'Intermediate',
    answer: 'An attack that forces an end user to execute unwanted actions on a web application in which they are currently authenticated.'
  },
  { 
    id: 67, 
    domain: 'security', 
    question: 'What is a DDOS attack?', 
    difficulty: 'Intermediate',
    answer: 'Distributed Denial of Service. It floods a server with traffic from multiple sources to make it unavailable to legitimate users.'
  },
  { 
    id: 68, 
    domain: 'security', 
    question: 'What is Salt in password hashing?', 
    difficulty: 'Advanced',
    answer: 'Random data added to a password before hashing to ensure that the same password results in a different hash, preventing rainbow table attacks.'
  },
  { 
    id: 69, 
    domain: 'security', 
    question: 'What is the purpose of HTTPS?', 
    difficulty: 'Beginner',
    answer: 'HTTPS uses TLS/SSL to encrypt data transferred between the user browser and the server, protecting it from eavesdropping.'
  },
  { 
    id: 70, 
    domain: 'security', 
    question: 'What is Penetration Testing?', 
    difficulty: 'Intermediate',
    answer: 'A simulated cyber attack against your computer system to check for exploitable vulnerabilities (Ethical Hacking).'
  },

  // --- Data Science ---
  { 
    id: 31, 
    domain: 'datascience', 
    question: 'Difference between Supervised and Unsupervised learning?', 
    difficulty: 'Beginner',
    answer: 'Supervised learning uses labeled data (input-output pairs). Unsupervised learning deals with unlabeled data and finding hidden structures.'
  },
  { 
    id: 32, 
    domain: 'datascience', 
    question: 'Explain Overfitting and Underfitting.', 
    difficulty: 'Intermediate',
    answer: 'Overfitting: Model learns noise and performs well on training data but poorly on new data. Underfitting: Model is too simple to capture patterns.'
  },
  { 
    id: 33, 
    domain: 'datascience', 
    question: 'What is a Confusion Matrix?', 
    difficulty: 'Intermediate',
    answer: 'A table used to evaluate the performance of a classification model. It shows True Positives, True Negatives, False Positives, and False Negatives.'
  },
  { 
    id: 34, 
    domain: 'datascience', 
    question: 'Explain the Central Limit Theorem.', 
    difficulty: 'Advanced',
    answer: 'It states that the distribution of sample means approximates a normal distribution as the sample size becomes larger, regardless of the population distribution.'
  },
  { 
    id: 35, 
    domain: 'datascience', 
    question: 'What is Data Cleaning?', 
    difficulty: 'Beginner',
    answer: 'The process of fixing or removing incorrect, corrupted, incorrectly formatted, duplicate, or incomplete data within a dataset.'
  },
  { 
    id: 36, 
    domain: 'datascience', 
    question: 'Difference between Pandas Series and DataFrame.', 
    difficulty: 'Beginner',
    answer: 'A Series is a one-dimensional labeled array. A DataFrame is a two-dimensional data structure (like a table) made up of multiple Series.'
  },
  { 
    id: 37, 
    domain: 'datascience', 
    question: 'What is A/B Testing?', 
    difficulty: 'Intermediate',
    answer: 'A statistical method of comparing two versions of a variable (A and B) to determine which one performs better.'
  },
  { 
    id: 38, 
    domain: 'datascience', 
    question: 'Explain Gradient Descent.', 
    difficulty: 'Advanced',
    answer: 'An optimization algorithm used to minimize the cost function by iteratively moving towards the steepest descent.'
  },
  { 
    id: 39, 
    domain: 'datascience', 
    question: 'What is the difference between correlation and causation?', 
    difficulty: 'Intermediate',
    answer: 'Correlation means two variables move together. Causation means one variable actually causes the change in the other.'
  },
  { 
    id: 40, 
    domain: 'datascience', 
    question: 'How do you handle missing values in a dataset?', 
    difficulty: 'Intermediate',
    answer: 'Options: Drop the rows/cols (if data is plentiful), Impute with Mean/Median/Mode, or use algorithms that handle missing values (like Trees).'
  },

  // --- HR / Behavioral ---
  { 
    id: 41, 
    domain: 'hr', 
    question: 'Tell me about yourself.', 
    difficulty: 'Beginner',
    answer: 'Briefly mention your background, your key skills, your current role, and why you are interested in this specific opportunity.'
  },
  { 
    id: 42, 
    domain: 'hr', 
    question: 'What are your greatest strengths and weaknesses?', 
    difficulty: 'Beginner',
    answer: 'Strength: Pick a skill relevant to the job. Weakness: Pick a real weakness but explain the steps you are taking to improve it.'
  },
  { 
    id: 43, 
    domain: 'hr', 
    question: 'Why do you want to work for this company?', 
    difficulty: 'Intermediate',
    answer: 'Show you have researched them. Mention their culture, products, or recent news and how it aligns with your career goals.'
  },
  { 
    id: 44, 
    domain: 'hr', 
    question: 'Describe a challenging situation you faced and how you handled it.', 
    difficulty: 'Intermediate',
    answer: 'Use the STAR method: Situation, Task, Action, Result. Focus on the positive outcome and your problem-solving skills.'
  },
  { 
    id: 45, 
    domain: 'hr', 
    question: 'Where do you see yourself in 5 years?', 
    difficulty: 'Intermediate',
    answer: 'Express ambition to grow within the field, perhaps taking on leadership roles or mastering specific technologies relevant to the company.'
  },
  { 
    id: 46, 
    domain: 'hr', 
    question: 'How do you handle conflict with a coworker?', 
    difficulty: 'Advanced',
    answer: 'Focus on communication, active listening, finding common ground, and keeping it professional rather than personal.'
  },
  { 
    id: 47, 
    domain: 'hr', 
    question: 'Why are you leaving your current job?', 
    difficulty: 'Intermediate',
    answer: 'Focus on seeking new challenges, growth opportunities, or a change in direction, rather than badmouthing your current employer.'
  },
  { 
    id: 48, 
    domain: 'hr', 
    question: 'What motivates you?', 
    difficulty: 'Beginner',
    answer: 'Could be problem-solving, learning new things, seeing the impact of your work on users, or working in a collaborative team.'
  },
  { 
    id: 49, 
    domain: 'hr', 
    question: 'Do you prefer working independently or in a team?', 
    difficulty: 'Beginner',
    answer: 'Ideally, a balance. You can focus alone to get work done, but you value collaboration for brainstorming and feedback.'
  },
  { 
    id: 50, 
    domain: 'hr', 
    question: 'Do you have any questions for us?', 
    difficulty: 'Beginner',
    answer: 'ALWAYS ask questions. Examples: "What does a typical day look like?" or "What are the biggest challenges the team is facing?"'
  },
  // --- UI/UX Design (NEW) ---
  { 
    id: 71, 
    domain: 'uiux', 
    question: 'What is the difference between UI and UX?', 
    difficulty: 'Beginner',
    answer: 'UI (User Interface) focuses on the visual elements (colors, typography, buttons). UX (User Experience) focuses on the overall journey, usability, and how the user feels while interacting with the product.'
  },
  { 
    id: 72, 
    domain: 'uiux', 
    question: 'What is a Wireframe vs. a Prototype?', 
    difficulty: 'Intermediate',
    answer: 'A Wireframe is a low-fidelity static blueprint of the layout. A Prototype is a high-fidelity, interactive simulation of the final product used for testing.'
  },
  { 
    id: 73, 
    domain: 'uiux', 
    question: 'Explain the "60-30-10" rule in color theory.', 
    difficulty: 'Intermediate',
    answer: 'A balance rule for color palettes: 60% is the dominant color (usually neutral), 30% is the secondary color, and 10% is the accent color (for calls to action).'
  },
  { 
    id: 74, 
    domain: 'uiux', 
    question: 'What is a User Persona?', 
    difficulty: 'Beginner',
    answer: 'A semi-fictional character created based on research to represent a specific segment of your target audience, helping guide design decisions.'
  },
  { 
    id: 75, 
    domain: 'uiux', 
    question: 'What is White Space (Negative Space) and why is it important?', 
    difficulty: 'Beginner',
    answer: 'It is the empty space between elements. It improves readability, reduces cognitive load, and creates visual hierarchy.'
  },
  { 
    id: 76, 
    domain: 'uiux', 
    question: 'Explain the Design Thinking Process.', 
    difficulty: 'Advanced',
    answer: 'A non-linear iterative process: 1. Empathize (research users), 2. Define (state the problem), 3. Ideate (brainstorm), 4. Prototype (create solutions), 5. Test (validate).'
  },
  { 
    id: 77, 
    domain: 'uiux', 
    question: 'What are Figma Components?', 
    difficulty: 'Intermediate',
    answer: 'Reusable UI elements (like buttons or nav bars). Changing the "Main Component" automatically updates all "Instances" across the design.'
  },
  { 
    id: 78, 
    domain: 'uiux', 
    question: 'How do you design for Accessibility (a11y)?', 
    difficulty: 'Advanced',
    answer: 'Ensuring contrast ratios are high, providing alt text for images, supporting keyboard navigation, and not relying solely on color to convey information.'
  },
  { 
    id: 79, 
    domain: 'uiux', 
    question: 'What is A/B testing in design?', 
    difficulty: 'Intermediate',
    answer: 'Comparing two versions of a web page or app screen to see which one performs better (e.g., higher conversion rate).'
  },
  { 
    id: 80, 
    domain: 'uiux', 
    question: 'What is Responsive Design?', 
    difficulty: 'Beginner',
    answer: 'Designing an interface that adapts and looks good on all screen sizes (mobile, tablet, desktop) using fluid grids and flexible images.'
  },

  // --- Product Management (NEW) ---
  { 
    id: 81, 
    domain: 'product', 
    question: 'What is an MVP (Minimum Viable Product)?', 
    difficulty: 'Beginner',
    answer: 'A version of a product with just enough features to be usable by early customers and provide feedback for future development.'
  },
  { 
    id: 82, 
    domain: 'product', 
    question: 'What is the difference between Agile and Waterfall?', 
    difficulty: 'Intermediate',
    answer: 'Waterfall is linear and sequential (good for fixed requirements). Agile is iterative and flexible (good for changing requirements and fast delivery).'
  },
  { 
    id: 83, 
    domain: 'product', 
    question: 'How do you prioritize features? (RICE Framework)', 
    difficulty: 'Advanced',
    answer: 'Using the RICE score: Reach (how many people), Impact (how big the effect), Confidence (how sure we are), divided by Effort (time/resources).'
  },
  { 
    id: 84, 
    domain: 'product', 
    question: 'What are KPIs and OKRs?', 
    difficulty: 'Intermediate',
    answer: 'KPI (Key Performance Indicator) measures performance (e.g., daily active users). OKR (Objectives and Key Results) sets ambitious goals with measurable outcomes.'
  },
  { 
    id: 85, 
    domain: 'product', 
    question: 'What is a User Story?', 
    difficulty: 'Beginner',
    answer: 'A short description of a feature from the user perspective. Format: "As a [type of user], I want to [goal] so that [benefit]."'
  },
  { 
    id: 86, 
    domain: 'product', 
    question: 'How do you handle feature requests from stakeholders?', 
    difficulty: 'Intermediate',
    answer: 'Listen to understand the underlying problem, validate it against data/roadmap, and politely say "no" or "later" if it doesn\'t align with current goals.'
  },
  { 
    id: 87, 
    domain: 'product', 
    question: 'What is Churn Rate?', 
    difficulty: 'Intermediate',
    answer: 'The percentage of customers who stop using your product or service during a given time period.'
  },
  { 
    id: 88, 
    domain: 'product', 
    question: 'Explain the Product Lifecycle.', 
    difficulty: 'Advanced',
    answer: 'The stages a product goes through: Introduction (launch), Growth (gaining users), Maturity (peak market share), and Decline (market saturation/obsolescence).'
  },
  { 
    id: 89, 
    domain: 'product', 
    question: 'What is a PRD (Product Requirements Document)?', 
    difficulty: 'Advanced',
    answer: 'A document outlining the purpose, features, functionality, and behavior of a product feature to guide the development and design teams.'
  },
  { 
    id: 90, 
    domain: 'product', 
    question: 'How do you measure success for a new feature?', 
    difficulty: 'Beginner',
    answer: 'By defining success metrics before launch, such as adoption rate, retention, time spent, or conversion rate.'
  },

  // --- QA / Testing (NEW) ---
  { 
    id: 91, 
    domain: 'qa', 
    question: 'What is the difference between Manual and Automation Testing?', 
    difficulty: 'Beginner',
    answer: 'Manual testing is done by a human interacting with the software. Automation testing uses scripts/tools (like Selenium) to run tests automatically.'
  },
  { 
    id: 92, 
    domain: 'qa', 
    question: 'What is Regression Testing?', 
    difficulty: 'Intermediate',
    answer: 'Testing existing software features to ensure that recent code changes or updates haven\'t broken previously working functionality.'
  },
  { 
    id: 93, 
    domain: 'qa', 
    question: 'Explain the Bug Life Cycle.', 
    difficulty: 'Intermediate',
    answer: 'New -> Assigned -> Open -> Fixed -> Retest -> Verified -> Closed. (Or Reopened if the fix failed).'
  },
  { 
    id: 94, 
    domain: 'qa', 
    question: 'What is the difference between Severity and Priority?', 
    difficulty: 'Advanced',
    answer: 'Severity is the impact on the system (e.g., system crash = High Severity). Priority is how fast it needs to be fixed (e.g., typo on logo = Low Severity, High Priority).'
  },
  { 
    id: 95, 
    domain: 'qa', 
    question: 'What is Black Box vs White Box testing?', 
    difficulty: 'Beginner',
    answer: 'Black Box: Testing without knowing the internal code structure (user perspective). White Box: Testing internal structures and logic (developer perspective).'
  },
  { 
    id: 96, 
    domain: 'qa', 
    question: 'What is Smoke Testing?', 
    difficulty: 'Intermediate',
    answer: 'A preliminary test to check if the critical functions of the application work. If it fails, the build is rejected ("catching fire").'
  },
  { 
    id: 97, 
    domain: 'qa', 
    question: 'What is STLC (Software Testing Life Cycle)?', 
    difficulty: 'Advanced',
    answer: 'Requirement Analysis -> Test Planning -> Test Case Development -> Test Environment Setup -> Test Execution -> Test Cycle Closure.'
  },
  { 
    id: 98, 
    domain: 'qa', 
    question: 'Mention some common Automation Tools.', 
    difficulty: 'Beginner',
    answer: 'Selenium (Web), Appium (Mobile), Cypress (Frontend), JUnit/TestNG (Java Unit Tests), Postman (API).'
  },
  { 
    id: 99, 
    domain: 'qa', 
    question: 'What is Positive and Negative Testing?', 
    difficulty: 'Beginner',
    answer: 'Positive: Verifying the system does what it IS supposed to do. Negative: Verifying the system does NOT do what it is NOT supposed to do (handling errors).'
  },
  { 
    id: 100, 
    domain: 'qa', 
    question: 'What is API Testing?', 
    difficulty: 'Intermediate',
    answer: 'Testing the application programming interfaces directly to determine if they meet expectations for functionality, reliability, performance, and security.'
  },
  // --- Cloud Computing (NEW) ---
  { 
    id: 101, 
    domain: 'cloud', 
    question: 'What are the three main service models of Cloud Computing?', 
    difficulty: 'Beginner',
    answer: 'IaaS (Infrastructure as a Service), PaaS (Platform as a Service), and SaaS (Software as a Service).'
  },
  { 
    id: 102, 
    domain: 'cloud', 
    question: 'What is a Region and an Availability Zone (AZ)?', 
    difficulty: 'Intermediate',
    answer: 'A Region is a geographic location (e.g., US-East). An Availability Zone is an isolated data center within that region. Using multiple AZs provides high availability.'
  },
  { 
    id: 103, 
    domain: 'cloud', 
    question: 'Explain the concept of Serverless Computing (e.g., AWS Lambda).', 
    difficulty: 'Intermediate',
    answer: 'A model where the cloud provider runs the server and dynamically manages the allocation of machine resources. Developers only write code and pay for the compute time used.'
  },
  { 
    id: 104, 
    domain: 'cloud', 
    question: 'What is Auto-Scaling?', 
    difficulty: 'Beginner',
    answer: 'The ability to automatically adjust the number of active servers (instances) based on the current traffic load to maintain performance and reduce costs.'
  },
  { 
    id: 105, 
    domain: 'cloud', 
    question: 'What is an S3 Bucket?', 
    difficulty: 'Beginner',
    answer: 'Amazon S3 (Simple Storage Service) is object storage built to store and retrieve any amount of data from anywhere. A "bucket" is a container for objects (files).'
  },
  { 
    id: 106, 
    domain: 'cloud', 
    question: 'What is a VPC (Virtual Private Cloud)?', 
    difficulty: 'Advanced',
    answer: 'A logically isolated section of the cloud where you can launch resources in a virtual network that you define (controlling IP ranges, subnets, and gateways).'
  },
  { 
    id: 107, 
    domain: 'cloud', 
    question: 'Explain the difference between Horizontal and Vertical Scaling.', 
    difficulty: 'Intermediate',
    answer: 'Vertical Scaling (Scaling Up) means adding more power (CPU/RAM) to an existing machine. Horizontal Scaling (Scaling Out) means adding more machines to the pool.'
  },
  { 
    id: 108, 
    domain: 'cloud', 
    question: 'What is a Content Delivery Network (CDN)?', 
    difficulty: 'Beginner',
    answer: 'A network of geographically distributed servers that deliver cached content (like images or videos) to users based on their location to reduce latency.'
  },
  { 
    id: 109, 
    domain: 'cloud', 
    question: 'What is the "Shared Responsibility Model"?', 
    difficulty: 'Advanced',
    answer: 'A security framework where the Cloud Provider is responsible for the "Security OF the Cloud" (hardware, infra), and the Customer is responsible for "Security IN the Cloud" (data, OS, firewall).'
  },
  { 
    id: 110, 
    domain: 'cloud', 
    question: 'What is Edge Computing?', 
    difficulty: 'Advanced',
    answer: 'Processing data closer to where it is created (the "edge" of the network, like IoT devices) rather than sending it all to a centralized cloud, reducing latency.'
  },

  // --- Game Development (NEW) ---
  { 
    id: 111, 
    domain: 'gamedev', 
    question: 'What is the "Game Loop"?', 
    difficulty: 'Beginner',
    answer: 'The core process of a game that runs continuously: Process Input -> Update Game State -> Render Graphics. This happens repeatedly (e.g., 60 times per second).'
  },
  { 
    id: 112, 
    domain: 'gamedev', 
    question: 'Difference between Frame Rate (FPS) and Refresh Rate.', 
    difficulty: 'Intermediate',
    answer: 'FPS is how many frames the GPU renders per second. Refresh Rate is how many times the monitor updates the screen per second (measured in Hz).'
  },
  { 
    id: 113, 
    domain: 'gamedev', 
    question: 'What is a Sprite?', 
    difficulty: 'Beginner',
    answer: 'A 2D bitmap image that is integrated into a larger scene, often used for characters and items in 2D games.'
  },
  { 
    id: 114, 
    domain: 'gamedev', 
    question: 'Explain Ray Casting.', 
    difficulty: 'Advanced',
    answer: 'A technique used to calculate the path of light or a projectile. In gameplay, it is often used for shooting mechanics (checking if a line from the gun hits an enemy).'
  },
  { 
    id: 115, 
    domain: 'gamedev', 
    question: 'What is a Mesh and a Collider?', 
    difficulty: 'Intermediate',
    answer: 'A Mesh defines the visual shape (vertices/polygons) of a 3D object. A Collider defines the physical shape for detecting interactions (collisions) with other objects.'
  },
  { 
    id: 116, 
    domain: 'gamedev', 
    question: 'What is Delta Time?', 
    difficulty: 'Intermediate',
    answer: 'The time difference between the current frame and the previous frame. It is used to make movement independent of frame rate (so the game runs at the same speed on fast and slow computers).'
  },
  { 
    id: 117, 
    domain: 'gamedev', 
    question: 'Difference between Unreal Engine and Unity.', 
    difficulty: 'Beginner',
    answer: 'Unity uses C# and is very popular for mobile/indie/2D games. Unreal uses C++ (or Blueprints) and is known for high-end graphical fidelity (AAA games).'
  },
  { 
    id: 118, 
    domain: 'gamedev', 
    question: 'What is a Shader?', 
    difficulty: 'Advanced',
    answer: 'A program running on the GPU that determines how to render pixels or vertices, used for effects like lighting, shadows, water, and fire.'
  },
  { 
    id: 119, 
    domain: 'gamedev', 
    question: 'What is Rigging in 3D animation?', 
    difficulty: 'Intermediate',
    answer: 'The process of creating a skeleton (bones and joints) for a 3D model so that it can be animated.'
  },
  { 
    id: 120, 
    domain: 'gamedev', 
    question: 'What is a NavMesh (Navigation Mesh)?', 
    difficulty: 'Advanced',
    answer: 'A data structure that defines the walkable surfaces of a game world, used by AI (NPCs) to find paths (Pathfinding) to a destination.'
  },

  // --- Blockchain (NEW) ---
  { 
    id: 121, 
    domain: 'blockchain', 
    question: 'What is a Blockchain?', 
    difficulty: 'Beginner',
    answer: 'A decentralized, distributed ledger that records transactions across many computers so that the record cannot be altered retroactively.'
  },
  { 
    id: 122, 
    domain: 'blockchain', 
    question: 'Explain Proof of Work (PoW) vs. Proof of Stake (PoS).', 
    difficulty: 'Intermediate',
    answer: 'PoW requires miners to solve complex math puzzles to validate blocks (energy intensive). PoS allows validators to validate blocks based on the amount of coins they hold/stake.'
  },
  { 
    id: 123, 
    domain: 'blockchain', 
    question: 'What is a Smart Contract?', 
    difficulty: 'Beginner',
    answer: 'Self-executing contracts with the terms of the agreement directly written into code. They run on the blockchain (e.g., Ethereum).'
  },
  { 
    id: 124, 
    domain: 'blockchain', 
    question: 'What is a DApp?', 
    difficulty: 'Beginner',
    answer: 'A Decentralized Application that runs on a blockchain network rather than a single centralized server.'
  },
  { 
    id: 125, 
    domain: 'blockchain', 
    question: 'What is "Gas" in Ethereum?', 
    difficulty: 'Intermediate',
    answer: 'A fee paid by users to compensate miners/validators for the computing energy required to process and validate a transaction.'
  },
  { 
    id: 126, 
    domain: 'blockchain', 
    question: 'What is the difference between a Public and Private Blockchain?', 
    difficulty: 'Intermediate',
    answer: 'Public (Permissionless) allows anyone to join (e.g., Bitcoin). Private (Permissioned) restricts access to authorized users (e.g., Hyperledger Fabric).'
  },
  { 
    id: 127, 
    domain: 'blockchain', 
    question: 'What is a Hash Function?', 
    difficulty: 'Advanced',
    answer: 'A mathematical algorithm that transforms input data into a fixed-size string of characters. In blockchain, it ensures data integrity (changing one character changes the whole hash).'
  },
  { 
    id: 128, 
    domain: 'blockchain', 
    question: 'What is a Fork (Hard vs Soft)?', 
    difficulty: 'Advanced',
    answer: 'A fork is a change in the protocol. Hard Fork is non-backward compatible (splits the chain). Soft Fork is backward compatible.'
  },
  { 
    id: 129, 
    domain: 'blockchain', 
    question: 'What is a Wallet address vs Private Key?', 
    difficulty: 'Beginner',
    answer: 'The Wallet Address is public (like an email address) used to receive funds. The Private Key is secret (like a password) used to sign transactions and access funds.'
  },
  { 
    id: 130, 
    domain: 'blockchain', 
    question: 'What is an NFT?', 
    difficulty: 'Intermediate',
    answer: 'Non-Fungible Token. A unique digital asset that verifies ownership of a specific item (art, music, game item) on the blockchain.'
  },

  // --- Network Engineer (NEW) ---
  { 
    id: 131, 
    domain: 'network', 
    question: 'What is the OSI Model? Name the layers.', 
    difficulty: 'Beginner',
    answer: 'A conceptual model for networking: 7. Application, 6. Presentation, 5. Session, 4. Transport, 3. Network, 2. Data Link, 1. Physical.'
  },
  { 
    id: 132, 
    domain: 'network', 
    question: 'Difference between TCP and UDP.', 
    difficulty: 'Intermediate',
    answer: 'TCP is connection-oriented and reliable (ensures delivery, like email). UDP is connectionless and faster but unreliable (packets may drop, like video streaming).'
  },
  { 
    id: 133, 
    domain: 'network', 
    question: 'What is DNS?', 
    difficulty: 'Beginner',
    answer: 'Domain Name System. It translates human-readable domain names (like google.com) into IP addresses (like 142.250.190.46) that computers understand.'
  },
  { 
    id: 134, 
    domain: 'network', 
    question: 'What is a Subnet Mask?', 
    difficulty: 'Advanced',
    answer: 'A number that divides an IP address into two parts: the Network Address and the Host Address, helping to determine if an IP is on the local network.'
  },
  { 
    id: 135, 
    domain: 'network', 
    question: 'What is DHCP?', 
    difficulty: 'Intermediate',
    answer: 'Dynamic Host Configuration Protocol. It automatically assigns IP addresses and other network configuration to devices on a network.'
  },
  { 
    id: 136, 
    domain: 'network', 
    question: 'Explain the difference between a Switch and a Router.', 
    difficulty: 'Beginner',
    answer: 'A Switch connects devices within the SAME network (LAN). A Router connects DIFFERENT networks together (e.g., your LAN to the Internet).'
  },
  { 
    id: 137, 
    domain: 'network', 
    question: 'What is a VPN?', 
    difficulty: 'Beginner',
    answer: 'Virtual Private Network. It creates a secure, encrypted tunnel over a public network (internet) to a private network.'
  },
  { 
    id: 138, 
    domain: 'network', 
    question: 'What is NAT (Network Address Translation)?', 
    difficulty: 'Intermediate',
    answer: 'A method of mapping multiple private IP addresses inside a local network to a single public IP address before transferring information to the internet.'
  },
  { 
    id: 139, 
    domain: 'network', 
    question: 'What is the ping command used for?', 
    difficulty: 'Beginner',
    answer: 'It uses the ICMP protocol to test the reachability of a host on an IP network and measures the round-trip time (latency).'
  },
  { 
    id: 140, 
    domain: 'network', 
    question: 'What is BGP?', 
    difficulty: 'Advanced',
    answer: 'Border Gateway Protocol. It is the protocol that manages how packets are routed across the internet through the exchange of routing and reachability information between edge routers.'
  },

  // --- Database Admin (NEW) ---
  { 
    id: 141, 
    domain: 'dba', 
    question: 'What is Database Normalization?', 
    difficulty: 'Beginner',
    answer: 'The process of organizing data in a database to reduce redundancy and improve data integrity (e.g., 1NF, 2NF, 3NF).'
  },
  { 
    id: 142, 
    domain: 'dba', 
    question: 'What is the difference between a Clustered and Non-Clustered Index?', 
    difficulty: 'Advanced',
    answer: 'Clustered Index determines the physical order of data in a table (only one per table). Non-Clustered Index is a separate structure that points to the data (like a book index).'
  },
  { 
    id: 143, 
    domain: 'dba', 
    question: 'What is Sharding?', 
    difficulty: 'Intermediate',
    answer: 'A database architecture pattern related to horizontal partitioning – splitting a large dataset into smaller chunks (shards) stored across multiple servers.'
  },
  { 
    id: 144, 
    domain: 'dba', 
    question: 'What is Replication?', 
    difficulty: 'Intermediate',
    answer: 'The process of copying data from one database server (Primary/Master) to one or more others (Replicas/Slaves) for backup and read-scaling.'
  },
  { 
    id: 145, 
    domain: 'dba', 
    question: 'What is a Stored Procedure?', 
    difficulty: 'Beginner',
    answer: 'A set of SQL statements with an assigned name, which are stored in the database and can be shared and reused by multiple programs.'
  },
  { 
    id: 146, 
    domain: 'dba', 
    question: 'Explain the difference between DELETE, TRUNCATE, and DROP.', 
    difficulty: 'Intermediate',
    answer: 'DELETE removes rows (can be rolled back). TRUNCATE resets the table (faster, cannot be rolled back easily). DROP removes the table structure entirely.'
  },
  { 
    id: 147, 
    domain: 'dba', 
    question: 'What is a Deadlock?', 
    difficulty: 'Advanced',
    answer: 'A situation where two or more transactions are waiting for one another to give up locks, resulting in a cycle where none can proceed.'
  },
  { 
    id: 148, 
    domain: 'dba', 
    question: 'What is CAP Theorem?', 
    difficulty: 'Advanced',
    answer: 'It states that a distributed data store can only provide two of the three guarantees: Consistency, Availability, and Partition Tolerance.'
  },
  { 
    id: 149, 
    domain: 'dba', 
    question: 'What is an ORM?', 
    difficulty: 'Beginner',
    answer: 'Object-Relational Mapping. A technique that converts data between incompatible type systems (Objects in code <-> Tables in DB), e.g., Hibernate, Sequelize.'
  },
  { 
    id: 150, 
    domain: 'dba', 
    question: 'What is a View?', 
    difficulty: 'Beginner',
    answer: 'A virtual table based on the result-set of an SQL statement. It contains rows and columns, just like a real table, but takes up no storage.'
  },
];