# 07\_Testing.md

**Project:** Bookishly Yours
**Document:** Testing Plan
**Status:** Draft
**Author:** Poorvaja M Sooraj
**Last Updated:** 01 August 2026

---

# 1. Introduction

## Purpose

This document defines the testing strategy for Bookishly Yours. The objective is to ensure that every feature works as expected, provides a smooth user experience, and does not introduce bugs before deployment.

The application will primarily use manual testing during Version 1, with the possibility of introducing automated testing in future versions.

---

# 2. Testing Strategy

Version 1 will focus on:

* Manual Testing
* Functional Testing
* UI Testing
* Integration Testing
* Regression Testing
* Basic Performance Testing

Automated testing is intentionally excluded from Version 1 to keep the project simple and development-focused.

---

# 3. Testing Levels

## 3.1 Functional Testing

Verify that every feature behaves correctly.

Examples:

* User Registration
* User Login
* Add Book
* Edit Book
* Delete Book
* Start Reading
* Pause Reading
* Resume Reading
* Stop Reading
* Upload Photo
* Record Voice
* Save Thought
* Save Quote
* Finish Book
* Search Books

---

## 3.2 UI Testing

Verify that the interface behaves correctly.

Checklist:

* Buttons are clickable.
* Popups open correctly.
* Images display properly.
* Forms are aligned.
* Responsive layout works.
* Colors remain consistent.
* Typography is readable.

---

## 3.3 Integration Testing

Verify that different modules work together.

Examples:

* Login → Dashboard
* Add Book → Home Dashboard
* Reading Session → Statistics
* Reading Session → Reading Journey
* Search → Reading Journey Popup

---

## 3.4 Regression Testing

After adding a new feature, verify that existing features still work.

Example:

After implementing Voice Notes:

* Add Book still works.
* Reading Timer still works.
* Search still works.
* Photos still upload correctly.

---

## 3.5 Basic Performance Testing

Verify:

* Fast page loading.
* Quick navigation.
* Smooth scrolling.
* No noticeable lag during normal use.

---

# 4. Test Cases

## Authentication

| Test Case | Expected Result |
| ----- | ----- |
| Register new account | Account created successfully |
| Login with correct credentials | User enters dashboard |
| Login with incorrect password | Error message displayed |
| Login with unregistered email | Error message displayed |
| Logout | User session ends |

---

## Library

| Test Case | Expected Result |
| ----- | ----- |
| Add Book | Book appears on dashboard |
| Edit Book | Changes saved |
| Delete Book | Book removed |
| Upload Cover | Cover image displayed |

---

## Reading Session

| Test Case | Expected Result |
| ----- | ----- |
| Start Reading | Timer starts |
| Pause Reading | Timer pauses |
| Resume Reading | Timer continues |
| Stop Reading | Progress updated |
| Finish Book | Book marked as completed |
| Session interrupted and resumed | Recovery prompt displayed |

---

## Reading Journey

| Test Case | Expected Result |
| ----- | ----- |
| Add Thought | Thought appears in timeline |
| Add Voice | Voice recording saved |
| Add Photo | Photo displayed |
| Add Quote | Quote saved |
| Add Reflection | Reflection displayed |
| Rate Book | Rating updated |

---

## Search

| Test Case | Expected Result |
| ----- | ----- |
| Search by Title | Matching books displayed |
| Search by Author | Matching books displayed |
| Search by Genre | Matching books displayed |
| Search with no results | Empty state message displayed |

---

## Data Isolation

| Test Case | Expected Result |
| ----- | ----- |
| Access another user's books via API | Request denied |
| Access another user's reading sessions | Request denied |

---

# 5. Edge Case Testing

Test the following situations:

* Current page greater than total pages.
* Negative page numbers.
* Empty book title.
* Empty author name.
* Reading session interrupted.
* Upload invalid file type.
* Upload very large image.
* Record zero-second voice note.
* Delete a memory.
* Edit a reflection.
* Read multiple books simultaneously.

---

# 6. Browser Testing

The application should be tested on:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox

Mobile browsers (optional):

* Chrome (Android)
* Safari (iPhone)

---

# 7. Responsive Testing

Verify layouts on:

* Desktop
* Laptop
* Tablet
* Mobile

Ensure:

* No overlapping elements.
* No horizontal scrolling.
* Proper spacing.
* Readable text.

---

# 8. Bug Tracking

Every discovered bug should be recorded with:

| Field | Description |
| ----- | ----- |
| Bug ID | Unique identifier |
| Module | Feature affected |
| Description | Issue observed |
| Steps to Reproduce | How to reproduce |
| Expected Result | Correct behavior |
| Actual Result | Observed behavior |
| Status | Open / Fixed / Closed |

---

# 9. Acceptance Criteria

The application is ready for deployment when:

* All MVP features are functional.
* No critical bugs remain.
* Data is stored correctly.
* Reading sessions work reliably.
* The Reading Journey displays correctly.
* Responsive design works on supported devices.
* Manual testing checklist is completed.

---

# 10. Future Testing

For future versions, consider adding:

* Unit Testing
* API Testing
* End-to-End Testing
* Automated Regression Testing
* Performance Benchmarking
