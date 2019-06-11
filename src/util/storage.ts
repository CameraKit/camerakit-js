import logger from "../main/logger";
import { StorageMethod } from "../types";

const CK_IMAGE_KEY = "camerakit-images";

function getStorage(storageMethod?: StorageMethod): Storage | false {
  if (storageMethod === null) {
    return false;
  } else if (storageMethod && storageMethod === "localStorage") {
    return localStorage;
  } else if (storageMethod && storageMethod === "sessionStorage") {
    return sessionStorage;
  }

  return localStorage;
}

export function getImages({
  storageMethod
}: { storageMethod?: StorageMethod } = {}) {
  const storageArea = getStorage(storageMethod);
  if (storageArea === false) {
    return;
  }

  const foundValue = storageArea.getItem(CK_IMAGE_KEY);
  let existing = foundValue ? JSON.parse(foundValue) : [];

  if (!(existing instanceof Array)) {
    logger.log("Error: Invalid value found in Storage.");
    existing = [];
  }

  return existing;
}

export function saveImage(
  image: string,
  {
    storageMethod
  }: {
    storageMethod?: StorageMethod;
  } = {}
) {
  const storageArea = getStorage(storageMethod);
  if (storageArea === false) {
    return;
  }

  const existing = getImages({ storageMethod });

  existing.push(image);
  storageArea.setItem(CK_IMAGE_KEY, JSON.stringify(existing));
}
