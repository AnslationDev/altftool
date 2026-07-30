const seo = {
  intro:
    "Duplicate Image Finder compares a batch of images with two 64-bit perceptual hashes — a difference hash and an average hash computed on greyscale — and groups any pair whose averaged similarity reaches 80% or more. Because it matches on visual structure rather than file bytes, it catches a resized, recompressed or renamed copy that a checksum comparison would treat as a different file. Photographers and anyone cleaning a photo folder get similarity-scored groups, a keep-best action, and a CSV report.",
  useCases: [
    "You shot a burst of forty frames of the same scene and want the near-identical ones grouped so you can keep one and drop the rest.",
    "A folder has accumulated the same photo at three sizes with different filenames, and byte-for-byte duplicate finders keep telling you they are all unique.",
    "You are handing a client an image set and need a CSV listing which files duplicate which, with a percentage, before you delete anything.",
  ],
  benefits: [
    [
      "Two hashes, not one",
      "Each pair is scored on both a difference hash and an average hash and the two are averaged, so a match does not hinge on a single algorithm's blind spot.",
    ],
    [
      "Exact and near are distinguished",
      "Pairs at 95% and above are labelled exact, 85 to 94% are labelled near, so you know which groups need a look before you delete.",
    ],
    [
      "Nothing is deleted behind your back",
      "Keep-best removes the flagged copies from the working list only; your files on disk are untouched, and you can remove individual entries instead.",
    ],
  ],
  faqs: [
    [
      "How does perceptual hashing find duplicates?",
      "Each image is shrunk to an 8×8 greyscale grid and reduced to a 64-bit fingerprint — the difference hash records whether each pixel is brighter than its right-hand neighbour, the average hash whether each pixel is brighter than the image mean. Two fingerprints are compared by Hamming distance, so similarity is the percentage of the 64 bits that agree.",
    ],
    [
      "What similarity counts as a duplicate?",
      "Grouping starts at 80% averaged similarity. In practice 95% and above is effectively the same picture, 85 to 94% is a near-duplicate such as a re-crop or a different export, and anything in the low 80s is worth eyeballing before you act on it.",
    ],
    [
      "Will it match a resized or recompressed copy?",
      "Yes — that is the point of a perceptual hash. Scaling, JPEG recompression and small colour shifts barely change the 64-bit fingerprint, whereas a file checksum changes completely, which is why a hash-based deduplicator misses these entirely.",
    ],
    [
      "Are my photos uploaded anywhere?",
      "No. Images are decoded and hashed in your browser using a canvas, and only the resulting fingerprints are compared, so nothing leaves the machine even for a large batch.",
    ],
  ],
};

export default seo;
