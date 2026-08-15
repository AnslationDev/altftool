const seo = {
  title: "JSON vs Protobuf vs Avro vs MessagePack vs CBOR Picker",
  metaDescription:
    "Weight nine requirements — wire size, schema evolution, binary payloads, IoT — and rank five formats, with each one's weak spots shown, not just wins.",
  steps: [
    "Under \"Your requirements\", work through the nine criteria — \"Humans read or edit payloads\", \"Smallest possible wire size\", \"Safe schema evolution\", \"Raw binary payloads\", \"Constrained / IoT devices\" and the rest.",
    "Set each one to \"Not needed\", \"Nice to have\" or \"Critical\"; there is no submit button, the weighted matrix recomputes on every change.",
    "\"Best fit for your requirements\" names the winner with its score out of the maximum and a percentage, each of the five formats gets a bar with \"Strong on\" and \"Weak on\" lines, and \"Copy result\" or Reset finishes the job.",
  ],
  intro:
    "The Serialization Format Chooser ranks JSON, Protocol Buffers, Apache Avro, MessagePack and CBOR against your own weighted requirements using a decision matrix, where every fitness score is grounded in the format's specification — RFC 8259 for JSON, the protobuf language guide, the Avro 1.11 spec, the msgpack spec and RFC 8949 for CBOR. It is built for backend and platform engineers choosing a wire or storage format who want the trade-offs made explicit instead of picking whatever the last project used.",
  useCases: [
    "A team designing gRPC microservices weighing Protocol Buffers' schema evolution against keeping debuggable JSON payloads",
    "A data engineer choosing between Avro and JSON lines for Kafka topics where payload size and schema registry support matter",
    "A firmware developer picking between CBOR and MessagePack for sensor payloads on a microcontroller with a few KB of RAM",
  ],
  benefits: [
    ["Spec-grounded scoring", "Each of the 45 fitness scores cites a documented property, like protobuf's numbered fields or CBOR's RFC 8949 constrained-node design."],
    ["Weighted to your case", "Mark each requirement not needed, nice to have or critical and the ranking recomputes instantly."],
    ["Honest weaknesses", "Every format's ranking shows where it is weak for your requirements, not just where it wins."],
  ],
  faqs: [
    [
      "Which serialization format is smallest, protobuf or Avro?",
      "Avro typically produces the smallest payloads of the mainstream formats because it writes no per-field tags at all — the reader reconstructs the record purely from the schema. Protocol Buffers is close behind but spends a varint tag on every field; JSON is usually the largest because it repeats key names as text in every record.",
    ],
    [
      "When should I use CBOR instead of MessagePack?",
      "Use CBOR when you need an IETF standards-track format or interoperate with IoT and security stacks: CBOR (RFC 8949) is the basis of COSE signing (RFC 9052), CoAP payloads and WebAuthn attestation. MessagePack and CBOR are very similar schemaless binary encodings of the JSON data model, so outside those ecosystems the deciding factor is usually which has the better library on your platform.",
    ],
    [
      "Does JSON support binary data like images or byte arrays?",
      "No — JSON (RFC 8259) has no byte-string type, so raw binary must be base64-encoded, which adds roughly 33% to its size. Protocol Buffers, Avro, MessagePack and CBOR all have first-class binary types, which is why they score much higher when payloads contain raw bytes.",
    ],
    [
      "What makes Protocol Buffers good at schema evolution?",
      "Every protobuf field has a permanent number, and parsers skip unknown numbers, so old readers accept messages with new fields and new readers accept old messages using defaults. Avro achieves comparable safety differently, by resolving the writer's schema against the reader's schema at read time; schemaless formats like JSON, MessagePack and CBOR offer no contract at all, so compatibility becomes a discipline problem.",
    ],
  ],
};

export default seo;
