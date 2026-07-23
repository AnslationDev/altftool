const MONETAG_VERIFICATION = "1bc9daffdd035cbc7c5e6a6d1d9230cd";
const TABOOLA_PIXEL_ID = 2053347;

export default function ProductionPartnerTags({ enabled = false }) {
  if (!enabled) return null;

  return (
    <>
      <meta name="monetag" content={MONETAG_VERIFICATION} />
      <script
        id="monetag-multitag"
        src="https://quge5.com/88/tag.min.js"
        data-zone="248425"
        data-cfasync="false"
        async
      />
      <script
        id="taboola-pixel-bootstrap"
        dangerouslySetInnerHTML={{
          __html: `
            window._tfa = window._tfa || [];
            window._tfa.push({ notify: "event", name: "page_view", id: ${TABOOLA_PIXEL_ID} });
            (function (documentRef, firstScript, source, scriptId) {
              if (documentRef.getElementById(scriptId)) return;
              var script = documentRef.createElement("script");
              script.async = true;
              script.src = source;
              script.id = scriptId;
              firstScript.parentNode.insertBefore(script, firstScript);
            })(document, document.getElementsByTagName("script")[0],
              "https://cdn.taboola.com/libtrc/unip/${TABOOLA_PIXEL_ID}/tfa.js",
              "tb_tfa_script");
          `,
        }}
      />
    </>
  );
}
