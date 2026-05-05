const DB_NAME    = "ImageToVideoDB";
const DB_VERSION = 2;
const STORE      = "projects";
const BLOB_STORE = "blobs";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      // ✅ Blob store — images yahan rahenge permanently
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: "id" });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}


async function saveBlob(id, blob) {
  const db    = await openDB();
  const tx    = db.transaction(BLOB_STORE, "readwrite");
  const store = tx.objectStore(BLOB_STORE);
  return new Promise((resolve, reject) => {
    const req = store.put({ id, blob });
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

/* ── Load one Blob ── */
async function loadBlob(id) {
  const db    = await openDB();
  const tx    = db.transaction(BLOB_STORE, "readonly");
  const store = tx.objectStore(BLOB_STORE);
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = (e) => resolve(e.target.result?.blob ?? null);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/* ── Delete blobs for a project ── */
async function deleteBlobsForProject(slides) {
  if (!slides?.length) return;
  const db    = await openDB();
  const tx    = db.transaction(BLOB_STORE, "readwrite");
  const store = tx.objectStore(BLOB_STORE);
  slides.forEach((slide) => {
    if (slide.blobId) store.delete(slide.blobId);
  });
}


/* ── Save project ── */
export async function saveProject(project) {
  const db    = await openDB();
  const tx    = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const record = { ...project, updatedAt: Date.now() };

  return new Promise((resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/* ── Get all projects ── */
export async function getAllProjects() {
  const db    = await openDB();
  const tx    = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/* ── Delete project + its blobs ── */
export async function deleteProject(id) {
  // First load project to get slide blobIds
  const db      = await openDB();
  const tx      = db.transaction(STORE, "readonly");
  const store   = tx.objectStore(STORE);

  const project = await new Promise((res, rej) => {
    const req = store.get(id);
    req.onsuccess = (e) => res(e.target.result);
    req.onerror   = (e) => rej(e.target.error);
  });

  // Delete blobs
  if (project?.slides) {
    await deleteBlobsForProject(project.slides);
  }

  // Delete project record
  const tx2    = db.transaction(STORE, "readwrite");
  const store2 = tx2.objectStore(STORE);
  return new Promise((resolve, reject) => {
    const req = store2.delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

export async function serializeSlides(slides) {
  const serialized = await Promise.all(
    slides.map(async (slide) => {
      const { img, file, ...rest } = slide;

   
      const blobId = slide.blobId ?? crypto.randomUUID();

      try {
        let blob = null;

        if (file instanceof Blob) {
          blob = file;
        } else if (slide.url) {
          // url se blob fetch karo (works for blob: and http: urls)
          const res = await fetch(slide.url);
          blob = await res.blob();
        }

        if (blob) {
          await saveBlob(blobId, blob);
        }
      } catch (err) {
        console.warn("Blob save failed for slide", slide.id, err);
      }

      return {
        ...rest,
        blobId,
        url: undefined,
      };
    })
  );

  return serialized;
}

export async function deserializeSlides(slides) {
  return Promise.all(
    slides.map(async (slide) => {
      if (!slide.blobId) return { ...slide, img: null, url: null };

      try {
        const blob = await loadBlob(slide.blobId);
        if (!blob) return { ...slide, img: null, url: null };

        // ✅ Fresh ObjectURL — session mein valid rahega
        const url = URL.createObjectURL(blob);

        const img = await new Promise((resolve) => {
          const image   = new Image();
          image.onload  = () => resolve(image);
          image.onerror = () => resolve(null);
          image.src     = url;
        });

        return { ...slide, url, img, file: blob };
      } catch (err) {
        console.warn("Blob load failed for slide", slide.id, err);
        return { ...slide, img: null, url: null };
      }
    })
  );
}

/* ── Build project object from Home state ── */
export async function buildProjectData(id, name, state) {
  const {
    slides, globalDuration, easing,
    hook, splitLayout, splitSlotMap,
  } = state;

  const serializedSlides = await serializeSlides(slides);

  return {
    id:            id ?? crypto.randomUUID(),
    name:          name ?? "Untitled Project",
    createdAt:     Date.now(),
    updatedAt:     Date.now(),
    globalDuration,
    easing,
    hook,
    splitLayout,
    splitSlotMap,
    slides:        serializedSlides,
  };
}