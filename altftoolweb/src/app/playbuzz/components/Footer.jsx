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
        {/*
          This read "Copyright 2026 Playbuzz Clone. All rights reserved." — a
          visible, indexable admission on a page-1 result that it is a clone of
          another company's product, while also claiming copyright over it.
          Replaced with the actual publisher.
        */}
        <span style={{ color: 'var(--anslation-ds-footer-muted)' }}>
          Copyright 2026 AltFTool. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
