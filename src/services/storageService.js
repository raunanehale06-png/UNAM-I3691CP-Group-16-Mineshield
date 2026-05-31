import * as FileSystem from 'expo-file-system/legacy';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { FIREBASE_STORAGE_BUCKET, storage } from './firebase';

export const INLINE_STORAGE_COMPATIBILITY_ERROR_CODE = 'storage/inline-compatibility-required';
export const INLINE_FALLBACK_STORAGE_ERROR_CODES = Object.freeze([
  INLINE_STORAGE_COMPATIBILITY_ERROR_CODE,
  'storage/unknown',
  'storage/bucket-not-found',
  'storage/project-not-found',
  'storage/quota-exceeded',
  'storage/no-default-bucket',
  'storage/retry-limit-exceeded',
]);

const createNormalizedStorageError = (error, overrides) =>
  Object.assign(new Error(overrides.message || error?.message || 'Storage error'), error, overrides);

export const getStorageServerResponse = (error) =>
  error?.serverResponse ?? error?.customData?.serverResponse ?? '';

const normalizeStorageError = (error) => {
  const status = error?.status ?? error?.customData?.status ?? '';
  const serverResponse = getStorageServerResponse(error);

  if (error?.code === 'storage/unknown' && status === 404) {
    return createNormalizedStorageError(error, {
      code: 'storage/bucket-not-found',
      message:
        `Firebase Storage bucket "${FIREBASE_STORAGE_BUCKET}" could not be found. Enable Cloud Storage in Firebase and verify the configured storage bucket name.`,
      serverResponse,
      status,
    });
  }

  return error;
};

const getStorageDebugDetails = (error, storagePath) => ({
  bucket: FIREBASE_STORAGE_BUCKET,
  code: error?.code ?? 'unknown',
  message: error?.message ?? 'Unknown Firebase Storage error',
  serverResponse: getStorageServerResponse(error),
  status: error?.status ?? '',
  storagePath,
});

const normalizeUploadSource = (source) => {
  if (typeof source === 'string') {
    return {
      uri: source,
    };
  }

  return source ?? {};
};

const isContentUri = (uri) => typeof uri === 'string' && uri.startsWith('content://');

const buildTemporaryImageUri = (extension = 'jpg') => {
  if (!FileSystem.cacheDirectory) {
    return null;
  }

  const safeExtension = String(extension || 'jpg').replace(/[^a-z0-9]+/gi, '').toLowerCase() || 'jpg';
  const randomSuffix = Math.random().toString(36).slice(2, 10);

  return `${FileSystem.cacheDirectory}mineshield-image-${Date.now()}-${randomSuffix}.${safeExtension}`;
};

const resolveLocalImageUri = async (source, extension) => {
  const { uri } = normalizeUploadSource(source);

  if (!uri || !isContentUri(uri)) {
    return {
      cleanupUri: null,
      uri: uri || null,
    };
  }

  const cachedUri = buildTemporaryImageUri(extension);

  if (!cachedUri) {
    return {
      cleanupUri: null,
      uri,
    };
  }

  try {
    await FileSystem.copyAsync({
      from: uri,
      to: cachedUri,
    });

    return {
      cleanupUri: cachedUri,
      uri: cachedUri,
    };
  } catch (error) {
    console.warn('Unable to copy selected image into cache before upload.', {
      message: error?.message || 'Unknown file copy error',
      uri,
    });

    return {
      cleanupUri: null,
      uri,
    };
  }
};

const deleteTemporaryImageUri = async (uri) => {
  if (!uri) {
    return;
  }

  try {
    await FileSystem.deleteAsync(uri, {
      idempotent: true,
    });
  } catch (error) {
    console.warn('Unable to remove temporary image file from cache.', {
      message: error?.message || 'Unknown file delete error',
      uri,
    });
  }
};

