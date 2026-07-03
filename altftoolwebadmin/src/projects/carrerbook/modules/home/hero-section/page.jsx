import { HeroEditor, HeroPreview } from "../components/HomeSectionShared";

export default function HeroSectionTab(props) {
  return {
    editor: <HeroEditor {...props} />,
    preview: <HeroPreview draft={props.draft} />,
  };
}
