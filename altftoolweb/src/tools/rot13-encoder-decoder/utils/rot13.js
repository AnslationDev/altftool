// utils/rot13.js

// ROT13 cipher implementation
const rot13 = (text) => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    }
    return char;
  });
};

// Test function for validation
const testRot13 = () => {
  const testCases = [
    { input: "Hello World", expected: "Uryyb Jbeyq" },
    { input: "Rot13", expected: "Ebg13" },
    { input: "The quick brown fox", expected: "Gur dhvpx oebja snk" },
    { input: "", expected: "" },
  ];

  testCases.forEach((test) => {
    const result = rot13(test.input);
    console.log(`${test.input} → ${result}${result === test.expected ? " ✓" : " ✗"}`);
  });
};

export { rot13, testRot13 };
