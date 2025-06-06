# Schema Normalization and Optimization

This document analyzes the database schema for normalization and outlines optimization strategies.

---

### Normalization Analysis

The current schema design is a pragmatic blend of normalization and deliberate denormalization to suit the application's needs.

1.  **`users`, `fittings`, `skill_plans` Tables**:
    -   These tables are in **Third Normal Form (3NF)**.
    -   All attributes are dependent on the primary key, the whole key, and nothing but the key.
    -   There are no transitive dependencies.

2.  **Use of JSON Columns (`skills`, `modules`, `skillQueue`, `attributes`)**:
    -   The use of `JSON` columns is a form of **denormalization**. Instead of creating separate tables for a character's skills or a fitting's modules (which would be a more normalized approach), this data is stored within the parent record.
    -   **Justification**:
        -   **Simplicity**: It significantly simplifies the data model and the application logic required to query and manage this data. The data within these columns is always queried in the context of its parent (e.g., a fitting's modules are only needed when loading that specific fitting).
        -   **Performance**: It can improve read performance, as fetching a user or a fitting requires a single row lookup rather than multiple joins.
        -   **Flexibility**: The structure of the EVE SDE and character data can change. Using JSON provides flexibility without requiring schema migrations for every minor change.

-   **Conclusion**: The schema is sufficiently normalized for the application's requirements, with denormalization used strategically to improve performance and simplify development.

---

### Optimization Strategies

1.  **Indexing**:
    -   **Primary Keys**: Will be automatically indexed.
    -   **Foreign Keys**: An index will be created on `fittings.userId` and `skill_plans.userId` to speed up queries that fetch all fittings or skill plans for a specific user.
    -   **SDE Tables**: An index on `sde_ships.name`, `sde_modules.name`, and `sde_skills.name` will be beneficial for search functionality.
    -   **JSON Columns**: Depending on the database system and query patterns, it may be possible to index specific keys within the JSON data if performance becomes an issue.

2.  **Caching**:
    -   The `cached_data` table provides a generic mechanism for application-level caching of expensive queries or API calls (e.g., market data).

3.  **Query Optimization**:
    -   The use of TypeORM's query builder or `find` options will be monitored to ensure efficient queries are generated.
    -   Complex calculations (e.g., fitting statistics) will be performed in the application layer after fetching the necessary raw data, rather than in the database, to keep the database's role focused on data storage and retrieval. 