import "./top8.css";

export const metadata = {
  title: "TOP8 — Find less. Choose better.",
  description: "Independent rankings for curious people. Researched deeply, edited carefully, limited to eight.",
robots: {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
},
};

export default function Top8Layout({ children }) {
  return children;
}
