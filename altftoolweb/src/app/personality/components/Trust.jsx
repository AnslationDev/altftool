"use client";

const stats = [
  {
    value: "500K+",
    label: "Tests Completed",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 22C5 17.58 8.58 14 13 14C15.21 14 17.21 14.9 18.66 16.37M18 9C18 11.76 15.76 14 13 14C10.24 14 8 11.76 8 9C8 6.24 10.24 4 13 4C15.76 4 18 6.24 18 9Z" stroke="currentColor" strokeWidth="2.33" strokeLinecap="round"/>
        <path d="M23 22C23 17.58 19.42 14 15 14" stroke="currentColor" strokeWidth="2.33" strokeLinecap="round"/>
        <path d="M21 8C21 10.21 19.21 12 17 12" stroke="currentColor" strokeWidth="2.33" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: "98%",
    label: "User Satisfaction",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4.67 4.67H23.33V23.33H4.67V4.67Z" stroke="currentColor" strokeWidth="2.33" strokeLinejoin="round"/>
        <path d="M9.33 19.33V14M14 19.33V10.67M18.67 19.33V7.33" stroke="currentColor" strokeWidth="2.33" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: "100%",
    label: "Data Privacy",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3.5L5.83 7V14C5.83 18.58 9.35 22.86 14 24.5C18.65 22.86 22.17 18.58 22.17 14V7L14 3.5Z" stroke="currentColor" strokeWidth="2.33" strokeLinejoin="round"/>
        <path d="M10 14L12.67 16.67L18 11.33" stroke="currentColor" strokeWidth="2.33" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: "150+",
    label: "Countries",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2.33"/>
        <path d="M4 14H24M14 4C14 4 10 9 10 14C10 19 14 24 14 24M14 4C14 4 18 9 18 14C18 19 14 24 14 24" stroke="currentColor" strokeWidth="2.33"/>
      </svg>
    ),
  },
];

export default function Trust() {
  return (
    <section className="w-full py-14 md:py-20" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1250px] mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-['Manrope',sans-serif] font-medium text-[30px] sm:text-[36px] md:text-[40px] leading-[38px] sm:leading-[46px] md:leading-[60px] tracking-[-1px] mb-4" style={{ color: 'var(--foreground)' }}>
            Trusted, Secure &amp; Loved Worldwide
          </h2>
          <p className="font-['Manrope',sans-serif] font-normal text-[15px] sm:text-[18px] md:text-[20px] leading-[24px] sm:leading-[26px] md:leading-[28px] max-w-[580px] mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Join thousands of users who trust our platform for accurate insights and meaningful personal growth.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="card rounded-[24px] flex flex-col items-center p-9 border transition-all"
              style={{ boxShadow: "var(--anslation-ds-shadow-sm)", borderColor: "var(--border)", background: "var(--card)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--anslation-ds-shadow-lg)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--anslation-ds-shadow-sm)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
                {stat.icon}
              </div>
              <span className="font-['Manrope',sans-serif] font-bold text-[32px] leading-[48px] mb-1" style={{ color: 'var(--foreground)' }}>
                {stat.value}
              </span>
              <span className="font-['Manrope',sans-serif] font-semibold text-[15px] leading-[22px] text-center" style={{ color: 'var(--muted-foreground)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Divider + note */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 w-full max-w-[600px]">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border))' }} />
            <div className="w-8 h-8 border-2 rounded-full flex items-center justify-center" style={{ borderColor: 'var(--primary)', background: 'var(--muted)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L8.5 5.5H12L9 7.5L10 11L8 9L6 11L7 7.5L4 5.5H7.5L8 2Z" strokeWidth="1.33" strokeLinejoin="round" style={{ stroke: 'var(--primary)' }}/>
              </svg>
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--border))' }} />
          </div>
          <p className="font-['Inter',sans-serif] font-normal text-[15px] leading-[24px] text-center max-w-[490px]" style={{ color: 'var(--muted-foreground)' }}>
            Your data is safe with us. We never share your information and follow industry-leading security practices.
          </p>
        </div>
      </div>
    </section>
  );
}
