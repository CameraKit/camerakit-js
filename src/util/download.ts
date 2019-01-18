function downloadBlob(blob: Blob, filename?: string): boolean {
  if (!blob) {
    return false;
  }

  const a = document.createElement("a");
  a.download = filename || `CKW-${new Date()}`;
  a.href = window.URL.createObjectURL(blob);
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return true;
}

export function downloadImage(image: string, filename?: string): boolean {
  if (!image) {
    return false;
  }

  return downloadBlob(new Blob([image], { type: "image/png" }), filename);
}
