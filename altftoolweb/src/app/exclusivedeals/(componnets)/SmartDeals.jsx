// import Image from "next/image";
// import girlImg from "../(assets)/coupon image.png";

// import icon1 from "../(assets)/material symbol.png";
// import icon2 from "../(assets)/update.png";
// import icon3 from "../(assets)/bag.png";

// export default function SmartDeals() {
//   return (
//     <section className="section animate-slide-up">
//       <h2 className="section-title ">
//         Smarter Way To Discover Deals & Coupons
//       </h2>
//       <p className="section-subtitle !mx-0 text-left">Find verified coupons, explore top brands, and save more on every purchase effortlessly.</p>

//       <div className="flex flex-col lg:flex-row justify-between items-center gap-10">

//         {/* LEFT CONTENT — 30% on lg */}
//         <div className="w-full lg:w-[55%] space-y-10 animate-slide-right order-1 lg:order-1">

//           {/* ITEM 1 */}
//           <div className="flex items-start sm:gap-6 gap-4">
//             <Image src={icon1} alt="verified" width={32} height={32} />
//             <div className="space-y-2">
//               <p className="font-semibold">Verified Coupons Only</p>
//               <p className="text-sm text-(--muted-foreground)">
//                 No expired or fake deals — every offer is curated and tested.
//               </p>
//             </div>
//           </div>

//           {/* ITEM 2 */}
//           <div className="flex items-start sm:gap-6 gap-4">
//             <Image src={icon2} alt="updated" width={32} height={32} />
//             <div className="space-y-2">
//               <p className="font-semibold">Updated Daily</p>
//               <p className="text-sm text-(--muted-foreground)">
//                 New deals and coupons added every day across top brands.
//               </p>
//             </div>
//           </div>

//           {/* ITEM 3 */}
//           <div className="flex items-start sm:gap-6 gap-4">
//             <Image src={icon3} alt="brands" width={32} height={32} />
//             <div className="space-y-2">
//               <p className="font-semibold">Top Brands, One Place</p>
//               <p className="text-sm text-(--muted-foreground)">
//                 Explore Amazon, Myntra, Flipkart & more without switching apps.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT IMAGE — 70% on lg */}
// {/* RIGHT IMAGE — 70% on lg */}
// <div className="w-full lg:w-[45%] flex justify-center lg:justify-end animate-slide-left order-2 lg:order-2">
//   <div className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] xl:w-[380px] xl:h-[380px] rounded-full overflow-hidden bg-[#E8EFFF]">
//     <Image
//       src={girlImg}
//       alt="shopping"
//       className="h-full w-full object-cover"
//     />
//   </div>
// </div>

//       </div>
//     </section>
//   );
// }
"use client";
import Image from "next/image";
import girlImg from "../(assets)/coupon image.png";
import { useState, useEffect } from "react";
import { SmartDealsSkeleton } from "../DealsPageSkeleton";

// import your icons
import icon1 from "../(assets)/material symbol.png";
import icon2 from "../(assets)/update.png";
import icon3 from "../(assets)/bag.png";

export default function SmartDeals() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <SmartDealsSkeleton />;

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
          <p className="section-subtitle !mx-0 text-left">
            Find Verified Coupons, Explore Top Brands, And Save More On Every
            Purchase Effortlessly.
          </p>

          {/* ITEM 1 */}
          <div className="flex items-start sm:gap-6 gap-4 ">
            <Image src={icon1} alt="verified" width={32} height={32} />

            <div className="space-y-2">
              <p className="font-semibold">Verified Coupons Only</p>
              <p className="text-sm text-(--muted-foreground)">
                No expired or fake deals — every offer is curated and tested.
              </p>
            </div>
          </div>

          {/* ITEM 2 */}
          <div className="flex items-start sm:gap-6 gap-4">
            <Image src={icon2} alt="updated" width={32} height={32} />

            <div className="space-y-2">
              <p className="font-semibold">Updated Daily</p>
              <p className="text-sm text-(--muted-foreground)">
                New deals and coupons added every day across top brands.
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
          <div className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full overflow-hidden bg-[#E8EFFF]">
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
