const seo = {
  intro:
    "JSON to TypeScript converts a pasted JSON object into exported TypeScript declarations, walking the structure recursively and giving every nested object its own named interface instead of an inline shape. Primitives are typed from the value's runtime type — string, number, boolean — while null becomes any, and you can switch the output between `export interface Name { }` and `export type Name = { }` and turn trailing semicolons on or off. It is for frontend and Node developers who have a sample API response and want typed models for it in seconds.",
  useCases: [
    "You are adding TypeScript to a project that talks to an untyped REST API and need interfaces for the response bodies you already have saved.",
    "A config or fixture file has objects nested three levels deep and you want each level as a separate reusable interface rather than one nested blob.",
    "Your team's lint config bans interfaces in favour of type aliases, so you need the same generated shapes emitted with `type Name = {` instead.",
  ],
  benefits: [
    ["Child interfaces, not inline nesting", "Every nested object is hoisted into its own named, exported declaration so you can import and reuse the inner shapes."],
    ["Declarations ordered for readability", "Children are emitted before the root type that references them, so the file reads top-down from the smallest shape up."],
    ["Name collisions resolved automatically", "Two different objects that map to the same interface name get a numeric suffix, so the output always compiles."],
  ],
  faqs: [
    [
      "How does it type an array of objects?",
      "It reads the first element of the array and builds one interface from it, named after the key with an Item suffix, then types the field as that interface followed by []. If later elements have extra keys, they will not appear, so pass a representative first record.",
    ],
    [
      "What type does a null value get?",
      "null is emitted as any, because a single null tells the converter nothing about what the field holds when it is populated. Replace the null with a sample value in your input if you want a real type, or tighten it to a union by hand afterwards.",
    ],
    [
      "Are the generated fields optional?",
      "No — every key in your JSON becomes a required property with no question mark, since the sample only shows what was present. Add ? to any field your API can legitimately omit before you rely on the type.",
    ],
    [
      "Can I choose between interface and type?",
      "Yes, a single dropdown switches the whole output between `export interface Name {` and `export type Name = {`, and the semicolon checkbox controls whether each property line ends in a semicolon or nothing, matching either Prettier default.",
    ],
  ],
};

export default seo;
