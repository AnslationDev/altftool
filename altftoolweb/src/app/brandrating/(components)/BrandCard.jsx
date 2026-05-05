import { HomeIcon, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BrandCard({ brands, data }) {

  function getURlLink(category) {
    return category
      ?.toLowerCase()
      ?.trim()
      ?.replace(/\s+/g, "-");
  }

  return (
    <div className="space-y-8 sm:space-y-10">

      {brands.map((brand) => (

        <div
          key={brand.id}
          className="border border-gray-100 relative rounded-lg shadow-xl bg-white "
        >

          {/* Rating Circle */}
          <div className="absolute text-(--muted-foreground)  w-12 h-12 sm:w-14 sm:h-14 -top-3 -right-3 border border-amber-400 z-20 flex justify-center items-center bg-white rounded-full text-sm sm:text-base">
            {brand?.rating}
          </div>

        
          {brand.id == "1" && (
            <div className="absolute h-8 w-20  sm:left-12 rounded-br-2xl z-20 flex justify-center items-center text-white text-xs sm:text-sm bg-red-500">
              TOP PICK
            </div>
          )}

         
          <div
            className={`h-10 flex justify-between rounded-2xl  border-b ${
              brand.id == 1
                ? "bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-500"
                : "bg-gradient-to-r from-[#fef7ef] via-[#facaa1] to-[#f7a056]"
            }`}
          >
            <div className="bg-[#333333] rounded-lg   w-12 sm:w-[5%] text-white flex justify-center items-center">
              {brand.id}
            </div>

            <div className="w-auto px-3 sm:w-[20%] text-sm sm:text-xl text-white flex justify-center items-center">
              {brand.review}
            </div>
          </div>

          {/* Visits Bar */}
          {brand.id == "1" && (
            <div className="w-full text-white flex justify-center items-center my-1 bg-[#333333] h-7 text-xs sm:text-sm">
              <ThumbsUp size={16} className="mx-2" /> 4862 people visited this
              week
            </div>
          )}

          {/* Main Section */}
          <div className="flex flex-col md:flex-row">

            {/* Brand Info */}
            <div className="flex flex-col justify-center items-center py-6 w-full md:w-[33%] text-center">
              <p className="font-semibold  text-(--muted-foreground) ">{brand.name}</p>

              <p className="text-yellow-500 text-lg mt-2">★★★★★</p>
            </div>

            {/* Features */}
            <div className="w-full md:w-[33%] px-6 pb-6 md:pb-0">

              <ul className="space-y-2 mt-2 md:mt-6 text-sm text-gray-700">

                <li><span className="text-[#44afbe]">✔</span> Firmness: {brand.features.firmness}</li>
                <li><span className="text-[#44afbe]">✔</span> Sizes: {brand.features.sizes}</li>
                <li><span className="text-[#44afbe]">✔</span> Materials: {brand.features.materials}</li>
                <li><span className="text-[#44afbe]">✔</span> Design: {brand.features.design}</li>
                <li><span className="text-[#44afbe]">✔</span> Trial Period: {brand.features.trial}</li>
                <li><span className="text-[#44afbe]">✔</span> Warranty: {brand.features.warranty}</li>
                <li><span className="text-[#44afbe]">✔</span> Shipping: {brand.features.shipping}</li>
                <li><span className="text-[#44afbe]">✔</span> {brand.features.official}</li>

              </ul>

            </div>

            {/* CTA */}
            <div className="flex flex-col justify-center items-center py-6 w-full md:w-[33%]">

              <button className="py-2 px-6 sm:px-10 rounded-lg my-3 bg-red-700 text-white text-sm sm:text-base">
                See Details
              </button>

              <p className="max-w-xs text-(--muted-foreground) text-center text-sm">
                {brand?.offer}
              </p>

            </div>

          </div>

          {/* Top Pick Extra Section */}
          {brand.id == "1" && (

            <div className="flex flex-col lg:flex-row max-w-5xl mx-auto my-6 gap-6 px-4">

              {/* Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-[75%]">

                {brand.images &&
                  brand.images.map((img, i) => (

                    <div key={i} className="relative h-32 sm:h-40">

                      <Image
                        src={img}
                        fill
                        alt="product"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                        className="object-cover rounded-lg"
                      />

                    </div>

                  ))}

              </div>

              {/* Benefits */}
              <div className="flex justify-center items-center w-full lg:w-[25%]">

                <div>
                  {brand.benefits.map((item, i) => (

                    <div
                      key={i}
                      className="flex text-(--muted-foreground) items-center text-sm sm:text-md py-2 gap-2"
                    >
                      <HomeIcon size={18} /> {item}
                    </div>

                  ))}
                </div>

              </div>

            </div>

          )}

          {/* Footer Link */}
          <Link
            className="flex justify-center py-4 text-(--muted-foreground) text-sm sm:text-base font-medium hover:underline"
            href={brand.weblink}
          >
            READ OUR {brand.name} REVIEW
          </Link>

        </div>

      ))}

    </div>
  );
}
