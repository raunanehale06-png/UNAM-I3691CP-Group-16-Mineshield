# Reporting Workflow

This document explains how MineShield turns a hazard report into a stored hazard record, an alert, and, when needed, an offline queue item.

## Purpose

The reporting workflow is the worker-facing path for capturing a safety issue on site. It is designed to:

- record the hazard details as soon as possible
- attach a usable location label and coordinates when available
- create a linked alert for supervisors and on-duty workers
- preserve the report offline if the network or backend is unavailable
- generate a stable report code for reference in dashboards and details screens

## Main Entry Point

The main user flow starts in `src/screens/worker/ReportHazardScreen.js`.

Supporting services:

- `src/services/firestoreService.js`
- `src/services/offlineService.js`
- `src/services/locationService.js`
- `src/services/storageService.js`
- `src/utils/hazardReportCode.js`

## End-to-End Flow

1. The worker opens the hazard form.
2. The worker enters a description and severity.
3. The worker sets a zone label.
4. The worker attaches a location using GPS or a manual area/landmark.
5. The worker optionally attaches an image.
6. The app validates the required fields.
7. The app geocodes the location label if coordinates are missing.
8. The app creates a hazard document in Firestore.
9. The app uploads the image if one was selected.
10. The app creates a related alert document.
11. If Firestore submission fails, the app saves the report to the offline queue and retries sync.

## Online Submission Path

When the network and Firestore are available, the screen follows this order:

```text
validate inputs
-> resolve location
-> add hazard document
-> upload image if present
-> update hazard with image URL or inline fallback
-> create alert linked to the hazard
-> confirm success and return to the previous screen
```

### Validation Rules

- Description is required.
- A location must be attached before submission.
- The zone field is normalized, then derived from location if empty.
- The app attempts to geocode the selected location label when coordinates are missing.

### Hazard Record Payload

The hazard document created by `addHazard()` includes:

- `description`
- `severity`
- `status`
- `userId`
- `reportedBy`
- `zone`
- `zoneId`
- `location`
- `locationLabel`
- `latitude`
- `longitude`
- `imageUrl` or `imageURL`
- `reportCode`
- timestamps such as `createdAt`, `timestamp`, and `updatedAt`

The report code is generated in `src/utils/hazardReportCode.js` and stored with the hazard record so it can be reused in worker and supervisor views.

### Alert Record Payload

After the hazard is created, the app writes a linked alert to `alerts` with:

- `hazardId`
- `userId`
- `severity`
- `title`
- `body`
- `type`
- `zone`
- `zoneId`
- `read: false`

The alert is a secondary record. If alert creation fails after a successful hazard write, the hazard still remains saved.

## Location Handling

The workflow supports two location modes:

- GPS location, captured from the device
- manual location, built from area and landmark text

If the location object has a label but no coordinates, the app attempts to geocode the label before submission. This helps keep the saved record useful for map and dashboard views.

## Image Handling

If an image is selected, the app tries to upload it after the hazard document exists.

Current behavior:

- the hazard is created first
- the image is uploaded second
- if upload succeeds, the hazard is updated with a Firebase Storage URL
- if upload fails and a compatibility fallback is allowed, the app may store a small inline data URI instead
- if both paths fail, the hazard still remains saved without an image

## Offline Submission Path

If the main Firestore write fails, the app switches to the offline queue in `src/services/offlineService.js`.

Offline path:

```text
build queued hazard payload
-> save report into AsyncStorage queue
-> attempt immediate sync if possible
-> keep unsynced items in the queue
-> show "Saved offline" when the queue is retained
```

The offline queue is stored under the AsyncStorage key `@mineshield_hazard_queue`.

### What Gets Queued

Queued reports keep the fields needed to rebuild the server payload later:

- description
- severity
- location
- locationLabel
- latitude
- longitude
- zone
- zoneId
- userId
- reportedBy
- status
- imageAsset if one was selected

When the queue syncs later, the app:

- recreates or updates the hazard record
- uploads or restores the image if possible
- creates the linked alert if it does not already exist

## Data Sources

The workflow depends on several data sources:

- Firestore `hazards` collection
- Firestore `alerts` collection
- Firestore `users` collection for the current account context
- device GPS from `locationService`
- manual location text entered by the worker
- AsyncStorage for offline queuing

## Success and Failure Behavior

### Success

- the hazard is stored in Firestore
- the alert is created
- the form resets
- the user returns to the previous screen

### Partial Success

- hazard saved, but alert creation failed
- image upload failed, but hazard still saved
- queue sync partially completed

### Offline Success

- report is stored locally
- the app attempts sync immediately
- unsynced reports remain in the queue and retry later

## Best Practices

- Keep descriptions short but specific.
- Always attach a location before submitting.
- Use the most precise zone name available.
- Prefer GPS when the device can provide a stable reading.
- Use the offline queue as a fallback, not as the primary submission path.
- Check `reportCode` when referencing an item in support or supervisor conversations.

## Troubleshooting

- If submission fails immediately, check the required fields first.
- If the hazard saves but the image does not, review Firebase Storage configuration and storage rules.
- If reports appear offline but never sync, check network access and Firestore connectivity.
- If a location looks wrong, confirm the label was geocoded or entered manually in the expected format.

