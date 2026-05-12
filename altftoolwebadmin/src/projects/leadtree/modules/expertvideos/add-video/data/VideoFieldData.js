import { type } from "firebase/firestore/pipelines";
import {
  Calendar,
  FilmIcon,
  Link,
  Link2,
  List,
  ReceiptIcon,
  ReceiptText,
  Type,
  User2,
  UserCircle2,
  Video,
} from "lucide-react";

export const videoFields = [
  {
    name: "title",
    label: "Video Title",
    placeholder: "Enter Video Title",
    rules: {
      required: "Title is required",
    },
    icon: Type,
  },

  {
    name: "subTitle",
    label: "Sub Title",
    placeholder: "Enter Video SubTitle",
    rules: {
      required: "SubTitle is required",
    },
    icon: Type,
  },

  {
    name: "cateogry",
    label: "Video Cateogry",
    placeholder: "Select Video Cateogry",
    rules: {
      required: "Cateogry is required",
    },
    icon: List,
    options: [
      "Business Loan",
      "Personal Loan",
      "Credit Card",
      "Savings Account",
    ],
    type: "category",
  },

  {
    name: "date",
    label: "Publish Date",
    placeholder: "dd/mm/yyyy",
    rules: {
      required: "Date is required",
    },
    icon: Calendar,
    type: "date",
  },

  {
    name: "description",
    label: "Description",
    placeholder: "Write a description , summarization of video",
    rules: {
      required: "Description is required",
    },
    type: "textarea",
    icon: ReceiptText,
  },

  {
    name: "thumbnailAlt",
    label: "Thumbnail Alt Text",
    placeholder: "Talks about Business Loan",
    rules: {
      required: "Thumbnail alt text is required",
    },

    icon: Type,
  },

  {
    name: "thumbnailCaption",
    label: "Caption",
    placeholder: "Short Caption Shown for thumbnail",
    rules: {
      required: "Caption is required",
    },

    icon: Type,
  },

  {
    name: "thumbnailUrl",
    label: "Thumbnnail External URL",
    placeholder: "Paste Url of your thumbnail",
    rules: {
      required: "Thumnnail is required",
    },

    icon: Link2,
  },

  {
    name: "videoExternalUrl",
    label: "External Video URL",
    placeholder: "https://...",
    icon: Link,
  },

  {
    name: "authorName",
    label: "Author Name",
    placeholder: "Victoria..",
    icon: User2,
  },

  {
    name: "authorRole",
    label: "Author Role",
    placeholder: "Busienss Expert..",
    icon: UserCircle2,
  },
];
