/**
 * Production-Grade Image Download Service for AltPinterest
 * Leverages server-side proxy route to completely bypass browser CORS blocks,
 * preserving full original resolution and format (.jpg, .png, .webp, .gif).
 */

export const generateFilename = (item, imageUrl) => {
  const rawTitle = typeof item === 'object' ? (item.title || item.name || item.category) : item;
  const rawCategory = typeof item === 'object' ? (item.category || item.tag) : '';
  const rawId = typeof item === 'object' ? (item.id || item.originalData?.id) : '';

  let baseName = rawTitle || rawCategory || (rawId ? `pin-${rawId}` : `pin-${Date.now()}`);

  // Clean & Sanitize filename
  baseName = baseName
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseName.startsWith('altpinterest')) {
    baseName = `altpinterest-${baseName}`;
  }

  // Detect format extension
  let ext = 'jpg';
  const cleanUrl = (imageUrl || '').toLowerCase();

  if (cleanUrl.includes('.png') || cleanUrl.includes('format=png')) {
    ext = 'png';
  } else if (cleanUrl.includes('.webp') || cleanUrl.includes('format=webp')) {
    ext = 'webp';
  } else if (cleanUrl.includes('.gif')) {
    ext = 'gif';
  } else if (cleanUrl.includes('.svg')) {
    ext = 'svg';
  } else if (cleanUrl.includes('.jpeg')) {
    ext = 'jpeg';
  }

  return `${baseName}.${ext}`;
};

/**
 * Downloads a Pin Image with multi-tier fallback strategies & memory safety.
 *
 * @param {string|object} item - Pin item object or image URL string
 * @param {string} optionalTitle - Optional title override
 * @param {object} callbacks - { onStateChange(state, message), onError(error, retryFn) }
 */
export const downloadPinImage = async (item, optionalTitle = '', callbacks = {}) => {
  const imageUrl = typeof item === 'string' ? item : (item?.image || item?.src || item?.url || '');
  const title = optionalTitle || (typeof item === 'object' ? item.title : '');
  const filename = generateFilename(item || title, imageUrl);

  const { onStateChange, onError } = callbacks;

  const notifyState = (state, message) => {
    if (typeof onStateChange === 'function') {
      onStateChange(state, message);
    }
  };

  if (!imageUrl || typeof window === 'undefined') {
    const errorMsg = 'Invalid image URL for download.';
    notifyState('error', errorMsg);
    if (typeof onError === 'function') onError(errorMsg, () => downloadPinImage(item, optionalTitle, callbacks));
    return false;
  }

  notifyState('preparing', 'Preparing your download...');

  // Helper to trigger browser download dialog via Blob URL
  const triggerBrowserDownload = (blobOrUrl, isBlob = true) => {
    const downloadUrl = isBlob ? window.URL.createObjectURL(blobOrUrl) : blobOrUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;

    if (document.body) document.body.appendChild(link);
    link.click();

    // Clean up DOM node
    if (typeof link.remove === 'function') link.remove();
    else if (link.parentNode) link.parentNode.removeChild(link);

    // Clean up Blob Memory URL to prevent memory leaks
    if (isBlob) {
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
    }
  };

  // Strategy 1: Local relative paths or Data URLs
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    try {
      notifyState('downloading', 'Downloading image...');
      triggerBrowserDownload(imageUrl, false);
      notifyState('success', 'Image Downloaded Successfully');
      return true;
    } catch (err) {
      console.warn('Local download failed:', err);
    }
  }

  // Strategy 2 (PRIMARY & CORS-PROOF): Server-side Proxy API route
  const tryProxyApiDownload = async () => {
    notifyState('downloading', 'Downloading high-resolution image...');
    const proxyUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Proxy API returned HTTP ${response.status}`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Proxy API returned empty blob');
    }

    triggerBrowserDownload(blob, true);
    notifyState('success', 'Image Downloaded Successfully');
    return true;
  };

  // Strategy 3: Direct Client-Side Fetch
  const tryDirectFetch = async () => {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    triggerBrowserDownload(blob, true);
    notifyState('success', 'Image Downloaded Successfully');
    return true;
  };

  // Strategy 4: Fallback Canvas / Direct Anchor
  const tryFallbackAnchor = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank';
    link.download = filename;
    if (document.body) document.body.appendChild(link);
    link.click();
    if (typeof link.remove === 'function') link.remove();
    else if (link.parentNode) link.parentNode.removeChild(link);
    notifyState('success', 'Image Download Started');
    return true;
  };

  // Execute Strategies Sequentially
  try {
    // 1. Try Next.js Server-side Proxy (100% CORS Proof)
    await tryProxyApiDownload();
    return true;
  } catch (proxyErr) {
    console.warn('Proxy API download failed, falling back to direct fetch:', proxyErr);
    try {
      // 2. Try Direct Fetch
      await tryDirectFetch();
      return true;
    } catch (fetchErr) {
      console.warn('Direct fetch failed, using fallback anchor:', fetchErr);
      try {
        // 3. Fallback Anchor
        tryFallbackAnchor();
        return true;
      } catch (finalErr) {
        console.error('All download strategies failed:', finalErr);
        const errorMsg = 'Unable to download this image. Please try again.';
        notifyState('error', errorMsg);
        if (typeof onError === 'function') {
          onError(errorMsg, () => downloadPinImage(item, optionalTitle, callbacks));
        }
        return false;
      }
    }
  }
};
