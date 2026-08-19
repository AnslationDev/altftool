"use client";
import Image from "next/image";
import girlImg from "../(assets)/coupon-image.webp";

// import your icons
import icon1 from "../(assets)/material symbol.png";
import icon2 from "../(assets)/update.png";
import icon3 from "../(assets)/bag.png";

export default function SmartDeals() {
  return (
    <section className="section animate-slide-up">
      <h2 className="section-title lg:!mb-0">
        Smarter Way To Discover Deals & Coupons
      </h2>

      <div className="flex flex-col lg:flex-row justify-between items-center">
        {/* LEFT CONTENT */}

        {/* 
        <h2 className="section-title">
          Smarter Way To Discover Deals & Coupons
        </h2> 
        */}

        {/* FEATURES */}
        <div className="space-y-8 animate-slide-right">
          {/* These three panels claimed a process rather than describing the
              product: "Verified Coupons Only / every offer is curated and
              tested" and "Updated Daily / new deals added every day". Nothing
              tests a code before it is published, no offer carries a
              checked-on date, and the feed updates when the brand data
              changes, not on a daily schedule. Copy now states what the page
              does, which needs no verification pipeline to be true. */}
          <p className="section-subtitle !mx-0 text-left">
            Browse Coupon Codes By Brand, Compare Offers, And Open The One You
            Want To Use.
          </p>

          {/* ITEM 1 */}
          <div className="flex items-start sm:gap-6 gap-4 ">
            <Image src={icon1} alt="" width={32} height={32} />

            <div className="space-y-2">
              <p className="font-semibold">Codes And Direct Deal Links</p>
              <p className="text-sm text-(--muted-foreground)">
                Coupon entries show a code when one is supplied; other deals link directly to the listed store.
              </p>
            </div>
          </div>

          {/* ITEM 2 */}
          <div className="flex items-start sm:gap-6 gap-4">
            <Image src={icon2} alt="" width={32} height={32} />

            <div className="space-y-2">
              <p className="font-semibold">Sorted By Brand</p>
              <p className="text-sm text-(--muted-foreground)">
                Pick a store and see everything currently listed for it in one place.
              </p>
            </div>
          </div>

          {/* ITEM 3 */}
          <div className="flex items-start sm:gap-6 gap-4">
            <Image src={icon3} alt="brands" width={32} height={32} />

            <div className="space-y-2">
              <p className="font-semibold">Top Brands, One Place</p>
              <p className="text-sm text-(--muted-foreground)">
                Explore Amazon, Myntra, Flipkart & more without switching apps.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex-1 flex justify-end mt-10 lg:mt-0 animate-slide-left">
          <div className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full overflow-hidden deals-image-shell">
            <Image
              src={girlImg}
              alt="shopping"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
