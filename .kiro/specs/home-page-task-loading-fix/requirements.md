# Requirements Document

## Introduction

The home page of the RPG miniprogram is currently not loading today's tasks properly. The logs show that only habits are being loaded while tasks are being skipped. This is due to a duplicate function definition where the second `loadTodayData` function overrides the first one and doesn't include task loading functionality.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see my today's tasks on the home page, so that I can quickly view and manage my daily tasks without navigating to the tasks page.

#### Acceptance Criteria

1. WHEN the home page loads THEN the system SHALL display today's pending and in-progress tasks
2. WHEN the home page onShow event is triggered THEN the system SHALL reload both tasks and habits data
3. WHEN tasks are loaded THEN the system SHALL show up to 5 tasks with their title, experience points, and completion status
4. WHEN no tasks are available THEN the system SHALL display an empty task list without errors

### Requirement 2

**User Story:** As a user, I want the home page to consistently load both tasks and habits, so that I have a complete overview of my daily activities.

#### Acceptance Criteria

1. WHEN the loadTodayData function is called THEN the system SHALL load both tasks and habits
2. WHEN there are duplicate function definitions THEN the system SHALL use only one consolidated function
3. WHEN the page refreshes THEN the system SHALL maintain the same loading behavior for both tasks and habits
4. WHEN debugging is enabled THEN the system SHALL log task loading progress clearly

### Requirement 3

**User Story:** As a developer, I want clean and maintainable code structure, so that future modifications are easier and bugs are prevented.

#### Acceptance Criteria

1. WHEN reviewing the code THEN there SHALL be no duplicate function definitions
2. WHEN the loadTodayData function is defined THEN it SHALL include all necessary data loading operations
3. WHEN functions are organized THEN they SHALL follow a logical order and clear separation of concerns
4. WHEN error handling is implemented THEN it SHALL provide meaningful feedback for debugging