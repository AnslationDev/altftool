"use client";

import dynamic from "next/dynamic";

const LazyChatBot = dynamic(() => import("./index"), {
  loading: () => null,
  ssr: false,
});

export default LazyChatBot;
