

# cursor_rules

---
description: Guidelines for creating and maintaining Cursor rules to ensure consistency and effectiveness.
globs: .cursor/rules/*.mdc
alwaysApply: true
---

- **Required Rule Structure:**
  ```markdown
  ---
  description: Clear, one-line description of what the rule enforces
  globs: path/to/files/*.ext, other/path/**/*
  alwaysApply: boolean
  ---

  - **Main Points in Bold**
    - Sub-points with details
    - Examples and explanations
  ```

- **File References:**
  - Use `[filename](mdc:path/to/file)` ([filename](mdc:filename)) to reference files
  - Example: [prisma.mdc](mdc:.cursor/rules/prisma.mdc) for rule references
  - Example: [schema.prisma](mdc:prisma/schema.prisma) for code references

- **Code Examples:**
  - Use language-specific code blocks
  ```typescript
  // ✅ DO: Show good examples
  const goodExample = true;
  
  // ❌ DON'T: Show anti-patterns
  const badExample = false;
  ```

- **Rule Content Guidelines:**
  - Start with high-level overview
  - Include specific, actionable requirements
  - Show examples of correct implementation
  - Reference existing code when possible
  - Keep rules DRY by referencing other rules

- **Rule Maintenance:**
  - Update rules when new patterns emerge
  - Add examples from actual codebase
  - Remove outdated patterns
  - Cross-reference related rules

- **Best Practices:**
  - Use bullet points for clarity
  - Keep descriptions concise
  - Include both DO and DON'T examples
  - Reference actual code over theoretical examples
  - Use consistent formatting across rules 


# dev_workflow

---
description: Guide for using Task Master to manage task-driven development workflows
globs: **/*
alwaysApply: true
---
# Task Master Development Workflow

This guide outlines the typical process for using Task Master to manage software development projects.

## Primary Interaction: MCP Server vs. CLI

Task Master offers two primary ways to interact:

1.  **MCP Server (Recommended for Integrated Tools)**:
    - For AI agents and integrated development environments (like Cursor), interacting via the **MCP server is the preferred method**.
    - The MCP server exposes Task Master functionality through a set of tools (e.g., `get_tasks`, `add_subtask`).
    - This method offers better performance, structured data exchange, and richer error handling compared to CLI parsing.
    - Refer to [`mcp.mdc`](mdc:.cursor/rules/mcp.mdc) for details on the MCP architecture and available tools.
    - A comprehensive list and description of MCP tools and their corresponding CLI commands can be found in [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc).
    - **Restart the MCP server** if core logic in `scripts/modules` or MCP tool/direct function definitions change.

2.  **`task-master` CLI (For Users & Fallback)**:
    - The global `task-master` command provides a user-friendly interface for direct terminal interaction.
    - It can also serve as a fallback if the MCP server is inaccessible or a specific function isn't exposed via MCP.
    - Install globally with `npm install -g task-master-ai` or use locally via `npx task-master-ai ...`.
    - The CLI commands often mirror the MCP tools (e.g., `task-master list` corresponds to `get_tasks`).
    - Refer to [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc) for a detailed command reference.

## Standard Development Workflow Process

-   Start new projects by running `initialize_project` tool / `task-master init` or `parse_prd` / `task-master parse-prd --input='<prd-file.txt>'` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) to generate initial tasks.json
-   Begin coding sessions with `get_tasks` / `task-master list` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) to see current tasks, status, and IDs
-   Determine the next task to work on using `next_task` / `task-master next` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)).
-   Analyze task complexity with `analyze_project_complexity` / `task-master analyze-complexity --research` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) before breaking down tasks
-   Review complexity report using `complexity_report` / `task-master complexity-report` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)).
-   Select tasks based on dependencies (all marked 'done'), priority level, and ID order
-   Clarify tasks by checking task files in tasks/ directory or asking for user input
-   View specific task details using `get_task` / `task-master show <id>` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) to understand implementation requirements
-   Break down complex tasks using `expand_task` / `task-master expand --id=<id> --force --research` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) with appropriate flags like `--force` (to replace existing subtasks) and `--research`.
-   Clear existing subtasks if needed using `clear_subtasks` / `task-master clear-subtasks --id=<id>` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) before regenerating
-   Implement code following task details, dependencies, and project standards
-   Verify tasks according to test strategies before marking as complete (See [`tests.mdc`](mdc:.cursor/rules/tests.mdc))
-   Mark completed tasks with `set_task_status` / `task-master set-status --id=<id> --status=done` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc))
-   Update dependent tasks when implementation differs from original plan using `update` / `task-master update --from=<id> --prompt="..."` or `update_task` / `task-master update-task --id=<id> --prompt="..."` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc))
-   Add new tasks discovered during implementation using `add_task` / `task-master add-task --prompt="..." --research` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)).
-   Add new subtasks as needed using `add_subtask` / `task-master add-subtask --parent=<id> --title="..."` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)).
-   Append notes or details to subtasks using `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='Add implementation notes here...\nMore details...'` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)).
-   Generate task files with `generate` / `task-master generate` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) after updating tasks.json
-   Maintain valid dependency structure with `add_dependency`/`remove_dependency` tools or `task-master add-dependency`/`remove-dependency` commands, `validate_dependencies` / `task-master validate-dependencies`, and `fix_dependencies` / `task-master fix-dependencies` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) when needed
-   Respect dependency chains and task priorities when selecting work
-   Report progress regularly using `get_tasks` / `task-master list`
-   Reorganize tasks as needed using `move_task` / `task-master move --from=<id> --to=<id>` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) to change task hierarchy or ordering

## Task Complexity Analysis

-   Run `analyze_project_complexity` / `task-master analyze-complexity --research` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) for comprehensive analysis
-   Review complexity report via `complexity_report` / `task-master complexity-report` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) for a formatted, readable version.
-   Focus on tasks with highest complexity scores (8-10) for detailed breakdown
-   Use analysis results to determine appropriate subtask allocation
-   Note that reports are automatically used by the `expand_task` tool/command

## Task Breakdown Process

-   Use `expand_task` / `task-master expand --id=<id>`. It automatically uses the complexity report if found, otherwise generates default number of subtasks.
-   Use `--num=<number>` to specify an explicit number of subtasks, overriding defaults or complexity report recommendations.
-   Add `--research` flag to leverage Perplexity AI for research-backed expansion.
-   Add `--force` flag to clear existing subtasks before generating new ones (default is to append).
-   Use `--prompt="<context>"` to provide additional context when needed.
-   Review and adjust generated subtasks as necessary.
-   Use `expand_all` tool or `task-master expand --all` to expand multiple pending tasks at once, respecting flags like `--force` and `--research`.
-   If subtasks need complete replacement (regardless of the `--force` flag on `expand`), clear them first with `clear_subtasks` / `task-master clear-subtasks --id=<id>`.

## Implementation Drift Handling

-   When implementation differs significantly from planned approach
-   When future tasks need modification due to current implementation choices
-   When new dependencies or requirements emerge
-   Use `update` / `task-master update --from=<futureTaskId> --prompt='<explanation>\nUpdate context...' --research` to update multiple future tasks.
-   Use `update_task` / `task-master update-task --id=<taskId> --prompt='<explanation>\nUpdate context...' --research` to update a single specific task.

## Task Status Management

-   Use 'pending' for tasks ready to be worked on
-   Use 'done' for completed and verified tasks
-   Use 'deferred' for postponed tasks
-   Add custom status values as needed for project-specific workflows

## Task Structure Fields

- **id**: Unique identifier for the task (Example: `1`, `1.1`)
- **title**: Brief, descriptive title (Example: `"Initialize Repo"`)
- **description**: Concise summary of what the task involves (Example: `"Create a new repository, set up initial structure."`)
- **status**: Current state of the task (Example: `"pending"`, `"done"`, `"deferred"`)
- **dependencies**: IDs of prerequisite tasks (Example: `[1, 2.1]`)
    - Dependencies are displayed with status indicators (✅ for completed, ⏱️ for pending)
    - This helps quickly identify which prerequisite tasks are blocking work
- **priority**: Importance level (Example: `"high"`, `"medium"`, `"low"`)
- **details**: In-depth implementation instructions (Example: `"Use GitHub client ID/secret, handle callback, set session token."`) 
- **testStrategy**: Verification approach (Example: `"Deploy and call endpoint to confirm 'Hello World' response."`) 
- **subtasks**: List of smaller, more specific tasks (Example: `[{"id": 1, "title": "Configure OAuth", ...}]`) 
- Refer to task structure details (previously linked to `tasks.mdc`).

## Configuration Management (Updated)

Taskmaster configuration is managed through two main mechanisms:

1.  **`.taskmaster/config.json` File (Primary):**
    *   Located in the project root directory.
    *   Stores most configuration settings: AI model selections (main, research, fallback), parameters (max tokens, temperature), logging level, default subtasks/priority, project name, etc.
    *   **Managed via `task-master models --setup` command.** Do not edit manually unless you know what you are doing.
    *   **View/Set specific models via `task-master models` command or `models` MCP tool.**
    *   Created automatically when you run `task-master models --setup` for the first time.

2.  **Environment Variables (`.env` / `mcp.json`):**
    *   Used **only** for sensitive API keys and specific endpoint URLs.
    *   Place API keys (one per provider) in a `.env` file in the project root for CLI usage.
    *   For MCP/Cursor integration, configure these keys in the `env` section of `.cursor/mcp.json`.
    *   Available keys/variables: See `assets/env.example` or the Configuration section in the command reference (previously linked to `taskmaster.mdc`).

**Important:** Non-API key settings (like model selections, `MAX_TOKENS`, `TASKMASTER_LOG_LEVEL`) are **no longer configured via environment variables**. Use the `task-master models` command (or `--setup` for interactive configuration) or the `models` MCP tool.
**If AI commands FAIL in MCP** verify that the API key for the selected provider is present in the `env` section of `.cursor/mcp.json`.
**If AI commands FAIL in CLI** verify that the API key for the selected provider is present in the `.env` file in the root of the project.

## Determining the Next Task

- Run `next_task` / `task-master next` to show the next task to work on.
- The command identifies tasks with all dependencies satisfied
- Tasks are prioritized by priority level, dependency count, and ID
- The command shows comprehensive task information including:
    - Basic task details and description
    - Implementation details
    - Subtasks (if they exist)
    - Contextual suggested actions
- Recommended before starting any new development work
- Respects your project's dependency structure
- Ensures tasks are completed in the appropriate sequence
- Provides ready-to-use commands for common task actions

## Viewing Specific Task Details

- Run `get_task` / `task-master show <id>` to view a specific task.
- Use dot notation for subtasks: `task-master show 1.2` (shows subtask 2 of task 1)
- Displays comprehensive information similar to the next command, but for a specific task
- For parent tasks, shows all subtasks and their current status
- For subtasks, shows parent task information and relationship
- Provides contextual suggested actions appropriate for the specific task
- Useful for examining task details before implementation or checking status

## Managing Task Dependencies

- Use `add_dependency` / `task-master add-dependency --id=<id> --depends-on=<id>` to add a dependency.
- Use `remove_dependency` / `task-master remove-dependency --id=<id> --depends-on=<id>` to remove a dependency.
- The system prevents circular dependencies and duplicate dependency entries
- Dependencies are checked for existence before being added or removed
- Task files are automatically regenerated after dependency changes
- Dependencies are visualized with status indicators in task listings and files

## Task Reorganization

- Use `move_task` / `task-master move --from=<id> --to=<id>` to move tasks or subtasks within the hierarchy
- This command supports several use cases:
  - Moving a standalone task to become a subtask (e.g., `--from=5 --to=7`)
  - Moving a subtask to become a standalone task (e.g., `--from=5.2 --to=7`) 
  - Moving a subtask to a different parent (e.g., `--from=5.2 --to=7.3`)
  - Reordering subtasks within the same parent (e.g., `--from=5.2 --to=5.4`)
  - Moving a task to a new, non-existent ID position (e.g., `--from=5 --to=25`)
  - Moving multiple tasks at once using comma-separated IDs (e.g., `--from=10,11,12 --to=16,17,18`)
- The system includes validation to prevent data loss:
  - Allows moving to non-existent IDs by creating placeholder tasks
  - Prevents moving to existing task IDs that have content (to avoid overwriting)
  - Validates source tasks exist before attempting to move them
- The system maintains proper parent-child relationships and dependency integrity
- Task files are automatically regenerated after the move operation
- This provides greater flexibility in organizing and refining your task structure as project understanding evolves
- This is especially useful when dealing with potential merge conflicts arising from teams creating tasks on separate branches. Solve these conflicts very easily by moving your tasks and keeping theirs.

## Iterative Subtask Implementation

Once a task has been broken down into subtasks using `expand_task` or similar methods, follow this iterative process for implementation:

1.  **Understand the Goal (Preparation):**
    *   Use `get_task` / `task-master show <subtaskId>` (see [`taskmaster.mdc`](mdc:.cursor/rules/taskmaster.mdc)) to thoroughly understand the specific goals and requirements of the subtask.

2.  **Initial Exploration & Planning (Iteration 1):**
    *   This is the first attempt at creating a concrete implementation plan.
    *   Explore the codebase to identify the precise files, functions, and even specific lines of code that will need modification.
    *   Determine the intended code changes (diffs) and their locations.
    *   Gather *all* relevant details from this exploration phase.

3.  **Log the Plan:**
    *   Run `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='<detailed plan>'`.
    *   Provide the *complete and detailed* findings from the exploration phase in the prompt. Include file paths, line numbers, proposed diffs, reasoning, and any potential challenges identified. Do not omit details. The goal is to create a rich, timestamped log within the subtask's `details`.

4.  **Verify the Plan:**
    *   Run `get_task` / `task-master show <subtaskId>` again to confirm that the detailed implementation plan has been successfully appended to the subtask's details.

5.  **Begin Implementation:**
    *   Set the subtask status using `set_task_status` / `task-master set-status --id=<subtaskId> --status=in-progress`.
    *   Start coding based on the logged plan.

6.  **Refine and Log Progress (Iteration 2+):**
    *   As implementation progresses, you will encounter challenges, discover nuances, or confirm successful approaches.
    *   **Before appending new information**: Briefly review the *existing* details logged in the subtask (using `get_task` or recalling from context) to ensure the update adds fresh insights and avoids redundancy.
    *   **Regularly** use `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='<update details>\n- What worked...\n- What didn't work...'` to append new findings.
    *   **Crucially, log:**
        *   What worked ("fundamental truths" discovered).
        *   What didn't work and why (to avoid repeating mistakes).
        *   Specific code snippets or configurations that were successful.
        *   Decisions made, especially if confirmed with user input.
        *   Any deviations from the initial plan and the reasoning.
    *   The objective is to continuously enrich the subtask's details, creating a log of the implementation journey that helps the AI (and human developers) learn, adapt, and avoid repeating errors.

