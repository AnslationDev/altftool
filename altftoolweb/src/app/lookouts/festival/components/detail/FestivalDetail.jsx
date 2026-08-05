"use client";

import FestivalHeader from "../shared/FestivalHeader";
import FestivalFooter from "../shared/FestivalFooter";
import Reveal from "../shared/Reveal";
import FestivalDetailHero from "./FestivalDetailHero";
import FestivalOverviewSection from "./FestivalOverviewSection";
import HistorySection from "./HistorySection";
import CelebrationHighlights from "./CelebrationHighlights";
import FoodSection from "./FoodSection";
import TraditionsSection from "./TraditionsSection";
import TimelineSection from "./TimelineSection";
import LocationMapSection from "./LocationMapSection";
import FestivalGallery from "./FestivalGallery";
import TravelInfoSection from "./TravelInfoSection";
import FaqSection from "./FaqSection";
import RelatedFestivals from "./RelatedFestivals";

export default function FestivalDetail({
  festival,
  dateIso,
  dateSource,
  photo,
  photos,
  wiki,
  countries,
  related,
  relatedDates,
  relatedPhotos,
}) {
  return (
    <div className="festival-page">
      <FestivalHeader />
      <FestivalDetailHero festival={festival} dateIso={dateIso} dateSource={dateSource} photo={photo} />

      <Reveal>
        <FestivalOverviewSection festival={festival} />
      </Reveal>
      <Reveal>
        <HistorySection festival={festival} wiki={wiki} />
      </Reveal>
      <Reveal>
        <CelebrationHighlights festival={festival} />
      </Reveal>
      <Reveal>
        <FoodSection festival={festival} />
      </Reveal>
      <Reveal>
        <TraditionsSection festival={festival} />
      </Reveal>
      <Reveal>
        <TimelineSection festival={festival} dateIso={dateIso} />
      </Reveal>
      <Reveal>
        <LocationMapSection festival={festival} countries={countries} />
      </Reveal>
      <Reveal>
        <FestivalGallery photos={photos} festivalName={festival.name} />
      </Reveal>
      <Reveal>
        <TravelInfoSection festival={festival} countries={countries} />
      </Reveal>
      <Reveal>
        <FaqSection festival={festival} dateIso={dateIso} dateSource={dateSource} />
      </Reveal>
      <Reveal>
        <RelatedFestivals festivals={related} dates={relatedDates} photos={relatedPhotos} />
      </Reveal>

      <FestivalFooter />
    </div>
  );
}
