"use strict";

function helpImageCaption(alt) {
  const description = String(alt || "").trim();
  // Document exports commonly use a filename or a numbered placeholder as alt text.
  const filename = /\.(?:png|jpe?g|gif|webp|bmp|svg|avif|tiff?|ico)(?:[?#]\S*)?$/i;
  const placeholder = /^(?:(?:原文)?(?:图片|截图|截屏)|image|screenshot)(?:[\s_-]*\(?\d+\)?)?$/i;
  return filename.test(description) || placeholder.test(description) ? "" : description;
}
