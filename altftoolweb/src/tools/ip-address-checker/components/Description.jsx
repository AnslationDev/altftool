import React from "react";

export default function Description() {
  const cards = [
    {
      title: "Enter IP Address",
      description:
        "Start by a public IPv4 address such as 8.8.8.8.."
    },
    {
      title: "Validate Input Format",
      description:
        "The system first checks whether your input follows the correct domain or IPv4 structure."
    },
    {
      title: "Check IPv4 Range (0–255)",
      description:
        "If the input is an IP address, each segment (octet) is verified to confirm it falls within the valid IPv4 range of 0 to 255."
    },
    {
      title: "Verify Domain Structure",
      description:
        "For domain names, the tool checks the correct pattern including subdomains, main domain name, and top-level domain."
    },
    {
      title: "Match Allowed TLD",
      description:
        "The system validates the Top Level Domain (TLD) such as .com, .net, .org, .in, and others."
    },
    {
      title: "Display Instant Result",
      description:
        "After successful validation, the tool instantly shows whether the input is valid or invalid."
    }
  ];

  return (
    <div className="mt-90">
      <h2 className="text-3xl font-bold text-center mb-12 mt-[-350]">
        How It Works ?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-(--card) border border-(--border) rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300"
          >
            <h3 className="text-blue-600 font-semibold text-xl mb-4">
              {card.title}
            </h3>
            <p className="text-(--foreground) leading-relaxed text-sm">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}