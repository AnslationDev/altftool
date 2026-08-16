const seo = {
  title: "Composer.json Generator: PSR-4 Autoload & Scripts",
  metaDescription:
    "Assemble a valid composer.json — vendor/package name checks, PSR-4 autoloading, require and require-dev blocks, scripts — in Composer's own key order.",
  steps: [
    "Fill in the Name (vendor/package), Type, License and PHP requirement fields, plus the PSR-4 namespace prefix and Source directory for autoloading.",
    "Use Add package, Add dev package and Add script to build the require, require-dev and scripts blocks, each row taking a vendor/package name and a version constraint.",
    "Check the declared-requirements count and any warnings, then click Copy JSON to copy the generated composer.json.",
  ],
  intro:
    "This generator writes a composer.json — the manifest Composer reads to resolve PHP dependencies, register autoloading and expose scripts. It validates the package name against the vendor/package pattern in the Composer schema, checks every version constraint, and enforces the PSR-4 rule that a namespace prefix must end with a backslash. Aimed at anyone starting a PHP library or application and wanting the manifest right before the first composer install.",
  useCases: [
    "Bootstrapping a new PHP package with PSR-4 autoloading mapped from Acme\\Widget\\ to src/ and tests split into autoload-dev",
    "Adding a require-dev block for PHPUnit and PHP-CS-Fixer plus matching composer scripts so contributors can run composer test",
    "Fixing a manifest that Composer rejects because the package name has capital letters or the namespace prefix is missing its trailing backslash",
  ],
  benefits: [
    ["Schema-accurate output", "Keys are written in the order Composer itself produces, so diffs stay small."],
    ["Constraint checking", "Rejects malformed constraints before composer update fails on them."],
    ["Nothing leaves the page", "Package names, namespaces and author details stay in your browser."],
  ],
  faqs: [
    [
      "What is the difference between require and require-dev in composer.json?",
      "require lists packages your code needs at runtime and is installed for everyone, including people who depend on your package. require-dev lists tools only the maintainers need — test runners, linters, static analysers — and Composer skips them when you run composer install --no-dev, which is what you do on a production deploy.",
    ],
    [
      "What does the caret constraint ^8.2 actually allow?",
      "It allows any version from 8.2.0 up to but not including 9.0.0, because the caret pins the leftmost non-zero digit. For a 0.x package the rule is stricter: ^0.3 allows 0.3.x only, since in semantic versioning a 0.x minor bump may break the API.",
    ],
    [
      "Why does PSR-4 require a trailing backslash on the namespace?",
      "Because the value is a namespace prefix, not a class name, and Composer strips exactly that prefix before mapping the rest of the class name to a file path. Writing \"Acme\\Widget\": \"src/\" without the trailing backslash makes Composer emit a warning and the autoloader will not find your classes.",
    ],
    [
      "Should I commit composer.lock to version control?",
      "Commit it for applications and projects so every environment installs identical versions. For libraries the lock file is ignored by consumers, so many maintainers leave it out of the repository; either way run composer validate in CI to catch a lock file that has drifted from composer.json.",
    ],
  ],
};

export default seo;
