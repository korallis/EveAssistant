# Data Dictionary

This document outlines the core data entities for the EveHelper application, based on the Product Requirements Document.

## Core Entities

### 1. User / Character
Stores information about the EVE Online character linked to the application.

-   **characterId**: `Integer` (Primary Key) - EVE character ID.
-   **characterName**: `String` - Character's name.
-   **accessToken**: `String` (Encrypted) - OAuth access token for ESI.
-   **refreshToken**: `String` (Encrypted) - OAuth refresh token for ESI.
-   **tokenExpires**: `DateTime` - Expiration date of the access token.
-   **skills**: `JSON` or `Relation` - A list or link to the character's trained skills and levels.

### 2. SDE (Static Data Export) Entities
These entities are imported from the EVE SDE and are generally read-only within the application.

#### 2.1. Ship
-   **typeId**: `Integer` (Primary Key) - Unique ID for the ship type.
-   **name**: `String`
-   **description**: `Text`
-   **race**: `String`
-   **attributes**: `JSON` - A collection of ship attributes (CPU, powergrid, slots, resistances, etc.).

#### 2.2. Module
-   **typeId**: `Integer` (Primary Key) - Unique ID for the module type.
-   **name**: `String`
-   **description**: `Text`
-   **attributes**: `JSON` - A collection of module attributes (CPU/PG usage, effects, etc.).
-   **effects**: `JSON` - Details on the effects the module provides.

#### 2.3. Skill
-   **typeId**: `Integer` (Primary Key) - Unique ID for the skill type.
-   **name**: `String`
-   **description**: `Text`
-   **attributes**: `JSON` - Skill attributes (e.g., primary/secondary attribute for training).

### 3. Fitting
Represents a specific ship fitting created by a user.

-   **fittingId**: `Integer` (Primary Key, Auto-increment)
-   **userId**: `Integer` (Foreign Key to User.characterId)
-   **shipTypeId**: `Integer` (Foreign Key to Ship.typeId)
-   **name**: `String` - User-defined name for the fitting.
-   **description**: `Text`
-   **modules**: `JSON` - A structured list of modules, their slot, and state (e.g., `{ moduleId: 123, slot: 'High', state: 'Active' }`).
-   **createdAt**: `DateTime`
-   **updatedAt**: `DateTime`

### 4. SkillPlan
A user-defined plan for training skills.

-   **planId**: `Integer` (Primary Key, Auto-increment)
-   **userId**: `Integer` (Foreign Key to User.characterId)
-   **name**: `String`
-   **skillQueue**: `JSON` - An ordered list of skills to be trained (e.g., `[{ skillId: 2403, targetLevel: 5 }]`).

### 5. CachedData
A generic table for caching various data to improve performance and reduce API calls.

-   **cacheKey**: `String` (Primary Key) - A unique key for the cached item (e.g., `market_price_jita_tritanium`).
-   **cacheValue**: `JSON` or `Text` - The cached data.
-   **expiresAt**: `DateTime` - When the cache entry should be considered stale. 