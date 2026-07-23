# PROMPTS.md — AI Tooling Chat History

This file contains the prompts I used when working with AI tools (Antigravity / Gemini) during the development of the **Car Dealership Inventory System**, mapped to the corresponding Git commits.

---

## Commit: `feat(auth): implement user registration with TDD` — `5efa991`

> *"Used AI assistants to generate an initial implementation draft and explain TDD with Jest and Supertest. The implementation was manually reviewed, modified, tested, and integrated."*

**Prompt used:**
```
Implement the backend authentication module using TDD. Create registration and login endpoints with password hashing, JWT authentication, validation, and proper error handling. Begin with failing Jest and Supertest tests before writing the implementation.
```

---

## Commit: `test(vehicle): Red 🔴 add failing CRUD tests` — `bd86506`

> *Co-authored-by: Gemini 3.6 Flash*

**Prompt used:**
```
Generate the initial failing integration tests for Vehicle CRUD operations following the Red phase of TDD. Cover create, read, update, and delete functionality, authentication, authorization, and common failure scenarios using Jest and Supertest.
```

---

## Commit: `feat(vehicle): Green 🟢 implement vehicle CRUD endpoints` — `4351b59`

> *"Used AI assistant to improve vehicleService feature and debugging. The implementation was manually tested and integrated."*
> *Co-authored-by: Gemini 3.6 Flash*

**Prompt used:**
```
Implement the minimum backend functionality required to satisfy the Vehicle CRUD test suite. Keep controllers lightweight, move business logic into the service layer, and ensure all existing tests pass.
```

---

## Commit: `refactor(vehicle): Refactor ♻️ improve service validation and controller error handling` — `70d98da`

> *"Used Gemini to review the service layer and suggest improvements for readability and maintainability."*
> *Co-authored-by: Gemini 3.6 Flash*

**Prompt used:**
```
Review the Vehicle module and improve code quality through refactoring. Simplify the service layer, improve validation, standardize error handling, reduce duplication, and increase maintainability without changing application behavior.
```

---

## Commit: `test(search): Red 🔴 add failing vehicle search tests` — `ab20987`

> *"Used Gemini to improve the Jest and Supertest test cases. Reviewed the generated tests, refined assertions, and ensured they matched the project requirements."*
> *Co-authored-by: Gemini 3.6 Flash*

**Prompt used:**
```
Create the failing TDD test suite for the vehicle search feature. Include filtering by vehicle attributes, price range, and validation of expected API responses before implementation begins.
```

---

## Commit: `test(inventory): Red 🔴 add failing purchase tests` — `2e0b503`

> *"Used Gemini to improve assertions, and polish the overall test structure while preserving the intended TDD workflow."*
> *Co-authored-by: Gemini 3.6 Flash*

**Prompt used:**
```
Generate failing integration tests for the vehicle purchase workflow. Cover authentication, stock validation, successful purchases, inventory updates, and appropriate error responses while following the Red phase of TDD.
```

---

## Commit: `test(search): Red 🔴 add failing test suite for vehicle search feature` — `c83ca5e`

> *"Used Antigravity to generate the initial Jest and Supertest test structure. Manually reviewed the test cases, updated assertions, and verified they correctly fail before implementation."*
> *Co-authored-by: Gemini 3.6 Flash*

**Prompt used:**
```
Generate the frontend TDD test suite for the vehicle search interface using React Testing Library and Vitest. Cover search inputs, user interactions, API integration, and empty-state behavior before implementation.

```

---

## Summary of AI Tool Usage

| Commit | AI Tool Used | Usage Type |
|--------|-------------|------------|
| `feat(auth): implement user registration with TDD` | Gemini / Antigravity | Initial implementation draft + TDD explanation |
| `test(vehicle): Red 🔴 add failing CRUD tests` | Gemini | Failing test generation |
| `feat(vehicle): Green 🟢 implement vehicle CRUD endpoints` | Gemini | Service feature improvement + debugging |
| `refactor(vehicle): ♻️ improve service validation` | Gemini | Code review + refactoring suggestions |
| `test(search): Red 🔴 add failing vehicle search tests` | Gemini | Test case improvement + assertion refinement |
| `test(inventory): Red 🔴 add failing purchase tests` | Gemini | Assertion improvement + test structure polish |
| `test(search): Red 🔴 add failing test suite for vehicle search feature` | Antigravity | Frontend test structure generation |

> **Note:** AI tools were used to assist with implementation, testing, debugging, and refactoring. Every AI-generated suggestion was manually reviewed, modified where necessary, tested locally, and verified before being committed. The developer retained full responsibility for the final implementation and ensured compliance with the project's TDD workflow.
