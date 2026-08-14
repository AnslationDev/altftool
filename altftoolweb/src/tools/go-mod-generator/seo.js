const seo = {
  title: "go.mod Generator: Module Path, require and replace",
  metaDescription:
    "Set the module path, go and toolchain directives, add require and replace rows, and copy a go.mod checked against the /vN suffix and semver rules.",
  steps: [
    "Enter the Module path, choose a go directive version, and fill \"toolchain (optional, Go 1.21+)\" with a build such as go1.24.2 if you need one.",
    "Press \"Add module\" under Requirements for each dependency path and Version like v1.2.3, tick \"// indirect\" where it applies, and use \"Add replace\" to point one at a local directory.",
    "Check the Direct requirements and Indirect requirements counts plus any warnings, then press \"Copy go.mod\".",
  ],
  intro:
    "A go.mod generator builds the module definition file that the go command reads to resolve dependencies: the module path, the go language version, an optional toolchain line, and the require, replace, exclude and retract directives. It validates your input against the rules in the Go Modules Reference — canonical semantic versions of the form vMAJOR.MINOR.PATCH, and the major version suffix rule that forces any module at v2 or above to end its path with /vN. Useful when you are starting a module by hand, vendoring a fork through a replace, or reviewing a go.mod in a code review.",
  useCases: [
    "Starting a new Go service and writing the first go.mod before any code exists, with the module path and go directive already correct",
    "Pointing a dependency at a local sibling checkout with a replace directive while you develop two modules side by side",
    "Checking whether a v2+ dependency path is written correctly, since github.com/user/repo v2.1.0 is rejected while github.com/user/repo/v2 v2.1.0 is accepted",
  ],
  benefits: [
    ["Catches the /vN mistake", "Flags a v2-or-higher version whose module path is missing the required major version suffix."],
    ["Correct directive order", "Emits module, go, toolchain, require, replace, exclude and retract in the layout go mod tidy produces."],
    ["Runs in your browser", "Module paths and internal package names are never uploaded anywhere."],
  ],
  faqs: [
    [
      "Why does Go require /v2 in the module path?",
      "Because the import compatibility rule says a new major version is a different module. From v2 onwards the module path must end with the element /vN, so github.com/user/repo/v2 and github.com/user/repo can be built into the same binary without a symbol clash. Versions v0 and v1 carry no suffix.",
    ],
    [
      "What is the difference between the go and toolchain directives?",
      "The go directive sets the minimum language version your module needs, while toolchain names the specific Go distribution to run, such as go1.24.2. The toolchain directive was introduced in Go 1.21 and is ignored by older releases, so it only makes sense alongside a go line of 1.21 or higher.",
    ],
    [
      "What does the // indirect comment mean in go.mod?",
      "It marks a requirement that no package in your module imports directly — it is there because a dependency needs it and its own go.mod did not record the version. Running go mod tidy adds, updates or removes these comments automatically, so you rarely write them by hand.",
    ],
    [
      "Does a replace directive apply to people who import my module?",
      "No. Replace and exclude directives are only honoured in the main module — the one you run the go command in. If your library depends on a fork, consumers will not get the replacement, so publish the fork under its own module path instead.",
    ],
  ],
};

export default seo;
