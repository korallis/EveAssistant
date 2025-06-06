# Table Definitions

This document provides detailed definitions for each table in the database schema.

---

### `users`

Stores EVE Online character information linked to the application.

| Column          | Data Type     | Constraints              | Description                               |
| --------------- | ------------- | ------------------------ | ----------------------------------------- |
| `characterId`   | `INTEGER`     | `PRIMARY KEY`            | EVE character ID.                         |
| `characterName` | `VARCHAR(255)`| `NOT NULL`               | Character's name.                         |
| `accessToken`   | `VARCHAR(2048)`| `NOT NULL`               | Encrypted OAuth access token for ESI.     |
| `refreshToken`  | `VARCHAR(2048)`| `NOT NULL`               | Encrypted OAuth refresh token for ESI.    |
| `tokenExpires`  | `DATETIME`    | `NOT NULL`               | Expiration date of the access token.      |
| `skills`        | `JSON`        |                          | Character's trained skills and levels.    |

---

### `fittings`

Represents a specific ship fitting created by a user.

| Column        | Data Type     | Constraints                           | Description                               |
| ------------- | ------------- | ------------------------------------- | ----------------------------------------- |
| `fittingId`   | `INTEGER`     | `PRIMARY KEY AUTOINCREMENT`           | Unique identifier for the fitting.        |
| `userId`      | `INTEGER`     | `NOT NULL, FOREIGN KEY(users)`        | References the user who created the fitting. |
| `shipTypeId`  | `INTEGER`     | `NOT NULL`                            | The type ID of the ship for this fitting. |
| `name`        | `VARCHAR(255)`| `NOT NULL`                            | User-defined name for the fitting.        |
| `description` | `TEXT`        |                                       | Optional description for the fitting.     |
| `modules`     | `JSON`        | `NOT NULL`                            | Structured list of modules in the fitting. |
| `createdAt`   | `DATETIME`    | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Timestamp of creation.                    |
| `updatedAt`   | `DATETIME`    | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Timestamp of the last update.             |

---

### `skill_plans`

Stores user-defined plans for training skills.

| Column       | Data Type     | Constraints                           | Description                               |
| ------------ | ------------- | ------------------------------------- | ----------------------------------------- |
| `planId`     | `INTEGER`     | `PRIMARY KEY AUTOINCREMENT`           | Unique identifier for the skill plan.     |
| `userId`     | `INTEGER`     | `NOT NULL, FOREIGN KEY(users)`        | References the user who created the plan. |
| `name`       | `VARCHAR(255)`| `NOT NULL`                            | User-defined name for the skill plan.     |
| `skillQueue` | `JSON`        | `NOT NULL`                            | Ordered list of skills to be trained.     |

---

### SDE Tables (`sde_ships`, `sde_modules`, `sde_skills`)

These tables store data imported from the EVE Static Data Export. They are read-only within the application. The structure will be similar for each.

**Example: `sde_ships`**

| Column      | Data Type     | Constraints   | Description                               |
| ----------- | ------------- | ------------- | ----------------------------------------- |
| `typeId`    | `INTEGER`     | `PRIMARY KEY` | Unique ID for the ship type.              |
| `name`      | `VARCHAR(255)`| `NOT NULL`    | Name of the item.                         |
| `description`| `TEXT`        |               | In-game description of the item.          |
| `attributes`| `JSON`        |               | Key-value store of item attributes.       |
| `effects`   | `JSON`        |               | (For modules) Effects provided.           |
| `race`      | `VARCHAR(50)` |               | (For ships) The race of the ship.         |

---

### `cached_data`

A key-value store for caching API calls and other computed data.

| Column      | Data Type     | Constraints   | Description                               |
| ----------- | ------------- | ------------- | ----------------------------------------- |
| `cacheKey`  | `VARCHAR(255)`| `PRIMARY KEY` | A unique key for the cached item.         |
| `cacheValue`| `JSON`        | `NOT NULL`    | The cached data.                          |
| `expiresAt` | `DATETIME`    | `NOT NULL`    | When the cache entry should be considered stale. | 