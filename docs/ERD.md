# VirtualLab AKUANALIS - Entity Relationship Diagram

## Overview
This document outlines the database architecture for the VirtualLab AKUANALIS platform. It describes the core entities, their attributes, and the relationships that form the foundation of the virtual laboratory system.

## Entity Descriptions

| Entity | Purpose |
| ------ | ------- |
| USER | Core identity representation for authentication and authorization. |
| STUDENT | Extends USER with student-specific information (program, semester). |
| INSTRUCTOR | Extends USER with instructor-specific information (expertise). |
| CLASS | Represents a teaching class/course organized by an instructor. |
| CLASS_MEMBER | Junction entity mapping students to the classes they are enrolled in. |
| LAB_MODULE | Reusable laboratory module defining theory, procedure, and experiments. |
| EXPERIMENT | A specific instance of a lab module assigned to a class with deadlines. |
| EXPERIMENT_SESSION | Represents a student's attempt/session performing an experiment. |
| EXPERIMENT_INPUT | Records the data points and values input by a student during a session. |
| CALCULATION_RESULT | Stores intermediate and final calculations derived from session inputs. |
| SUBMISSION | A finalized submission of an experiment session for grading. |
| GRADE | The final evaluation of a submission containing various score components. |
| QUIZ | An assessment component associated with a lab module. |
| QUIZ_QUESTION | Individual questions belonging to a quiz. |
| QUIZ_ATTEMPT | A student's attempt at taking a quiz. |
| QUIZ_ANSWER | A student's answer to a specific quiz question. |
| CHEMICAL_ELEMENT | Catalog of standard chemical elements (periodic table). |
| CHEMICAL_COMPOUND | Catalog of chemical compounds. |
| COMPOUND_ELEMENT | Junction mapping chemical compounds to their constituent elements. |
| LUFF_SCHOORL_TABLE | Reference table for Luff Schoorl analysis. |
| LUFF_SCHOORL_VALUE | Specific volume and mass values for Luff Schoorl calculations. |
| FORMULA | Mathematical formulas used for validating calculations in experiments. |
| FORMULA_VERSION | Version history for formulas to ensure historical calculation integrity. |
| AUDIT_LOG | System-wide audit trail recording critical user actions. |

## Entity Relationship Diagram

```mermaid
erDiagram

    USER ||--o| STUDENT : has
    USER ||--o| INSTRUCTOR : has

    INSTRUCTOR ||--o{ CLASS : teaches

    CLASS ||--o{ CLASS_MEMBER : contains
    STUDENT ||--o{ CLASS_MEMBER : joins

    CLASS ||--o{ EXPERIMENT : has
    LAB_MODULE ||--o{ EXPERIMENT : uses

    EXPERIMENT ||--o{ EXPERIMENT_SESSION : creates
    STUDENT ||--o{ EXPERIMENT_SESSION : performs

    EXPERIMENT_SESSION ||--o{ EXPERIMENT_INPUT : contains
    EXPERIMENT_SESSION ||--o{ CALCULATION_RESULT : produces

    EXPERIMENT ||--o{ SUBMISSION : receives
    STUDENT ||--o{ SUBMISSION : submits

    SUBMISSION ||--o| GRADE : receives

    LAB_MODULE ||--o{ QUIZ : contains
    QUIZ ||--o{ QUIZ_QUESTION : contains
    STUDENT ||--o{ QUIZ_ATTEMPT : attempts
    QUIZ ||--o{ QUIZ_ATTEMPT : has

    QUIZ_ATTEMPT ||--o{ QUIZ_ANSWER : contains
    QUIZ_QUESTION ||--o{ QUIZ_ANSWER : answers

    CHEMICAL_ELEMENT ||--o{ COMPOUND_ELEMENT : contains
    CHEMICAL_COMPOUND ||--o{ COMPOUND_ELEMENT : contains

    LUFF_SCHOORL_TABLE ||--o{ LUFF_SCHOORL_VALUE : contains

    LAB_MODULE ||--o{ FORMULA : defines
    FORMULA ||--o{ FORMULA_VERSION : versions

    USER ||--o{ AUDIT_LOG : generates

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role
        enum status
        string avatarUrl
    }

    STUDENT {
        string id PK
        string userId FK_UK
        string studentNumber UK
        string program
        int semester
    }

    INSTRUCTOR {
        string id PK
        string userId FK_UK
        string employeeNumber UK
        string expertise
    }

    CLASS {
        string id PK
        string name
        string code UK
        string course
        string semester
        string academicYear
        string instructorId FK
    }

    CLASS_MEMBER {
        string id PK
        string classId FK
        string studentId FK
        datetime joinedAt
    }

    LAB_MODULE {
        string id PK
        string slug UK
        string name
        string category
        string description
        text theory
        text procedure
        boolean isActive
    }

    EXPERIMENT {
        string id PK
        string moduleId FK
        string classId FK
        string title
        string description
        text instructions
        decimal maxScore
        datetime deadline
        boolean isPublished
    }

    EXPERIMENT_SESSION {
        string id PK
        string experimentId FK
        string studentId FK
        string status
        datetime startedAt
        datetime completedAt
    }

    EXPERIMENT_INPUT {
        string id PK
        string sessionId FK
        string parameter
        decimal value
        string textValue
        string unit
    }

    CALCULATION_RESULT {
        string id PK
        string sessionId FK
        string calculationId
        string formula
        json inputSnapshot
        json intermediate
        decimal result
        string unit
        string status
    }

    SUBMISSION {
        string id PK
        string experimentId FK
        string studentId FK
        string sessionId
        datetime submittedAt
        string status
        string reportUrl
    }

    GRADE {
        string id PK
        string submissionId FK_UK
        decimal preTest
        decimal practical
        decimal calculation
        decimal report
        decimal postTest
        decimal total
        string feedback
    }

    CHEMICAL_ELEMENT {
        string id PK
        int atomicNumber
        string symbol UK
        decimal atomicMass
        string groupName
        int period
        string category
    }

    CHEMICAL_COMPOUND {
        string id PK
        string name
        string formula UK
        decimal molarMass
        string description
    }

    COMPOUND_ELEMENT {
        string id PK
        string compoundId FK
        string elementId FK
        int quantity
    }

    LUFF_SCHOORL_TABLE {
        string id PK
        string name
        string description
    }

    LUFF_SCHOORL_VALUE {
        string id PK
        string tableId FK
        decimal volumeMl
        decimal glucoseMg
        decimal lactoseMg
        decimal maltoseMg
    }

    FORMULA {
        string id PK
        string moduleId FK
        string code UK
        string name
        string description
        string expression
        string unit
        boolean isSystem
        boolean isActive
    }

    FORMULA_VERSION {
        string id PK
        string formulaId FK
        int version
        string expression
    }

    QUIZ {
        string id PK
        string moduleId FK
        string title
        string description
        int timeLimit
        int passingScore
        boolean isActive
    }

    QUIZ_QUESTION {
        string id PK
        string quizId FK
        string questionText
        string questionType
        json options
        string correctAnswer
        int points
        int orderIndex
    }

    QUIZ_ATTEMPT {
        string id PK
        string quizId FK
        string studentId FK
        int score
        boolean passed
        datetime startedAt
        datetime completedAt
    }

    QUIZ_ANSWER {
        string id PK
        string attemptId FK
        string questionId FK
        string answer
        boolean isCorrect
        int pointsAwarded
    }

    AUDIT_LOG {
        string id PK
        string userId FK
        string action
        string entity
        string entityId
        json metadata
        string ipAddress
        string userAgent
    }
```

