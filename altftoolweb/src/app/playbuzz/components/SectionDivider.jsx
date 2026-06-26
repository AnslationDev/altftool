const SectionDivider = ({ title }) => {
  return (
    <div className="flex items-center justify-center w-full my-5 relative">
      <div className="absolute left-0 right-0 h-px z-0" style={{ background: 'var(--border)' }} />
      <span
        className="relative z-10 inline-block px-5 py-2 text-xs font-bold tracking-widest uppercase rounded-md"
        style={{
          backgroundColor: 'var(--background)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      >
        {title}
      </span>
    </div>
  );
};

export default SectionDivider;
