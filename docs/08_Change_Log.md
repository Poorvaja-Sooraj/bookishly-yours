# 08\_Change\_Log.md

**Project:** Bookishly Yours
**Document:** Change Log
**Status:** Active
**Author:** Poorvaja M Sooraj
**Last Updated:** 01 August 2026

---

# 1. Purpose

This document records significant changes made to the project throughout its development. It serves as a historical record of feature additions, design decisions, improvements, bug fixes, and architectural updates.

The purpose of this document is to:

* Track the evolution of the project.
* Record important design decisions.
* Maintain a history of feature changes.
* Help future development and debugging.
* Make project progress easy to understand.

---

# 2. Version History

| Version | Date | Description |
| ----- | ----- | ----- |
| 1.0 | 01 Aug 2026 | Initial project documentation created. |

---

# 3. Change Categories

Each change should belong to one of the following categories:

* Feature Added
* Feature Modified
* Feature Removed
* UI/UX Improvement
* Database Change
* Performance Improvement
* Bug Fix
* Documentation Update
* Refactoring

---

# 4. Change Log Entries

---

## Version 1.0

### Documentation

* Created Project Vision document.
* Created Product Requirements document.
* Created Features document.
* Created Database Design document.
* Created UI/UX Design document.
* Created Development Roadmap.
* Created Testing Plan.
* Created Change Log.

---

### Product Design

* Defined Bookishly Yours as a memory preservation platform rather than just a reading tracker.
* Introduced the Reading Journey concept as the core feature.
* Designed the Reading Journey as a single scrollable popup.
* Decided to keep the interface warm, calm, and minimal.

---

### Reading Experience

* Added Reading Session tracking.
* Added Start, Pause, Resume, and Stop workflow.
* Introduced the Finish Book button to create a sense of accomplishment.
* Enabled multiple reading sessions for the same book.

---

### Memories

* Added support for:
  * Thoughts
  * Voice Notes
  * Photos
  * Quotes
  * Reflection
  * Rating
* Designed memories to appear in chronological order.

---

### Database

* Selected MongoDB Atlas.
* Selected Mongoose as the ODM.
* Chose local file storage for Version 1.
* Planned a storage abstraction layer for future migration to Cloudinary or other providers.
* Simplified the architecture to three collections:
  * Users
  * Books
  * ReadingSessions

---

### UI/UX

* Selected a cozy reading journal theme.
* Finalized warm color palette.
* Chose a single popup for the Reading Journey.
* Decided against multiple tabs for book details.

---

### Development

* Adopted a milestone-based roadmap.
* Prioritized MVP development.
* Deferred AI and community features to future versions.

---

# 5. Future Changes

Use the following format whenever a significant update is made.

---

**Version X.X**

**Date:** DD Month YYYY

**Category:** Feature Added / Bug Fix / Improvement / Refactoring

**Description:** Brief explanation of the change.

**Reason:** Why the change was made.

---

### Example

**Version 1.1**

**Category:** Feature Added

**Description:** Added OCR-based quote search.

**Reason:** Allow users to search uploaded quote images by text.

---

# 6. Documentation Guidelines

Only record changes that significantly affect the project.

Do not record:

* Minor code formatting.
* Variable renaming.
* Typographical corrections.
* Small UI spacing adjustments.

Record changes such as:

* New features.
* Database changes.
* UI redesigns.
* Architecture changes.
* Major bug fixes.
* Deployment changes.

---

# 7. Project Timeline

| Milestone | Status |
| ----- | ----- |
| Project Vision | ✅ |
| Product Requirements | ✅ |
| Features | ✅ |
| Database Design | ✅ |
| UI/UX Design | ✅ |
| Development Roadmap | ✅ |
| Testing Plan | ✅ |
| Change Log | ✅ |
| Development | ⏳ Pending |
| Deployment | ⏳ Pending |

---

# 8. Notes

This document should be updated whenever the project undergoes a significant change. Maintaining an accurate change log helps track the evolution of Bookishly Yours and provides context for future development decisions.