## Relationship Descriptions
- **Users and Roles**: A `USER` can have exactly one associated `STUDENT` or `INSTRUCTOR` profile (1:1).
- **Classes**: An `INSTRUCTOR` teaches multiple `CLASS` instances (1:N). A `CLASS` contains multiple `STUDENT`s via the `CLASS_MEMBER` junction (M:N).
- **Experiments**: A `LAB_MODULE` defines templates for multiple `EXPERIMENT`s. An `EXPERIMENT` belongs to a single `CLASS`.
- **Sessions and Submissions**: A `STUDENT` creates multiple `EXPERIMENT_SESSION`s. Each session contains many `EXPERIMENT_INPUT`s and `CALCULATION_RESULT`s. A session leads to a `SUBMISSION`, which receives exactly one `GRADE`.
- **Quizzes**: A `LAB_MODULE` contains multiple `QUIZ`zes. Students make `QUIZ_ATTEMPT`s, consisting of `QUIZ_ANSWER`s to `QUIZ_QUESTION`s.
- **Chemical Reference**: `CHEMICAL_COMPOUND`s are composed of multiple `CHEMICAL_ELEMENT`s via the `COMPOUND_ELEMENT` junction (M:N).
- **Luff Schoorl Reference**: `LUFF_SCHOORL_TABLE`s consist of many `LUFF_SCHOORL_VALUE`s.
- **Formulas**: `FORMULA`s belong to `LAB_MODULE`s and have multiple `FORMULA_VERSION`s for version control.

## Index Strategy
- Primary Keys (`PK`) on all `id` fields.
- Unique Constraints (`UK`) on fields such as `USER.email`, `STUDENT.studentNumber`, `INSTRUCTOR.employeeNumber`, `CLASS.code`, `LAB_MODULE.slug`, `CHEMICAL_ELEMENT.symbol`, `CHEMICAL_COMPOUND.formula`, `FORMULA.code`.
- Foreign Keys (`FK`) indexing for relationship traversal.

## Notes on Naming Conventions and Cascade Behavior
- Table names are represented in uppercase `SNAKE_CASE`.
- Deletions of parent records (e.g., `CLASS`) typically cascade to dependent records (e.g., `CLASS_MEMBER`, `EXPERIMENT`) or are soft-deleted to preserve historical data.