7.  **Review & Update Rules (Post-Implementation):**
    *   Once the implementation for the subtask is functionally complete, review all code changes and the relevant chat history.
    *   Identify any new or modified code patterns, conventions, or best practices established during the implementation.
    *   Create new or update existing rules following internal guidelines (previously linked to `cursor_rules.mdc` and `self_improve.mdc`).

8.  **Mark Task Complete:**
    *   After verifying the implementation and updating any necessary rules, mark the subtask as completed: `set_task_status` / `task-master set-status --id=<subtaskId> --status=done`.

9.  **Commit Changes (If using Git):**
    *   Stage the relevant code changes and any updated/new rule files (`git add .`).
    *   Craft a comprehensive Git commit message summarizing the work done for the subtask, including both code implementation and any rule adjustments.
    *   Execute the commit command directly in the terminal (e.g., `git commit -m 'feat(module): Implement feature X for subtask <subtaskId>\n\n- Details about changes...\n- Updated rule Y for pattern Z'`).
    *   Consider if a Changeset is needed according to internal versioning guidelines (previously linked to `changeset.mdc`). If so, run `npm run changeset`, stage the generated file, and amend the commit or create a new one.

10. **Proceed to Next Subtask:**
    *   Identify the next subtask (e.g., using `next_task` / `task-master next`).

