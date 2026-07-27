// Extracted Image and Table Comparison Engine

export function compareImages(docA, docB) {
  const imagesA = docA.images || [];
  const imagesB = docB.images || [];

  const addedImages = [];
  const removedImages = [];
  const modifiedImages = [];

  const mapA = new Map(imagesA.map((img, i) => [img.id || `img_${i}`, img]));
  const mapB = new Map(imagesB.map((img, i) => [img.id || `img_${i}`, img]));

  imagesA.forEach((imgA, i) => {
    const key = imgA.id || `img_${i}`;
    if (!mapB.has(key)) {
      removedImages.push(imgA);
    } else {
      const imgB = mapB.get(key);
      if (imgA.size !== imgB.size || imgA.width !== imgB.width || imgA.height !== imgB.height) {
        modifiedImages.push({
          before: imgA,
          after: imgB,
          change: "Resized or compressed",
        });
      }
    }
  });

  imagesB.forEach((imgB, i) => {
    const key = imgB.id || `img_${i}`;
    if (!mapA.has(key)) {
      addedImages.push(imgB);
    }
  });

  const countDelta = (docB.metadata?.imageCount || 0) - (docA.metadata?.imageCount || 0);

  return {
    addedImages,
    removedImages,
    modifiedImages,
    countDelta,
    imageCountA: docA.metadata?.imageCount || 0,
    imageCountB: docB.metadata?.imageCount || 0,
  };
}

export function compareTables(docA, docB) {
  const tablesA = docA.tables || [];
  const tablesB = docB.tables || [];

  const tableDelta = (docB.metadata?.tableCount || 0) - (docA.metadata?.tableCount || 0);

  return {
    tableDelta,
    tableCountA: docA.metadata?.tableCount || 0,
    tableCountB: docB.metadata?.tableCount || 0,
    hasTableChanges: tableDelta !== 0 || tablesA.length !== tablesB.length,
  };
}
