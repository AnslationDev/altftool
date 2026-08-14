const seo = {
  title: "Terraform required_providers Block Generator",
  metaDescription:
    "Builds the terraform block, required_providers map and provider blocks with registry source addresses, ~> or >= constraints and alias configurations.",
  steps: [
    "Pick a provider or \"Custom provider\", then set its local name, source address such as hashicorp/aws, and version.",
    "Choose the constraint style, pessimistic ~> or minimum >=, and press \"Add aliased configuration\" for a second region.",
    "Read the generated configuration, formatted the way terraform fmt leaves it, and press Copy HCL.",
  ],
  intro:
    "The Terraform Provider Block Generator writes the terraform block, the required_providers map and every matching provider block for you, complete with registry source addresses, version constraints and alias configurations. It follows the Terraform language rules exactly: a source address is [hostname/]namespace/type and defaults to registry.terraform.io, one provider block per provider may omit alias and become the default, and reusable child modules declare configuration_aliases instead of writing their own provider blocks. Output is formatted the way terraform fmt would leave it, with the = signs of consecutive arguments aligned.",
  useCases: [
    "Setting up a multi-region AWS root module with a default us-east-1 provider and an aliased eu-west-1 provider that resources select with provider = aws.eu.",
    "Deciding between ~> 5.31.0 and >= 5.31.0 for a provider pin, and seeing that the first allows only 5.31.x while the second lets Terraform jump to 6.0 on the next init -upgrade.",
    "Converting a root module into a reusable child module, which means dropping the provider blocks and declaring configuration_aliases = [aws.replica] instead.",
  ],
  benefits: [
    ["Correct constraint arithmetic", "Shows the exact window each operator opens: ~> 5.31.0 means >= 5.31.0 and < 5.32.0, while ~> 5.0 means >= 5.0 and < 6.0."],
    ["Catches the mistakes terraform init would", "Rejects duplicate local names, two unaliased configurations of the same provider, invalid aliases and malformed source addresses before you run anything."],
    ["Provider-specific requirements", "Adds the features {} block the azurerm provider has required since version 2.0 rather than letting init fail on it."],
  ],
  faqs: [
    [
      "What does ~> mean in a Terraform version constraint?",
      "It is the pessimistic constraint operator, and it allows only the rightmost version component you wrote to increment. ~> 5.31.0 permits >= 5.31.0 and < 5.32.0, so only patch releases; ~> 5.0 permits >= 5.0 and < 6.0, so any 5.x minor. Terraform rejects ~> 5 because the operator needs at least a major and a minor component to know what is allowed to move.",
    ],
    [
      "Where does the required_providers block go?",
      "Inside the terraform block, at the top level of the module: terraform { required_providers { aws = { source = \"hashicorp/aws\", version = \"~> 5.31.0\" } } }. Each entry is keyed by the provider's local name — the prefix of its resource types, so aws for aws_s3_bucket — and Terraform reads it during terraform init to select and download the plugin.",
    ],
    [
      "How do I configure two regions of the same provider?",
      "Write a second provider block with an alias meta-argument, then point individual resources at it. One block per provider may omit alias and is the default for everything; every extra block needs a unique alias, and resources select it with provider = aws.eu. If you have aliases but no default block, every resource of that provider must set provider explicitly or Terraform will error.",
    ],
    [
      "Why does terraform init say a provider block is not allowed in a module?",
      "Because reusable child modules should not configure providers themselves — legacy provider blocks in a shared module make it impossible to remove the module cleanly. Declare the extra configurations the module expects with configuration_aliases = [aws.replica] inside required_providers, and have the calling module pass them in with a providers = { aws.replica = aws.eu } argument.",
    ],
  ],
};

export default seo;
