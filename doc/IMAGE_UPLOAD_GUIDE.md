# Image Upload Guide

This guide explains how MineShield handles image selection, upload, preview, and fallback storage.

## Purpose

Images are attached to hazard reports so supervisors can see what a worker found in the field. The upload system is designed to:

- let workers choose an image from camera or gallery
- preview the selected file before submission
- upload the image to Firebase Storage when possible
- fall back to inline image storage for small compatibility cases
- avoid crashing on Android content URIs by copying them into cache first

## Where Image Uploads Are Used

Current image upload logic is centered in:

- `src/screens/worker/ReportHazardScreen.js`
- `src/components/common/ImageUploader.js`
- `src/services/storageService.js`

The storage service also supports profile images through `uploadProfileImage(source, userId)`.

## Current Upload Flow

The hazard upload path uses this sequence:

```text
pick image
-> keep the returned asset
-> submit hazard record first
-> upload image using hazard ID
-> update hazard with image URL
-> fall back to inline data URI if needed
```

## User Selection Flow

The app supports two common picker sources:

- camera
- gallery or photo library

The shared `ImageUploader` component handles the permission prompts, preview state, and clear action.

## Shared Component Behavior

`src/components/common/ImageUploader.js` provides:

- image preview
- camera and gallery actions
- clear/remove action
- loading overlay while the picker is open
- configurable permission copy
- optional editing and aspect ratio settings

Important default behavior:

- `base64` is `false` by default to avoid extra memory use
- `exif` is `false` by default
- `quality` defaults to `0.4`

## Hazard Screen Behavior

`ReportHazardScreen` currently uses the Expo image picker directly rather than mounting the shared component. It follows the same storage rules:

- camera images are requested with editing enabled
- gallery images are requested with editing enabled
- the returned asset is kept in state
- the hazard is submitted even if the image later fails to upload

## Storage Service Behavior

`src/services/storageService.js` is the backend-facing upload layer.

### Functions

- `uploadImage(source, hazardId)`
- `uploadProfileImage(source, userId)`
- `buildInlineImageDataUriFromAsset(asset, options)`
- `readImageBase64FromAsset(asset)`
- `canUseInlineStorageFallback(error, inlineImage)`

### Upload Path

`uploadImage(source, hazardId)`:

- requires a hazard ID
- uploads to `hazards/{hazardId}/{timestamp}`
- returns a Firebase Storage download URL on success

`uploadProfileImage(source, userId)`:

- requires a user ID
- uploads to `profiles/{userId}/avatar-{timestamp}`

## Android Content URI Handling

Some Android pickers return `content://` URIs instead of normal file paths. Firebase Storage cannot always read those directly.

To handle that safely, the app:

- copies `content://` assets into the device cache first
- uploads from the cached file
- deletes the temporary file after upload finishes or fails

This avoids the common "cannot read image" failure path.

## Inline Fallback Mode

If Firebase Storage fails, the app may store a small inline data URI instead of a cloud URL.

This fallback is only used when:

- the error code is compatible with inline fallback
- the inline image exists
- the image size stays under the configured limit

Current hazard image limit:

- `500 KB` inline maximum in the hazard screen and offline sync path

Fallback is useful when:

- Firebase Storage is temporarily unavailable
- the upload is blocked by environment or compatibility issues
- the team wants a small attachment that can still render in the app

## Error Handling

Common upload failure cases handled by `storageService.js`:

- missing Firebase Storage bucket
- unauthorized uploads
- canceled upload
- quota or billing limits
- retry limit exceeded
- unknown server errors

The service converts these into clearer messages where possible so the UI can show something useful to the worker.

## Best Practices

- Keep `base64` off unless you need an inline fallback.
- Prefer smaller photos when possible.
- Let the picker return a normal `uri` and upload from that.
- Avoid requesting EXIF data unless you actually use it.
- Treat inline data URIs as a compatibility path, not the primary storage method.
- Always keep the hazard record even if the image upload fails.

## Troubleshooting

- If the picker opens but the upload fails, confirm Firebase Storage is enabled and the bucket is configured.
- If the app says it cannot read the image, check whether the picker returned a `content://` URI and whether the temporary cache copy succeeded.
- If upload works on one device but not another, check for billing, permission, or bucket configuration differences.
- If a very large image fails, try a smaller image or reduce the quality setting.

## Developer Notes

- For new forms, prefer reusing `ImageUploader` instead of wiring picker logic manually.
- Use the storage helper rather than calling Firebase Storage directly from screens.
- Keep the hazard submission flow resilient: save the hazard first, then attach media.

