export const kymBanners = {
  sidebarTall: "/banners/vertical.jpg",
};

export default function KymAdBanner({ src, variant = "horizontal", loading = "lazy" }) {
  return (
    <div className={`kym-ad-banner kym-ad-banner--${variant}`}>
      <img src={src} alt="Advertisement" loading={loading} />
    </div>
  );
}
