const Footer = () => {
  return (
    <footer
      className="w-full text-center px-2.5 py-3.5 mt-6"
      style={{
        borderTop: '1px solid var(--anslation-ds-footer-border)',
        backgroundColor: 'var(--anslation-ds-footer)',
        color: 'var(--anslation-ds-footer-muted)',
      }}
    >
      <div className="max-w-[1760px] mx-auto text-xs border-0 p-0 flex justify-center">
        <span style={{ color: 'var(--anslation-ds-footer-muted)' }}>
          Copyright 2026 ALTFTool Quiz Studio. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
