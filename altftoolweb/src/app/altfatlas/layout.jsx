import "./atlas.css";
import AtlasNav from "./_components/AtlasNav";
import AtlasPalette from "./_components/AtlasPalette";

export default function AtlasLayout({ children }) {
  return (
    <>
      <AtlasNav />
      {children}
      <AtlasPalette />
    </>
  );
}
