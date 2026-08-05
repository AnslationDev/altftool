import FestivalHeader from "./FestivalHeader";
import FestivalFooter from "./FestivalFooter";
import Breadcrumbs from "../detail/Breadcrumbs";
import FestivalGrid from "./FestivalGrid";
import Pagination from "./Pagination";

export default function FestivalListPage({
  breadcrumbItems,
  title,
  description,
  filters,
  infoCard,
  festivals,
  dates,
  photos,
  page,
  totalPages,
}) {
  return (
    <div className="festival-page">
      <FestivalHeader />

      <section className="festival-list-header">
        <div className="festival-section-inner">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>{title}</h1>
          {description ? <p className="festival-list-description">{description}</p> : null}
          {filters}
        </div>
      </section>

      {infoCard ? (
        <section className="festival-section festival-section--tint">
          <div className="festival-section-inner">{infoCard}</div>
        </section>
      ) : null}

      <section className="festival-section">
        <div className="festival-section-inner">
          <FestivalGrid festivals={festivals} dates={dates} photos={photos} />
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </section>

      <FestivalFooter />
    </div>
  );
}
