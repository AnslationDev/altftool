"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => { const map = { a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"ꜱ",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ" }; return input.split("").map((ch) => map[ch.toLowerCase()] || ch).join(""); };

export default function Page() {
  return (
    <TextTool title={"Small Caps Generator"} description={"Convert text into ꜱᴍᴀʟʟ ᴄᴀᴘꜱ unicode letters for bios and posts."} sample={"small caps text"} options={options} transform={transform} />
  );
}
