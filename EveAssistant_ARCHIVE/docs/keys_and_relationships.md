# Keys and Relationships

This document outlines the primary keys, foreign keys, and relationships between tables, which will be implemented using TypeORM.

---

### `users` Table

-   **Primary Key**: `characterId`
-   **Relationships**:
    -   Has a **one-to-many** relationship with `fittings`. One user can have many fittings.
    -   Has a **one-to-many** relationship with `skill_plans`. One user can have many skill plans.

---

### `fittings` Table

-   **Primary Key**: `fittingId` (auto-incrementing)
-   **Foreign Keys**:
    -   `userId`: References `users(characterId)`.
-   **Relationships**:
    -   Belongs to **one** `user` (a **many-to-one** relationship).
    -   The relationship to `sde_ships` is conceptual, not a direct foreign key, as the SDE data is static and may not be fully relational in our local DB. The application logic will enforce that `shipTypeId` corresponds to a valid ship.

---

### `skill_plans` Table

-   **Primary Key**: `planId` (auto-incrementing)
-   **Foreign Keys**:
    -   `userId`: References `users(characterId)`.
-   **Relationships**:
    -   Belongs to **one** `user` (a **many-to-one** relationship).

---

### SDE Tables (`sde_ships`, `sde_modules`, `sde_skills`)

-   **Primary Key**: `typeId` for each table.
-   **Relationships**:
    -   These tables are largely standalone lookup tables.
    -   There are no enforced foreign key constraints from other tables *to* the SDE tables to allow for flexibility and simplify the SDE import process. The application logic will handle data integrity.

---

### `cached_data` Table

-   **Primary Key**: `cacheKey`
-   **Relationships**: None. This is a standalone key-value store.

---

### TypeORM Implementation Notes

-   `@PrimaryColumn()` or `@PrimaryGeneratedColumn()` will be used for primary keys.
-   `@ManyToOne()` and `@OneToMany()` decorators will be used to define the relationships between `users`, `fittings`, and `skill_plans`.
-   `@JoinColumn()` will be used on the "many" side of the relationships to specify the foreign key column.
-   Indexing will be considered for foreign key columns (`userId`) and other frequently queried columns to improve performance. 