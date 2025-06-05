# Transformer Architecture

This document outlines the architecture for the EVE SDE data transformation pipeline. The goal is to create a flexible and extensible system for converting raw YAML data from the SDE into the structured format required by the application's database.

---

## Core Concepts

The architecture is based on a **pipeline pattern**, where data is passed through a series of **transformers**. Each transformer is a self-contained unit that performs a specific data manipulation task.

-   **Transformer Pipeline**: A coordinator that manages the execution of a sequence of transformers on a given dataset.
-   **Transformer**: An individual component that receives data, performs a transformation, and returns the modified data.
-   **Configuration**: A declarative way (e.g., a YAML or JSON file) to define which transformers to run and in what order for a specific SDE file type.

---

## Transformer Interface

All transformers will implement a common TypeScript interface to ensure consistency and interoperability.

```typescript
interface Transformer {
  // A unique name for the transformer
  name: string;

  // The main transformation method
  transform(data: any, options?: any): Promise<any>;
}
```

-   `data`: The input data to be transformed.
-   `options`: Optional parameters to configure the transformer's behavior (e.g., a list of fields to map or a filter condition).

---

## Transformer Types

We will implement several types of transformers to handle the different aspects of data conversion.

### 1. Mapping Transformer
-   **Purpose**: To map fields from the source data to the target schema.
-   **Operations**: Renaming fields, converting data types, and mapping nested structures.
-   **Configuration**: Will take a mapping configuration that defines `sourceField -> targetField` relationships.

### 2. Filtering Transformer
-   **Purpose**: To include or exclude data based on certain conditions.
-   **Operations**: Filtering based on field values, existence checks, or custom predicates.
-   **Configuration**: Will take a set of filter conditions (e.g., `field: 'race', value: 'Caldari'`).

### 3. Restructuring Transformer
-   **Purpose**: To change the shape and hierarchy of the data.
-   **Operations**: Flattening nested objects, grouping related data, and creating new structures.
-   **Configuration**: Will take rules that define the desired output structure.

---

## Workflow

1.  **Read SDE File**: The system reads a raw SDE data file (e.g., `blueprints.yaml`).
2.  **Load Configuration**: It loads the corresponding transformation configuration for that file type.
3.  **Initialize Pipeline**: A new Transformer Pipeline is created based on the configuration.
4.  **Execute Transformers**: The data is passed sequentially through each transformer in the pipeline.
5.  **Output**: The final transformed data is returned, ready to be validated and inserted into the database.

This modular architecture will allow us to easily add new transformations or modify existing ones without changing the core pipeline logic, simply by updating the configuration files. 