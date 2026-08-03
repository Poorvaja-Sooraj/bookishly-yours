# 02\_Product\_Requirements.md

**Project:** Bookishly Yours
**Document:** Product Requirements Document (PRD)
**Status:** Draft
**Author:** Poorvaja M Sooraj
**Last Updated:** 01 August 2026

---

# 1. Introduction

## Purpose

This document defines the functional behavior, user interactions, workflows, and overall user experience of Bookishly Yours. It serves as the primary reference for designers, developers, and future contributors throughout the development process.

Unlike the Project Vision document, which explains why the application exists, this document focuses on how the application should behave from the user's perspective.

---

# 2. Product Overview

Bookishly Yours is a personal reading companion that combines reading progress tracking with memory preservation. The application allows readers to organize their books, record their thoughts and emotions while reading, and revisit their complete reading journey years later. Every interaction is designed to help users preserve not only the books they read but also the version of themselves who experienced those books.

---

# 3. Design Principles

Every future feature, screen, and interaction should follow these principles.

## 3.1 Emotion First

The application should prioritize preserving readers' memories and emotions over displaying statistics.

---

## 3.2 Minimal Distractions

The interface should feel warm, calm, elegant, and uncluttered. Readers should never feel overwhelmed by unnecessary elements.

---

## 3.3 Everything in One Place

Readers should never require multiple applications to:

* Track reading progress
* Save thoughts
* Save quotes
* Upload memorable pages
* Record voice reflections

Everything should exist within Bookishly Yours.

---

## 3.4 Reader Freedom

The application should never force readers into predefined templates.

Readers should be free to express themselves through:

* Text
* Voice
* Images

without restrictions.

---

## 3.5 Preserve Moments

Every meaningful reading moment should be easy to capture without interrupting the reading experience.

---

## 3.6 Simplicity

Every feature should be intuitive enough that a first-time user can understand it without any instructions.

---

# 4. Functional Requirements

## 4.1 User Management

The system shall allow users to:

* Register
* Login
* Logout
* Manage Profile

---

## 4.2 Library Management

Users shall be able to:

* Add books
* Edit books
* Delete books
* Search books
* Update reading status

---

## 4.3 Reading Management

The system shall support:

* Start Reading Session
* Pause Reading Session
* Resume Reading Session
* Stop Reading Session
* Reading Timer
* Progress Tracking
* Finish Book

---

## 4.4 Memory Management

Users shall be able to:

* Write thoughts
* Record voice notes
* Upload images
* Save quotes
* Write reflections
* Rate books

---

# 5. Non-Functional Requirements

The application should:

* Be responsive on desktop, tablet, and mobile.
* Load quickly.
* Save data automatically.
* Recover interrupted reading sessions.
* Secure user data.
* Provide an intuitive interface.
* Be scalable for future enhancements.
* Be easy to maintain.

---

# 6. User Flow

Landing Page
↓
Start Your Reading Journey
↓
Login / Signup
↓
Welcome Screen
↓
Home Dashboard
↓
Add Book
↓
Book Created
↓
Click Book
↓
Reading Journey Popup
↓
Start Reading
↓
Reading Session
↓
Pause
↓
Add Thought / Add Voice / Add Photo
↓
Resume Reading
↓
Stop Reading
↓
Enter Ending Page
↓
Update Reading Progress
↓
Finish Book
↓
Reading Journey Completed

---

# 7. Screens

## 7.1 Landing Page

### Purpose
Introduce Bookishly Yours and encourage users to begin their reading journey.

---

## 7.2 Authentication

### Purpose
Allow users to securely access their personal reading library.

---

## 7.3 Welcome Screen

### Purpose
Provide a warm introduction after successful login.

---

## 7.4 Home Dashboard

### Purpose
Display every book in the user's library.

Books should be sorted by:
* Latest Added

### Contains
* Navigation Bar
* Search Bar
* Add Book Button
* Book Cards

---

## 7.5 Add Book Popup

### Fields
* Cover Image
* Book Title
* Author
* Genre
* Total Pages
* Current Page
* Reading Status
* Description

### Button
Create Book

---

## 7.6 Reading Journey Popup

