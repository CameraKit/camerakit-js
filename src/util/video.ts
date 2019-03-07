import { Decoder, tools, Reader } from "ts-ebml";

function readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer | undefined> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Invalid blob type"));
      }
    };
    reader.onerror = (ev: ProgressEvent) => {
      reject(ev);
    };
  });
}

export async function injectMetadata(blob: Blob): Promise<Blob> {
  const decoder = new Decoder();
  const reader = new Reader();
  reader.logging = false;
  reader.drop_default_duration = false;

  const buffer = await readAsArrayBuffer(blob);

  if (!buffer) {
    // Fail silently
    return blob;
  }

  const elms = decoder.decode(buffer);
  elms.forEach(elm => {
    reader.read(elm);
  });
  reader.stop();

  const refinedMetadataBuf = tools.makeMetadataSeekable(
    reader.metadatas,
    reader.duration,
    reader.cues
  );
  const body = buffer.slice(reader.metadataSize);
  const result = new Blob([refinedMetadataBuf, body], { type: blob.type });

  return result;
}