## Code Analysis & Refactoring Techniques

- **Top-Level Function Search**:
    - Useful for understanding module structure or planning refactors.
    - Use grep/ripgrep to find exported functions/constants:
      `rg "export (async function|function|const) \w+"` or similar patterns.
    - Can help compare functions between files during migrations or identify potential naming conflicts.

---
*This workflow provides a general guideline. Adapt it based on your specific project needs and team practices.*


# self_improve

---
description: Guidelines for continuously improving Cursor rules based on emerging code patterns and best practices.
globs: **/*
alwaysApply: true
---

- **Rule Improvement Triggers:**
  - New code patterns not covered by existing rules
  - Repeated similar implementations across files
  - Common error patterns that could be prevented
  - New libraries or tools being used consistently
  - Emerging best practices in the codebase

- **Analysis Process:**
  - Compare new code with existing rules
  - Identify patterns that should be standardized
  - Look for references to external documentation
  - Check for consistent error handling patterns
  - Monitor test patterns and coverage

- **Rule Updates:**
  - **Add New Rules When:**
    - A new technology/pattern is used in 3+ files
    - Common bugs could be prevented by a rule
    - Code reviews repeatedly mention the same feedback
    - New security or performance patterns emerge

  - **Modify Existing Rules When:**
    - Better examples exist in the codebase
    - Additional edge cases are discovered
    - Related rules have been updated
    - Implementation details have changed

- **Example Pattern Recognition:**
  ```typescript
  // If you see repeated patterns like:
  const data = await prisma.user.findMany({
    select: { id: true, email: true },
    where: { status: 'ACTIVE' }
  });
  
  // Consider adding to [prisma.mdc](mdc:.cursor/rules/prisma.mdc):
  // - Standard select fields
  // - Common where conditions
  // - Performance optimization patterns
  ```

- **Rule Quality Checks:**
  - Rules should be actionable and specific
  - Examples should come from actual code
  - References should be up to date
  - Patterns should be consistently enforced

- **Continuous Improvement:**
  - Monitor code review comments
  - Track common development questions
  - Update rules after major refactors
  - Add links to relevant documentation
  - Cross-reference related rules

- **Rule Deprecation:**
  - Mark outdated patterns as deprecated
  - Remove rules that no longer apply
  - Update references to deprecated rules
  - Document migration paths for old patterns

- **Documentation Updates:**
  - Keep examples synchronized with code
  - Update references to external docs
  - Maintain links between related rules
  - Document breaking changes
Follow [cursor_rules.mdc](mdc:.cursor/rules/cursor_rules.mdc) for proper rule formatting and structure.


# taskmaster

---
description: Comprehensive reference for Taskmaster MCP tools and CLI commands.
globs: **/*
alwaysApply: true
---
# Taskmaster Tool & Command Reference