### Purpose
Display the complete reading journey of a selected book.

Everything should appear within a single scrollable popup.

The popup should not contain multiple tabs or separate pages.

---

# 8. Book Lifecycle

Every book shall follow the following lifecycle.

Wishlist
↓
Currently Reading
↓
Paused Reading
↓
Completed
↓
Re-read (Future Version)

> *Note:* "Paused Reading" represents a user experience state within "Currently Reading." The database stores three statuses: Wishlist, Currently Reading, and Completed. A reader may pause their reading sessions, but the book's status remains "Currently Reading" until it is completed.

---

# 9. Reading Session

A reading session begins when the user presses Start Reading.

The user selects:
* Starting Page

The application then:
* Starts the timer
* Activates Reading Mode

---

## During Reading

Users can:
* Pause
* Stop

The application continuously displays:
* Timer
* Current Reading Status

---

## While Paused

The timer stops.

The application displays:
* Add Thought
* Add Voice Recording
* Add Photo
* Resume Reading

Each captured item should first show a preview with Confirm (✓) or Discard (✗) before being saved.

---

## Stopping a Reading Session

When the user presses Stop Reading, the application asks for:
* Ending Page

The system then:
* Calculates reading progress
* Updates statistics
* Stores session duration

If the ending page equals the total pages of the book, display:

Finish Book

to provide a sense of accomplishment.

---

# 10. Reading Journey

The Reading Journey is the core experience of Bookishly Yours.

Every selected book opens a single scrollable popup containing:

* Cover Image
* Title
* Author
* Genre
* Started Date
* Finished Date
* Reading Progress
* Total Reading Time
* Number of Sessions
* Uploaded Photos
* Thoughts (Chronological)
* Voice Recordings (Chronological)
* Quotes
* Personal Reflection
* Rating

The design should resemble a personal journal rather than a statistics dashboard.

---

# 11. Reading Timeline

Every memory should be preserved in chronological order.

Thoughts
↓
Voice Notes
↓
Photos
↓
Reading Progress
↓
Book Completion

This allows readers to replay their complete emotional journey exactly as it happened.

---

# 12. Search

Users shall be able to search by:
* Book Title
* Author
* Genre

Future versions shall support:
* OCR-based Quote Search

Selecting a search result should directly open the corresponding Reading Journey.

---

# 13. Session Recovery

If a reading session is interrupted because of:

* Browser closure
* Battery drain
* Internet loss
* Application crash

the application should automatically detect the unfinished session and ask:

> Would you like to continue your previous reading session?

### Options
* Continue Reading
* Start New Session

---

# 14. User Permissions

Users may:

* Create Books
* Edit Books
* Delete Books
* Upload Photos
* Delete Photos
* Record Voice Notes
* Delete Voice Notes
* Add Thoughts
* Edit Thoughts
* Delete Thoughts
* Update Reading Progress

Users may only access their own data.

---

# 15. Edge Cases

The application should handle:

* Interrupted Reading Sessions
* Multiple Books Being Read Simultaneously
* Accidental Photo Capture
* Accidental Voice Recording
* Deleting Memories
* Editing Reviews
* Empty Thoughts
* Duplicate Books
* Invalid Page Numbers
* Reading Beyond Total Pages

---

# 16. Future Enhancements

The following features are intentionally excluded from Version 1.

* Re-reading Timeline
* Memory Lane
* Annual Reading Wrapped
* OCR Quote Search
* AI Reflections
* AI Book Summaries
* Book Sharing
* Reading Community
* Friend System

---

# 17. Product Philosophy

Every feature in Bookishly Yours must answer one question:

> Does this help readers preserve, revisit, or relive their reading journey?

If the answer is Yes, it belongs in the product.

If the answer is No, it should be reconsidered or moved to a future version.

---

# 18. Guiding Principles

Bookishly Yours is not designed to be another book tracking application.

Reading statistics are important, but they are secondary.

The primary purpose of the application is to preserve the reader's emotional journey.

The application should help readers remember not only the stories they read, but also the person they were when they experienced those stories.

---

# 19. Product Philosophy Statement

> Track the book. Capture the moment. Preserve the memory. Relive the journey.

---
