# 04\_Database.md

**Project:** Bookishly Yours
**Document:** Database Design
**Status:** Draft
**Author:** Poorvaja M Sooraj
**Last Updated:** 01 August 2026

---

# 1. Introduction

## Purpose

This document defines the database architecture and data model for Bookishly Yours. It outlines the collections, fields, relationships, and storage strategy required to support the application's functionality. The database is designed to remain simple for Version 1 while allowing future expansion without major architectural changes.

---

# 2. Database Technology

| Component | Technology |
| ----- | ----- |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| File Storage (Version 1) | Local Storage |
| Future Storage | Cloudinary / AWS S3 / Supabase Storage |
| Backend | Next.js API Routes |

---

# 3. Database Philosophy

The database follows three simple principles:

* Store structured data in MongoDB.
* Store uploaded files locally in Version 1.
* Keep the storage layer independent so that future migration requires minimal code changes.

---

# 4. Collections Overview

The application uses the following collections:

* Users
* Books
* ReadingSessions

Book memories (thoughts, voice recordings, photos, quotes, reflections) are stored inside the Book document as embedded data because they belong only to that specific book.

---

# 5. Collection Details

---

## Users Collection

### Purpose

Stores user account information.

| Field | Type | Description |
| ----- | ----- | ----- |
| \_id | ObjectId | Primary Key |
| name | String | User's name |
| email | String | Unique email |
| password | String | Hashed password |
| profileImage | String | Profile image path |
| bio | String | Optional biography |
| createdAt | Date | Account creation date |
| updatedAt | Date | Last update timestamp |

---

## Books Collection

### Purpose

Stores all books belonging to a user.

| Field | Type | Description |
| ----- | ----- | ----- |
| \_id | ObjectId | Primary Key |
| userId | ObjectId | Reference to User |
| title | String | Book title |
| author | String | Author name |
| genre | String | Genre |
| description | String | Optional description |
| coverImage | String | Cover image path |
| totalPages | Number | Total pages |
| currentPage | Number | Current reading page |
| status | String | Wishlist / Currently Reading / Completed |
| startedAt | Date | Reading start date |
| finishedAt | Date | Completion date |
| rating | Number | 1–5 stars (null if unrated) |
| reflection | String | Final reflection after finishing |
| memories | Array | Collection of thoughts, photos, voice notes, and quotes |
| createdAt | Date | Creation date |
| updatedAt | Date | Last updated |

---

## Memories Structure

Every book contains an array of memories.

Each memory can be one of the following types:

* Thought
* Photo
* Voice Recording
* Quote

### Memory Object

| Field | Type | Description |
| ----- | ----- | ----- |
| id | String | Unique identifier |
| type | String | thought / photo / voice / quote |
| content | String | Text content (for thoughts and quotes) |
| fileUrl | String | File path (for photos and voice recordings) |
| createdAt | Date | Time of creation |

This structure keeps all memories in chronological order and simplifies the Reading Journey.

---

## ReadingSessions Collection

### Purpose

Stores every reading session separately.

| Field | Type | Description |
| ----- | ----- | ----- |
| \_id | ObjectId | Primary Key |
| userId | ObjectId | Reference to User |
| bookId | ObjectId | Reference to Book |
| startPage | Number | Starting page |
| endPage | Number | Ending page |
| startedAt | Date | Session start |
| endedAt | Date | Session end |
| duration | Number | Duration in seconds |
| createdAt | Date | Creation timestamp |

---

# 6. Relationships

```
User
│
├── Books
│      │
│      ├── Reading Sessions
│      └── Memories
```

Relationship Summary

* One User → Many Books
* One Book → Many Reading Sessions
* One Book → Many Memories

---

# 7. Reading Session Workflow

When a reading session starts:

* User selects the starting page.
* Timer starts.

During the session:

* Pause
* Resume
* Stop

While paused:

* Add Thought
* Add Voice Recording
* Add Photo

When stopped:

* User enters ending page.
* Reading progress updates.
* Statistics update.
* Session is stored in ReadingSessions.

If the ending page equals the total pages:

* Display Finish Book button.

---

# 8. File Storage Strategy

Version 1 stores uploaded files locally.

Project structure:

```
public/
  uploads/
    covers/
    photos/
    voice/
    profiles/
```

MongoDB stores only file paths.

Example:

```json
{
  "coverImage": "/uploads/covers/book.jpg"
}
```

Example Memory:

```json
{
  "type": "photo",
  "fileUrl": "/uploads/photos/photo1.jpg"
}
```

---

# 9. Storage Abstraction

To support future migration, all upload functionality will be handled through a dedicated Storage Layer.

The rest of the application should never directly save files.

Instead, it should call:

`uploadFile()`

`deleteFile()`

Today these functions save files locally.

In the future they can save to:

* Cloudinary
* AWS S3
* Supabase Storage

without affecting the rest of the application.

---

# 10. Validation Rules

## Users

* Name is required.
* Email is required and must be unique.
* Password is required.

---

## Books

* Title is required.
* Author is required.
* Total Pages must be greater than zero.
* Current Page cannot exceed Total Pages.
* Rating must be between 1 and 5 when provided. Unrated books store no rating value.
* Status must be:
  * Wishlist
  * Currently Reading
  * Completed

---

## Reading Sessions

* Start Page ≤ End Page
* End Page ≤ Total Pages
* Duration must be greater than zero.

---

## Memories

* Type is required.
* A memory must contain either:
  * Content (text), or
  * File URL (photo or voice recording).
* Every memory stores its creation timestamp.

---

# 11. Future Expansion

The database is designed to support future features without major restructuring.

Planned additions include:

* Multiple Reading Journeys for re-reading the same book.
* Memory Lane.
* OCR-based Quote Search.
* AI-generated reflections.
* Notifications.
* Reading Wrapped.
* Friend System.
* Shared Books.

---

# 12. Design Decisions

| Decision | Reason |
| ----- | ----- |
| MongoDB | Flexible document-based database suitable for nested data. |
| Three Collections | Keeps the database simple and easy to maintain. |
| Embedded Memories | All memories belong to a single book and are retrieved together. |
| Separate ReadingSessions Collection | A book can have many sessions, making statistics easier to calculate. |
| Local File Storage | Simplifies Version 1 development. |
| Storage Layer | Enables future migration to Cloudinary or another storage provider with minimal code changes. |

---

# 13. Database Principles

The database should always follow these principles:

* Keep the design simple.
* Avoid unnecessary collections.
* Keep related data together.
* Separate reading sessions from book details.
* Design for future scalability without overengineering.
* Make storage migration possible through abstraction.

---

# 14. Database Summary

Bookishly Yours uses a simple MongoDB architecture centered around three collections: Users, Books, and ReadingSessions. Each Book contains an embedded collection of memories, allowing readers to preserve their thoughts, photos, voice recordings, quotes, and reflections in chronological order. Uploaded files are stored locally during Version 1, while a dedicated storage layer ensures seamless migration to cloud storage in future versions without major changes to the application architecture.