This document provides a detailed reference for interacting with Taskmaster, covering both the recommended MCP tools, suitable for integrations like Cursor, and the corresponding `task-master` CLI commands, designed for direct user interaction or fallback.

**Note:** For interacting with Taskmaster programmatically or via integrated tools, using the **MCP tools is strongly recommended** due to better performance, structured data, and error handling. The CLI commands serve as a user-friendly alternative and fallback. 

**Important:** Several MCP tools involve AI processing... The AI-powered tools include `parse_prd`, `analyze_project_complexity`, `update_subtask`, `update_task`, `update`, `expand_all`, `expand_task`, and `add_task`.

---

## Initialization & Setup

### 1. Initialize Project (`init`)

*   **MCP Tool:** `initialize_project`
*   **CLI Command:** `task-master init [options]`
*   **Description:** `Set up the basic Taskmaster file structure and configuration in the current directory for a new project.`
*   **Key CLI Options:**
    *   `--name <name>`: `Set the name for your project in Taskmaster's configuration.`
    *   `--description <text>`: `Provide a brief description for your project.`
    *   `--version <version>`: `Set the initial version for your project, e.g., '0.1.0'.`
    *   `-y, --yes`: `Initialize Taskmaster quickly using default settings without interactive prompts.`
*   **Usage:** Run this once at the beginning of a new project.
*   **MCP Variant Description:** `Set up the basic Taskmaster file structure and configuration in the current directory for a new project by running the 'task-master init' command.`
*   **Key MCP Parameters/Options:**
    *   `projectName`: `Set the name for your project.` (CLI: `--name <name>`)
    *   `projectDescription`: `Provide a brief description for your project.` (CLI: `--description <text>`)
    *   `projectVersion`: `Set the initial version for your project, e.g., '0.1.0'.` (CLI: `--version <version>`)
    *   `authorName`: `Author name.` (CLI: `--author <author>`)
    *   `skipInstall`: `Skip installing dependencies. Default is false.` (CLI: `--skip-install`)
    *   `addAliases`: `Add shell aliases tm and taskmaster. Default is false.` (CLI: `--aliases`)
    *   `yes`: `Skip prompts and use defaults/provided arguments. Default is false.` (CLI: `-y, --yes`)
*   **Usage:** Run this once at the beginning of a new project, typically via an integrated tool like Cursor. Operates on the current working directory of the MCP server. 
*   **Important:** Once complete, you *MUST* parse a prd in order to generate tasks. There will be no tasks files until then. The next step after initializing should be to create a PRD using the example PRD in .taskmaster/templates/example_prd.txt. 

### 2. Parse PRD (`parse_prd`)

*   **MCP Tool:** `parse_prd`
*   **CLI Command:** `task-master parse-prd [file] [options]`
*   **Description:** `Parse a Product Requirements Document, PRD, or text file with Taskmaster to automatically generate an initial set of tasks in tasks.json.`
*   **Key Parameters/Options:**
    *   `input`: `Path to your PRD or requirements text file that Taskmaster should parse for tasks.` (CLI: `[file]` positional or `-i, --input <file>`)
    *   `output`: `Specify where Taskmaster should save the generated 'tasks.json' file. Defaults to '.taskmaster/tasks/tasks.json'.` (CLI: `-o, --output <file>`)
    *   `numTasks`: `Approximate number of top-level tasks Taskmaster should aim to generate from the document.` (CLI: `-n, --num-tasks <number>`)
    *   `force`: `Use this to allow Taskmaster to overwrite an existing 'tasks.json' without asking for confirmation.` (CLI: `-f, --force`)
