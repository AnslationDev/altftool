const heroImage = { src: "/kym-images/article-body-01.jpg" };
const videoImage = { src: "/kym-images/kym-09.jpg" };
const tweetOne = { src: "/kym-images/article-body-02.jpg" };
const tweetTwo = { src: "/kym-images/article-body-03.jpg" };
const tweetThree = { src: "/kym-images/article-body-04.jpg" };
const tweetFour = { src: "/kym-images/article-body-05.jpg" };
const tweetFive = { src: "/kym-images/article-body-06.jpg" };
const bowieKnife = { src: "/kym-images/article-body-26.jpg" };
const ignoreCover = { src: "/kym-images/article-body-27.jpg" };
const tsirkinCover = { src: "/kym-images/article-body-28.jpg" };
const bodegaCover = { src: "/kym-images/article-body-29.jpg" };
const remixOne = { src: "/kym-images/article-body-12.jpg" };
const remixTwo = { src: "/kym-images/article-body-15.jpg" };
const remixThree = { src: "/kym-images/article-body-18.jpg" };
const remixFour = { src: "/kym-images/article-body-20.jpg" };

export const roundupArticle = {
  title:
    "The Weekly Meme Roundup: Bowie Knife99, Julie Tsirkin, Tryna Ignore It And More",
  category: "Editorial",
  author: "Phil",
  date: "May 29, 2026",
  heroImage,
  videoImage,
  intro:
    "This week's internet culture roundup collects the memes, redraws, edits and quote formats that moved fastest across timelines. The biggest chatter centered on a stubborn little dog, a broadcast clip, and a handful of fan-art redesigns.",
  sections: [
    {
      title: "He Tryna Ignore It",
      body:
        "The 'he tryna ignore it' image spread as a reaction for pretending not to notice something obvious. The setup is simple, so people used it for crushes, bad takes, group chat drama and anything else that demands a painfully visible non-reaction.",
      images: [tweetOne, tweetTwo, tweetThree, tweetFour, tweetFive],
    },
    {
      title: "Bowie Knife99",
      body:
        "Bowie Knife99 became the week's remixable character prompt. The jokes mostly follow the same rhythm: a dramatic name, a serious pose and a hard swing into something oddly specific.",
      images: [bowieKnife, remixOne],
    },
    {
      title: "Julie Tsirkin And Kit Bodega",
      body:
        "Elsewhere, the Julie Tsirkin clip and Kit Bodega redesigns gave editors plenty of room to riff. The formats worked because they were instantly readable even when cropped, captioned or redrawn.",
      images: [tsirkinCover, bodegaCover, remixTwo, remixThree, remixFour],
    },
  ],
};

export const articleSidebar = [
  { title: "He Tryna Ignore It", image: ignoreCover },
  { title: "Bowie Knife99", image: bowieKnife },
  { title: "Julie Tsirkin Edits", image: tsirkinCover },
  { title: "Kit Bodega Fan Redesigns", image: bodegaCover },
];