const createInlineCompatibilityError = () =>
  createNormalizedStorageError(new Error('Inline image compatibility mode is required.'), {
    code: INLINE_STORAGE_COMPATIBILITY_ERROR_CODE,
    message:
      'This React Native build stores selected images using the inline compatibility path instead of Firebase Storage uploads.',
  });

export const getStringByteSize = (value) => {
  if (!value) {
    return 0;
  }

  try {
    return new TextEncoder().encode(value).length;
  } catch (error) {
    return unescape(encodeURIComponent(value)).length;
  }
};

export const buildInlineImageDataUri = (asset) => {
  if (!asset?.base64) {
    return null;
  }

  const mimeType = asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
  return `data:${mimeType};base64,${asset.base64}`;
};

export const readImageBase64FromAsset = async (asset) => {
  if (typeof asset?.base64 === 'string' && asset.base64.trim()) {
    return asset.base64.trim();
  }

  const extension = getImageExtension(asset);
  const resolvedImage = await resolveLocalImageUri(asset, extension);

  if (!resolvedImage.uri) {
    return null;
  }

  try {
    return await FileSystem.readAsStringAsync(resolvedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    return null;
  } finally {
    if (resolvedImage.cleanupUri) {
      await deleteTemporaryImageUri(resolvedImage.cleanupUri);
    }
  }
};

export const buildInlineImageDataUriFromAsset = async (asset, { maxBytes = Infinity } = {}) => {
  const base64 = await readImageBase64FromAsset(asset);

  if (!base64) {
    return null;
  }

  const mimeType = asset?.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
  const inlineImage = `data:${mimeType};base64,${base64}`;

  if (Number.isFinite(maxBytes) && maxBytes > 0 && getStringByteSize(inlineImage) > maxBytes) {
    return null;
  }

  return inlineImage;
};

export const canUseInlineStorageFallback = (error, inlineImage) =>
  Boolean(inlineImage) && INLINE_FALLBACK_STORAGE_ERROR_CODES.includes(error?.code);

const storageBucketHint =
  FIREBASE_STORAGE_BUCKET?.endsWith('.firebasestorage.app')
    ? ' Default buckets created on or after October 30, 2024 require the Blaze pricing plan before Firebase Storage can be used.'
    : '';

export const getStorageUserMessage = (error, fallbackMessage) => {
  const serverResponse = getStorageServerResponse(error).toLowerCase();

  if (
    serverResponse.includes('blaze') ||
    serverResponse.includes('billing') ||
    serverResponse.includes('pricing plan')
  ) {
    return `Firebase Storage for this project needs the Blaze plan before cloud image uploads will work.${storageBucketHint}`;
  }

  switch (error?.code) {
    case INLINE_STORAGE_COMPATIBILITY_ERROR_CODE:
      return 'This build saved the image using compatibility mode. Try a smaller image if needed.';
    case 'storage/bucket-not-found':
    case 'storage/no-default-bucket':
      return `Firebase Storage is not fully configured for this project yet. Open Firebase Console > Build > Storage, finish setup, and verify the bucket is "${FIREBASE_STORAGE_BUCKET}".${storageBucketHint}`;
    case 'storage/unauthorized':
      return 'Firebase Storage blocked the upload. Check your Storage rules for this upload path.';
    case 'storage/canceled':
      return 'The image upload was canceled before it finished.';
    case 'storage/retry-limit-exceeded':
      return 'The upload timed out. Try again with a smaller image or a stronger connection.';
    case 'storage/quota-exceeded':
      return 'Firebase Storage quota or billing is preventing uploads right now.';
    case 'storage/unknown':
      return `Firebase Storage returned an unknown server error. Check the bucket setup, billing plan, and storage rules for "${FIREBASE_STORAGE_BUCKET}".`;
    default:
      return error?.message || fallbackMessage;
  }
};

const getMimeTypeExtension = (mimeType) => {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return null;
  }
};