*   **Usage:** Useful for bootstrapping a project from an existing requirements document.
*   **Notes:** Task Master will strictly adhere to any specific requirements mentioned in the PRD, such as libraries, database schemas, frameworks, tech stacks, etc., while filling in any gaps where the PRD isn't fully specified. Tasks are designed to provide the most direct implementation path while avoiding over-engineering.
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress. If the user does not have a PRD, suggest discussing their idea and then use the example PRD in `.taskmaster/templates/example_prd.txt` as a template for creating the PRD based on their idea, for use with `parse-prd`.

---

## AI Model Configuration

### 2. Manage Models (`models`)
*   **MCP Tool:** `models`
*   **CLI Command:** `task-master models [options]`
*   **Description:** `View the current AI model configuration or set specific models for different roles (main, research, fallback). Allows setting custom model IDs for Ollama and OpenRouter.`
*   **Key MCP Parameters/Options:**
    *   `setMain <model_id>`: `Set the primary model ID for task generation/updates.` (CLI: `--set-main <model_id>`)
    *   `setResearch <model_id>`: `Set the model ID for research-backed operations.` (CLI: `--set-research <model_id>`)
    *   `setFallback <model_id>`: `Set the model ID to use if the primary fails.` (CLI: `--set-fallback <model_id>`)
    *   `ollama <boolean>`: `Indicates the set model ID is a custom Ollama model.` (CLI: `--ollama`)
    *   `openrouter <boolean>`: `Indicates the set model ID is a custom OpenRouter model.` (CLI: `--openrouter`)
    *   `listAvailableModels <boolean>`: `If true, lists available models not currently assigned to a role.` (CLI: No direct equivalent; CLI lists available automatically)
    *   `projectRoot <string>`: `Optional. Absolute path to the project root directory.` (CLI: Determined automatically)
*   **Key CLI Options:**
    *   `--set-main <model_id>`: `Set the primary model.`
    *   `--set-research <model_id>`: `Set the research model.`
    *   `--set-fallback <model_id>`: `Set the fallback model.`
    *   `--ollama`: `Specify that the provided model ID is for Ollama (use with --set-*).`
    *   `--openrouter`: `Specify that the provided model ID is for OpenRouter (use with --set-*). Validates against OpenRouter API.`
    *   `--setup`: `Run interactive setup to configure models, including custom Ollama/OpenRouter IDs.`
*   **Usage (MCP):** Call without set flags to get current config. Use `setMain`, `setResearch`, or `setFallback` with a valid model ID to update the configuration. Use `listAvailableModels: true` to get a list of unassigned models. To set a custom model, provide the model ID and set `ollama: true` or `openrouter: true`.
*   **Usage (CLI):** Run without flags to view current configuration and available models. Use set flags to update specific roles. Use `--setup` for guided configuration, including custom models. To set a custom model via flags, use `--set-<role>=<model_id>` along with either `--ollama` or `--openrouter`.
*   **Notes:** Configuration is stored in `.taskmaster/config.json` in the project root. This command/tool modifies that file. Use `listAvailableModels` or `task-master models` to see internally supported models. OpenRouter custom models are validated against their live API. Ollama custom models are not validated live.
*   **API note:** API keys for selected AI providers (based on their model) need to exist in the mcp.json file to be accessible in MCP context. The API keys must be present in the local .env file for the CLI to be able to read them.
*   **Model costs:** The costs in supported models are expressed in dollars. An input/output value of 3 is $3.00. A value of 0.8 is $0.80. 
*   **Warning:** DO NOT MANUALLY EDIT THE .taskmaster/config.json FILE. Use the included commands either in the MCP or CLI format as needed. Always prioritize MCP tools when available and use the CLI as a fallback.

---

## Task Listing & Viewing

### 3. Get Tasks (`get_tasks`)

