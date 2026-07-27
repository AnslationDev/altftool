const seo = {
  intro:
    "A Gemfile generator produces the Bundler manifest that lists a Ruby project's gem source, Ruby version and dependencies, including grouped and git-sourced gems. It also expands every pessimistic constraint so you can see the real range: ~> 1.2 means >= 1.2 and < 2.0, while ~> 1.2.3 means >= 1.2.3 and < 1.3.0. Useful when starting a Ruby or Rails project, or when reviewing whether a constraint is as tight as the author intended.",
  useCases: [
    "Starting a Rails application and writing the initial Gemfile with rails, pg and puma pinned, plus rspec-rails in the test group",
    "Temporarily pointing a gem at a fork with github: owner/repo and branch: main while a patch is waiting to be merged",
    "Explaining to a reviewer what ~> 6.1 actually permits before approving a dependency bump",
  ],
  benefits: [
    ["Constraint expansion", "Turns every ~> requirement into the explicit >= and < range RubyGems resolves it to."],
    ["Catches Bundler errors early", "Rejects duplicate gems, branch without a git source, and github: values that are not owner/repo."],
    ["Runs locally", "Gem names, forks and internal paths never leave your browser."],
  ],
  faqs: [
    [
      "What does the ~> operator mean in a Gemfile?",
      "It is the pessimistic version constraint: it allows the last digit you wrote to increase but nothing above it. ~> 6.4 permits 6.4, 6.5 and 6.9 but not 7.0, while ~> 6.4.1 permits 6.4.1 and 6.4.9 but not 6.5.0. It is the usual way to accept bug fixes without accepting breaking changes.",
    ],
    [
      "What is the difference between the Gemfile and Gemfile.lock?",
      "The Gemfile states the ranges you accept; Gemfile.lock records the exact version of every gem, including transitive ones, that Bundler resolved. Commit the lock file for applications so deploys and CI install identical versions — bundle install reads it, bundle update recalculates it.",
    ],
    [
      "When should a gem use require: false?",
      "When Bundler should install the gem but not load it automatically on Bundler.require. Command-line tools such as rubocop, and gems like bootsnap that you require yourself at a specific point in boot, are the common cases; it shortens boot time and avoids load-order surprises.",
    ],
    [
      "Do I need to specify a Ruby version in the Gemfile?",
      "It is optional but recommended for applications, because Bundler then refuses to install under a mismatched interpreter and hosting platforms read it to pick a runtime. Use ruby file: \".ruby-version\" to keep the value in one place rather than duplicating it.",
    ],
  ],
};

export default seo;