const getImageExtension = (source) => {
  const { fileName, mimeType, uri = '' } = normalizeUploadSource(source);
  const extensionFromMimeType = getMimeTypeExtension(mimeType);

  if (extensionFromMimeType) {
    return extensionFromMimeType;
  }

  const candidatePath = fileName || uri;
  const cleanPath = candidatePath.split('?')[0];
  const extension = cleanPath.split('.').pop()?.toLowerCase();

  if (!extension || extension.includes('/')) {
    return 'jpg';
  }

  return extension === 'jpeg' ? 'jpg' : extension;
};

const getContentType = (source, extension) => {
  const { mimeType } = normalizeUploadSource(source);

  if (mimeType?.startsWith('image/')) {
    return mimeType;
  }

  if (extension === 'png') {
    return 'image/png';
  }

  if (extension === 'webp') {
    return 'image/webp';
  }

  if (extension === 'heic') {
    return 'image/heic';
  }

  if (extension === 'heif') {
    return 'image/heif';
  }

  return 'image/jpeg';
};

const readFileBlob = (uri) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      resolve(xhr.response);
    };

    xhr.onerror = () => {
      reject(new Error('We could not read the selected image file.'));
    };

    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

const uploadBlobAtPath = async (source, storagePath) => {
  const normalizedSource = normalizeUploadSource(source);
  const { uri, base64 } = normalizedSource;
  let inlineFallbackBase64 = typeof base64 === 'string' && base64.trim() ? base64.trim() : null;
  const extension = getImageExtension(source);
  const resolvedUploadSource = await resolveLocalImageUri(normalizedSource, extension);
  const uploadUri = resolvedUploadSource.uri;
  const cleanupUri = resolvedUploadSource.cleanupUri;

  const ensureInlineFallbackBase64 = async () => {
    if (inlineFallbackBase64) {
      return inlineFallbackBase64;
    }

    inlineFallbackBase64 = await readImageBase64FromAsset(normalizedSource);
    return inlineFallbackBase64;
  };

  if (!uri) {
    throw new Error('No image file was selected for upload.');
  }

  const fileRef = ref(storage, `${storagePath}.${extension}`);

  try {
    let blob = null;

    try {
      blob = await readFileBlob(uploadUri);
    } catch (error) {
      if (await ensureInlineFallbackBase64()) {
        throw createInlineCompatibilityError();
      }

      throw error;
    }

    try {
      await uploadBytes(fileRef, blob, {
        contentType: blob.type || getContentType(normalizedSource, extension),
      });
    } finally {
      blob.close?.();
    }

    return await getDownloadURL(fileRef);
  } catch (error) {
    const normalizedError = normalizeStorageError(error);
    const inlineFallbackBase64Value = await ensureInlineFallbackBase64();
    const inlineFallbackAvailable =
      normalizedError?.code !== INLINE_STORAGE_COMPATIBILITY_ERROR_CODE &&
      canUseInlineStorageFallback(normalizedError, inlineFallbackBase64Value);

    if (
      normalizedError?.code !== INLINE_STORAGE_COMPATIBILITY_ERROR_CODE &&
      !inlineFallbackAvailable
    ) {
      console.error('Firebase Storage upload failed:', getStorageDebugDetails(normalizedError, storagePath));
    }
    throw normalizedError;
  } finally {
    if (cleanupUri) {
      await deleteTemporaryImageUri(cleanupUri);
    }
  }
};

export const uploadImage = async (source, hazardId) => {
  const { uri } = normalizeUploadSource(source);

  if (!uri) {
    return null;
  }

  if (!hazardId) {
    throw new Error('A hazard ID is required before uploading an image.');
  }

  return uploadBlobAtPath(source, `hazards/${hazardId}/${Date.now()}`);
};

export const uploadProfileImage = async (source, userId) => {
  const { uri } = normalizeUploadSource(source);

  if (!uri) {
    return null;
  }

  if (!userId) {
    throw new Error('A user ID is required before uploading a profile image.');
  }

  return uploadBlobAtPath(source, `profiles/${userId}/avatar-${Date.now()}`);
};