*   **MCP Tool:** `get_tasks`
*   **CLI Command:** `task-master list [options]`
*   **Description:** `List your Taskmaster tasks, optionally filtering by status and showing subtasks.`
*   **Key Parameters/Options:**
    *   `status`: `Show only Taskmaster tasks matching this status, e.g., 'pending' or 'done'.` (CLI: `-s, --status <status>`)
    *   `withSubtasks`: `Include subtasks indented under their parent tasks in the list.` (CLI: `--with-subtasks`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Get an overview of the project status, often used at the start of a work session.

### 4. Get Next Task (`next_task`)

*   **MCP Tool:** `next_task`
*   **CLI Command:** `task-master next [options]`
*   **Description:** `Ask Taskmaster to show the next available task you can work on, based on status and completed dependencies.`
*   **Key Parameters/Options:**
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Identify what to work on next according to the plan.

### 5. Get Task Details (`get_task`)

*   **MCP Tool:** `get_task`
*   **CLI Command:** `task-master show [id] [options]`
*   **Description:** `Display detailed information for a specific Taskmaster task or subtask by its ID.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The ID of the Taskmaster task, e.g., '15', or subtask, e.g., '15.2', you want to view.` (CLI: `[id]` positional or `-i, --id <id>`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Understand the full details, implementation notes, and test strategy for a specific task before starting work.

---

## Task Creation & Modification

### 6. Add Task (`add_task`)

*   **MCP Tool:** `add_task`
*   **CLI Command:** `task-master add-task [options]`
*   **Description:** `Add a new task to Taskmaster by describing it; AI will structure it.`
*   **Key Parameters/Options:**
    *   `prompt`: `Required. Describe the new task you want Taskmaster to create, e.g., "Implement user authentication using JWT".` (CLI: `-p, --prompt <text>`)
    *   `dependencies`: `Specify the IDs of any Taskmaster tasks that must be completed before this new one can start, e.g., '12,14'.` (CLI: `-d, --dependencies <ids>`)
    *   `priority`: `Set the priority for the new task: 'high', 'medium', or 'low'. Default is 'medium'.` (CLI: `--priority <priority>`)
    *   `research`: `Enable Taskmaster to use the research role for potentially more informed task creation.` (CLI: `-r, --research`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Quickly add newly identified tasks during development.
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.

### 7. Add Subtask (`add_subtask`)

*   **MCP Tool:** `add_subtask`
*   **CLI Command:** `task-master add-subtask [options]`
*   **Description:** `Add a new subtask to a Taskmaster parent task, or convert an existing task into a subtask.`
*   **Key Parameters/Options:**
    *   `id` / `parent`: `Required. The ID of the Taskmaster task that will be the parent.` (MCP: `id`, CLI: `-p, --parent <id>`)
    *   `taskId`: `Use this if you want to convert an existing top-level Taskmaster task into a subtask of the specified parent.` (CLI: `-i, --task-id <id>`)
    *   `title`: `Required if not using taskId. The title for the new subtask Taskmaster should create.` (CLI: `-t, --title <title>`)
    *   `description`: `A brief description for the new subtask.` (CLI: `-d, --description <text>`)
    *   `details`: `Provide implementation notes or details for the new subtask.` (CLI: `--details <text>`)
    *   `dependencies`: `Specify IDs of other tasks or subtasks, e.g., '15' or '16.1', that must be done before this new subtask.` (CLI: `--dependencies <ids>`)
    *   `status`: `Set the initial status for the new subtask. Default is 'pending'.` (CLI: `-s, --status <status>`)
    *   `skipGenerate`: `Prevent Taskmaster from automatically regenerating markdown task files after adding the subtask.` (CLI: `--skip-generate`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Break down tasks manually or reorganize existing tasks.

### 8. Update Tasks (`update`)

*   **MCP Tool:** `update`
*   **CLI Command:** `task-master update [options]`
*   **Description:** `Update multiple upcoming tasks in Taskmaster based on new context or changes, starting from a specific task ID.`
*   **Key Parameters/Options:**
    *   `from`: `Required. The ID of the first task Taskmaster should update. All tasks with this ID or higher that are not 'done' will be considered.` (CLI: `--from <id>`)
    *   `prompt`: `Required. Explain the change or new context for Taskmaster to apply to the tasks, e.g., "We are now using React Query instead of Redux Toolkit for data fetching".` (CLI: `-p, --prompt <text>`)
    *   `research`: `Enable Taskmaster to use the research role for more informed updates. Requires appropriate API key.` (CLI: `-r, --research`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Handle significant implementation changes or pivots that affect multiple future tasks. Example CLI: `task-master update --from='18' --prompt='Switching to React Query.\nNeed to refactor data fetching...'`
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.

### 9. Update Task (`update_task`)

*   **MCP Tool:** `update_task`
*   **CLI Command:** `task-master update-task [options]`
*   **Description:** `Modify a specific Taskmaster task or subtask by its ID, incorporating new information or changes.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The specific ID of the Taskmaster task, e.g., '15', or subtask, e.g., '15.2', you want to update.` (CLI: `-i, --id <id>`)
    *   `prompt`: `Required. Explain the specific changes or provide the new information Taskmaster should incorporate into this task.` (CLI: `-p, --prompt <text>`)
    *   `research`: `Enable Taskmaster to use the research role for more informed updates. Requires appropriate API key.` (CLI: `-r, --research`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Refine a specific task based on new understanding or feedback. Example CLI: `task-master update-task --id='15' --prompt='Clarification: Use PostgreSQL instead of MySQL.\nUpdate schema details...'`
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.

### 10. Update Subtask (`update_subtask`)

*   **MCP Tool:** `update_subtask`
*   **CLI Command:** `task-master update-subtask [options]`
*   **Description:** `Append timestamped notes or details to a specific Taskmaster subtask without overwriting existing content. Intended for iterative implementation logging.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The specific ID of the Taskmaster subtask, e.g., '15.2', you want to add information to.` (CLI: `-i, --id <id>`)
    *   `prompt`: `Required. Provide the information or notes Taskmaster should append to the subtask's details. Ensure this adds *new* information not already present.` (CLI: `-p, --prompt <text>`)
    *   `research`: `Enable Taskmaster to use the research role for more informed updates. Requires appropriate API key.` (CLI: `-r, --research`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Add implementation notes, code snippets, or clarifications to a subtask during development. Before calling, review the subtask's current details to append only fresh insights, helping to build a detailed log of the implementation journey and avoid redundancy. Example CLI: `task-master update-subtask --id='15.2' --prompt='Discovered that the API requires header X.\nImplementation needs adjustment...'`
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.

### 11. Set Task Status (`set_task_status`)

*   **MCP Tool:** `set_task_status`
*   **CLI Command:** `task-master set-status [options]`
*   **Description:** `Update the status of one or more Taskmaster tasks or subtasks, e.g., 'pending', 'in-progress', 'done'.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The ID(s) of the Taskmaster task(s) or subtask(s), e.g., '15', '15.2', or '16,17.1', to update.` (CLI: `-i, --id <id>`)
    *   `status`: `Required. The new status to set, e.g., 'done', 'pending', 'in-progress', 'review', 'cancelled'.` (CLI: `-s, --status <status>`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Mark progress as tasks move through the development cycle.

### 12. Remove Task (`remove_task`)

*   **MCP Tool:** `remove_task`
*   **CLI Command:** `task-master remove-task [options]`
*   **Description:** `Permanently remove a task or subtask from the Taskmaster tasks list.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The ID of the Taskmaster task, e.g., '5', or subtask, e.g., '5.2', to permanently remove.` (CLI: `-i, --id <id>`)
    *   `yes`: `Skip the confirmation prompt and immediately delete the task.` (CLI: `-y, --yes`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Permanently delete tasks or subtasks that are no longer needed in the project.
*   **Notes:** Use with caution as this operation cannot be undone. Consider using 'blocked', 'cancelled', or 'deferred' status instead if you just want to exclude a task from active planning but keep it for reference. The command automatically cleans up dependency references in other tasks.

---

## Task Structure & Breakdown

### 13. Expand Task (`expand_task`)

*   **MCP Tool:** `expand_task`
*   **CLI Command:** `task-master expand [options]`
*   **Description:** `Use Taskmaster's AI to break down a complex task into smaller, manageable subtasks. Appends subtasks by default.`
*   **Key Parameters/Options:**
    *   `id`: `The ID of the specific Taskmaster task you want to break down into subtasks.` (CLI: `-i, --id <id>`)
    *   `num`: `Optional: Suggests how many subtasks Taskmaster should aim to create. Uses complexity analysis/defaults otherwise.` (CLI: `-n, --num <number>`)
    *   `research`: `Enable Taskmaster to use the research role for more informed subtask generation. Requires appropriate API key.` (CLI: `-r, --research`)
    *   `prompt`: `Optional: Provide extra context or specific instructions to Taskmaster for generating the subtasks.` (CLI: `-p, --prompt <text>`)
    *   `force`: `Optional: If true, clear existing subtasks before generating new ones. Default is false (append).` (CLI: `--force`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Generate a detailed implementation plan for a complex task before starting coding. Automatically uses complexity report recommendations if available and `num` is not specified.
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.

### 14. Expand All Tasks (`expand_all`)

*   **MCP Tool:** `expand_all`
*   **CLI Command:** `task-master expand --all [options]` (Note: CLI uses the `expand` command with the `--all` flag)
*   **Description:** `Tell Taskmaster to automatically expand all eligible pending/in-progress tasks based on complexity analysis or defaults. Appends subtasks by default.`
*   **Key Parameters/Options:**
    *   `num`: `Optional: Suggests how many subtasks Taskmaster should aim to create per task.` (CLI: `-n, --num <number>`)
    *   `research`: `Enable research role for more informed subtask generation. Requires appropriate API key.` (CLI: `-r, --research`)
    *   `prompt`: `Optional: Provide extra context for Taskmaster to apply generally during expansion.` (CLI: `-p, --prompt <text>`)
    *   `force`: `Optional: If true, clear existing subtasks before generating new ones for each eligible task. Default is false (append).` (CLI: `--force`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Useful after initial task generation or complexity analysis to break down multiple tasks at once.
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.

### 15. Clear Subtasks (`clear_subtasks`)

*   **MCP Tool:** `clear_subtasks`
*   **CLI Command:** `task-master clear-subtasks [options]`
*   **Description:** `Remove all subtasks from one or more specified Taskmaster parent tasks.`
*   **Key Parameters/Options:**
    *   `id`: `The ID(s) of the Taskmaster parent task(s) whose subtasks you want to remove, e.g., '15' or '16,18'. Required unless using `all`.) (CLI: `-i, --id <ids>`)
    *   `all`: `Tell Taskmaster to remove subtasks from all parent tasks.` (CLI: `--all`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Used before regenerating subtasks with `expand_task` if the previous breakdown needs replacement.

### 16. Remove Subtask (`remove_subtask`)

*   **MCP Tool:** `remove_subtask`
*   **CLI Command:** `task-master remove-subtask [options]`
*   **Description:** `Remove a subtask from its Taskmaster parent, optionally converting it into a standalone task.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The ID(s) of the Taskmaster subtask(s) to remove, e.g., '15.2' or '16.1,16.3'.` (CLI: `-i, --id <id>`)
    *   `convert`: `If used, Taskmaster will turn the subtask into a regular top-level task instead of deleting it.` (CLI: `-c, --convert`)
    *   `skipGenerate`: `Prevent Taskmaster from automatically regenerating markdown task files after removing the subtask.` (CLI: `--skip-generate`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Delete unnecessary subtasks or promote a subtask to a top-level task.

### 17. Move Task (`move_task`)

*   **MCP Tool:** `move_task`
*   **CLI Command:** `task-master move [options]`
*   **Description:** `Move a task or subtask to a new position within the task hierarchy.`
*   **Key Parameters/Options:**
    *   `from`: `Required. ID of the task/subtask to move (e.g., "5" or "5.2"). Can be comma-separated for multiple tasks.` (CLI: `--from <id>`)
    *   `to`: `Required. ID of the destination (e.g., "7" or "7.3"). Must match the number of source IDs if comma-separated.` (CLI: `--to <id>`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Reorganize tasks by moving them within the hierarchy. Supports various scenarios like:
    *   Moving a task to become a subtask
    *   Moving a subtask to become a standalone task
    *   Moving a subtask to a different parent
    *   Reordering subtasks within the same parent
    *   Moving a task to a new, non-existent ID (automatically creates placeholders)
    *   Moving multiple tasks at once with comma-separated IDs
*   **Validation Features:**
    *   Allows moving tasks to non-existent destination IDs (creates placeholder tasks)
    *   Prevents moving to existing task IDs that already have content (to avoid overwriting)
    *   Validates that source tasks exist before attempting to move them
    *   Maintains proper parent-child relationships
*   **Example CLI:** `task-master move --from=5.2 --to=7.3` to move subtask 5.2 to become subtask 7.3.
*   **Example Multi-Move:** `task-master move --from=10,11,12 --to=16,17,18` to move multiple tasks to new positions.
*   **Common Use:** Resolving merge conflicts in tasks.json when multiple team members create tasks on different branches.

---

## Dependency Management

### 18. Add Dependency (`add_dependency`)

*   **MCP Tool:** `add_dependency`
*   **CLI Command:** `task-master add-dependency [options]`
*   **Description:** `Define a dependency in Taskmaster, making one task a prerequisite for another.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The ID of the Taskmaster task that will depend on another.` (CLI: `-i, --id <id>`)
    *   `dependsOn`: `Required. The ID of the Taskmaster task that must be completed first, the prerequisite.` (CLI: `-d, --depends-on <id>`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <path>`)
*   **Usage:** Establish the correct order of execution between tasks.

### 19. Remove Dependency (`remove_dependency`)

*   **MCP Tool:** `remove_dependency`
*   **CLI Command:** `task-master remove-dependency [options]`
*   **Description:** `Remove a dependency relationship between two Taskmaster tasks.`
*   **Key Parameters/Options:**
    *   `id`: `Required. The ID of the Taskmaster task you want to remove a prerequisite from.` (CLI: `-i, --id <id>`)
    *   `dependsOn`: `Required. The ID of the Taskmaster task that should no longer be a prerequisite.` (CLI: `-d, --depends-on <id>`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Update task relationships when the order of execution changes.

### 20. Validate Dependencies (`validate_dependencies`)

*   **MCP Tool:** `validate_dependencies`
*   **CLI Command:** `task-master validate-dependencies [options]`
*   **Description:** `Check your Taskmaster tasks for dependency issues (like circular references or links to non-existent tasks) without making changes.`
*   **Key Parameters/Options:**
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Audit the integrity of your task dependencies.

### 21. Fix Dependencies (`fix_dependencies`)

*   **MCP Tool:** `fix_dependencies`
*   **CLI Command:** `task-master fix-dependencies [options]`
*   **Description:** `Automatically fix dependency issues (like circular references or links to non-existent tasks) in your Taskmaster tasks.`
*   **Key Parameters/Options:**
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Clean up dependency errors automatically.

---

## Analysis & Reporting

### 22. Analyze Project Complexity (`analyze_project_complexity`)

*   **MCP Tool:** `analyze_project_complexity`
*   **CLI Command:** `task-master analyze-complexity [options]`
*   **Description:** `Have Taskmaster analyze your tasks to determine their complexity and suggest which ones need to be broken down further.`
*   **Key Parameters/Options:**
    *   `output`: `Where to save the complexity analysis report (default: '.taskmaster/reports/task-complexity-report.json').` (CLI: `-o, --output <file>`)
    *   `threshold`: `The minimum complexity score (1-10) that should trigger a recommendation to expand a task.` (CLI: `-t, --threshold <number>`)
    *   `research`: `Enable research role for more accurate complexity analysis. Requires appropriate API key.` (CLI: `-r, --research`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Used before breaking down tasks to identify which ones need the most attention.
*   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.

### 23. View Complexity Report (`complexity_report`)

*   **MCP Tool:** `complexity_report`
*   **CLI Command:** `task-master complexity-report [options]`
*   **Description:** `Display the task complexity analysis report in a readable format.`
*   **Key Parameters/Options:**
    *   `file`: `Path to the complexity report (default: '.taskmaster/reports/task-complexity-report.json').` (CLI: `-f, --file <file>`)
*   **Usage:** Review and understand the complexity analysis results after running analyze-complexity.

---

## File Management

### 24. Generate Task Files (`generate`)

*   **MCP Tool:** `generate`
*   **CLI Command:** `task-master generate [options]`
*   **Description:** `Create or update individual Markdown files for each task based on your tasks.json.`
*   **Key Parameters/Options:**
    *   `output`: `The directory where Taskmaster should save the task files (default: in a 'tasks' directory).` (CLI: `-o, --output <directory>`)
    *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
*   **Usage:** Run this after making changes to tasks.json to keep individual task files up to date.

---

## Environment Variables Configuration (Updated)

Taskmaster primarily uses the **`.taskmaster/config.json`** file (in project root) for configuration (models, parameters, logging level, etc.), managed via `task-master models --setup`.

Environment variables are used **only** for sensitive API keys related to AI providers and specific overrides like the Ollama base URL:

*   **API Keys (Required for corresponding provider):**
    *   `ANTHROPIC_API_KEY`
    *   `PERPLEXITY_API_KEY`
    *   `OPENAI_API_KEY`
    *   `GOOGLE_API_KEY`
    *   `MISTRAL_API_KEY`
    *   `AZURE_OPENAI_API_KEY` (Requires `AZURE_OPENAI_ENDPOINT` too)
    *   `OPENROUTER_API_KEY`
    *   `XAI_API_KEY`
    *   `OLLAMA_API_KEY` (Requires `OLLAMA_BASE_URL` too)
*   **Endpoints (Optional/Provider Specific inside .taskmaster/config.json):**
    *   `AZURE_OPENAI_ENDPOINT`
    *   `OLLAMA_BASE_URL` (Default: `http://localhost:11434/api`)

**Set API keys** in your **`.env`** file in the project root (for CLI use) or within the `env` section of your **`.cursor/mcp.json`** file (for MCP/Cursor integration). All other settings (model choice, max tokens, temperature, log level, custom endpoints) are managed in `.taskmaster/config.json` via `task-master models` command or `models` MCP tool.

---

For details on how these commands fit into the development process, see the [Development Workflow Guide](mdc:.cursor/rules/dev_workflow.mdc).
