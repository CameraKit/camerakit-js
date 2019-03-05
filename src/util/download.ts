function download(href: any, filename?: string): boolean {
  if (!href) {
    return false;
  }

  const a = document.createElement("a");
  a.download = filename || `CKW-${new Date()}`;
  a.href = href;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return true;
}

function downloadBlob(blob: Blob, filename?: string): boolean {
  if (!blob) {
    return false;
  }

  return download(window.URL.createObjectURL(blob), filename);
}

export function downloadImage(image: string, filename?: string): boolean {
  if (!image) {
    return false;
  }

  return download(image, filename);
}

export function downloadVideo(video: Blob, filename?: string): boolean {
  return downloadBlob(video, filename);
}

export function downloadAudio(video: Blob, filename?: string): boolean {
  return downloadBlob(video, filename || "audio");
}
