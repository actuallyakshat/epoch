# SonarQube Primer for Developers

## What is SonarQube?

SonarQube is a continuous code quality inspection platform that automatically analyzes your code to:

- Detect bugs and potential issues before they reach production
- Identify security vulnerabilities
- Enforce code quality standards
- Track technical debt
- Monitor test coverage
- Identify code duplication

Think of it as an automated code reviewer that runs every time you analyze your project.

## Core Concepts

### 1. Quality Gate

A set of conditions that your code must meet to be considered "production-ready."

**Your Status: ✅ PASSED**

- This means your code meets the minimum quality standards
- Even though you passed, you still have 120 issues to address for better code quality

### 2. Issue Severity Levels

From your analysis, you have **120 total issues**:

#### **Blocker (1 issue)** 🔴

- **Critical issues that MUST be fixed immediately**
- Can cause application crashes or data corruption
- Example: Null pointer dereferences, infinite loops

#### **High (22 issues)** 🟠

- **Serious bugs that should be fixed soon**
- High probability of causing problems in production
- Example: Resource leaks, incorrect logic

#### **Medium (45 issues)** 🟡

- **Issues that can lead to bugs under certain conditions**
- Should be addressed in near future
- Example: Confusing code, error handling gaps

#### **Low (50 issues)** 🟢

- **Minor code quality issues**
- Improve maintainability but not urgent
- Example: Unused imports, redundant code

#### **Info (2 issues)** ℹ️

- **Suggestions and best practices**
- Nice-to-haves for cleaner code

### 3. Issue Categories

#### **Security (0 issues - A rating)** ✅

- Vulnerabilities that could be exploited by attackers
- Your code has NO security issues - excellent!
- Examples: SQL injection, XSS, hardcoded credentials

#### **Reliability (9 issues - D rating)** ⚠️

- Bugs and issues that can cause runtime failures
- **This is your weakest area** - focus here first
- Examples: Null pointer exceptions, incorrect error handling

#### **Maintainability (114 issues - A rating)** 🔧

- Code smells that make code harder to understand and modify
- You have many issues but still rated "A" (issues are minor)
- Examples: Complex functions, duplicated code, unused variables

### 4. Code Coverage: 19.4%

**Why is your coverage so low?**

Your test suite only covers **19.4%** of your codebase (2k lines out of 10.3k total lines).

**What you're testing:**

- ✅ Utility functions (`date.ts`, `tree.ts`, `validation.ts`, `logger.ts`)
- ✅ Some services (`taskService`, `timelineService`, `storage`)

**What you're NOT testing (81% of your code):**

- ❌ **All 31 React components** in `src/components/`
- ❌ Context providers in `src/contexts/`
- ❌ Custom hooks in `src/hooks/`
- ❌ Main app entry point (`App.tsx`, `index.tsx`)

**Component breakdown:**

```
src/components/
├── calendar/        (3 components - 0% covered)
│   ├── CalendarPane.tsx
│   ├── DayCell.tsx
│   └── MonthView.tsx
├── tasks/           (4 components - 0% covered)
│   ├── TasksPane.tsx
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   └── TaskHeader.tsx
├── timeline/        (2 components - 0% covered)
│   ├── TimelinePane.tsx
│   └── TimelineEntry.tsx
├── common/          (13 dialogs/components - 0% covered)
└── layout/          (2 components - 0% covered)
```

**To reach 80% coverage, you need to:**

1. Add component tests for React components using Vitest + happy-dom
2. Test user interactions (keyboard shortcuts, clicking, typing)
3. Test component rendering and state changes
4. Add integration tests for workflows (create task → complete task → view timeline)

### 5. Code Duplication: 2.1%

**Excellent!** Only 140 lines (out of 6.6k) are duplicated. Industry standard is < 5%.

## How to Use SonarQube Effectively

### Daily Workflow

1. **Before committing code:**

   ```bash
   pnpm test:coverage  # Run tests and generate coverage
   pnpm sonar          # Upload to SonarQube
   ```

2. **Review your dashboard:**
   - Open: http://localhost:9000/dashboard?id=epoch-local
   - Check if Quality Gate passed
   - Review new issues introduced by your changes

3. **Fix issues by priority:**
   - Start with **Blocker** and **High** severity
   - Focus on **Reliability** issues first (your D rating)
   - Then address **Medium** issues
   - Low/Info issues can be batched together

4. **Track progress:**
   - Set a goal: "Reduce issues from 120 to 80 this sprint"
   - Monitor coverage increase: "Increase coverage from 19% to 40%"

### Understanding Your Current Issues

Based on your screenshots, common issues include:

#### **Maintainability Issues (114):**

1. **Unused imports** (Low severity)

   ```typescript
   // ❌ Bad
   import { Text } from 'ink'; // Text is imported but never used

   // ✅ Fix: Remove unused import
   ```

2. **Unused variables** (Medium severity)

   ```typescript
   // ❌ Bad
   const theme = useTheme(); // Variable assigned but never used

   // ✅ Fix: Remove or use the variable
   ```

3. **Nested ternary operations** (Medium severity)

   ```typescript
   // ❌ Bad - confusing
   const color = isComplete ? 'green' : isDelayed ? 'red' : 'yellow';

   // ✅ Better - clear logic
   const getColor = () => {
     if (isComplete) return 'green';
     if (isDelayed) return 'red';
     return 'yellow';
   };
   ```

4. **Array index as React key** (Medium severity)

   ```typescript
   // ❌ Bad - causes React reconciliation issues
   {tasks.map((task, index) => <TaskItem key={index} task={task} />)}

   // ✅ Good - use unique identifier
   {tasks.map((task) => <TaskItem key={task.id} task={task} />)}
   ```

#### **Reliability Issues (9):**

These are more serious. Common patterns:

- Missing null checks
- Unhandled promise rejections
- Potential division by zero
- Incorrect error handling

### Metrics Explained

#### **Coverage Metrics:**

- **Lines to cover:** 2k lines
- **Uncovered lines:** ~1.6k lines
- **Target:** Aim for 80% minimum (industry standard)
- **Your gap:** Need to cover ~1.2k more lines (61% increase)

#### **Effort Estimates:**

SonarQube estimates time to fix issues:

- **1min effort:** Quick fixes (unused imports)
- **5min effort:** Simple refactoring (extract nested ternary)
- **1d/6h effort:** Larger refactoring or architectural changes

Your total debt: Check "Technical Debt" section for total time estimate

### Best Practices

#### 1. **Fix Issues as You Go**

Don't let issues accumulate. Fix them while the code is fresh in your mind.

#### 2. **Use SonarQube Before Pull Requests**

Run analysis before creating PR to catch issues early.

#### 3. **Set Coverage Goals**

- Minimum: 60% coverage
- Good: 80% coverage
- Excellent: 90%+ coverage

#### 4. **Don't Game the Metrics**

- Don't write tests just to increase coverage numbers
- Write meaningful tests that verify behavior
- Focus on critical paths and edge cases

#### 5. **Review "New Code" Tab**

This shows issues in code you just added - fix these immediately before they get merged.

### SonarQube Dashboard Tour

#### **Main Dashboard:**

- **Quality Gate:** Pass/Fail status
- **Issues:** Total issues by category
- **Coverage:** Test coverage percentage
- **Duplications:** Code duplication percentage
- **Security Hotspots:** Security-sensitive code to review

#### **Issues Tab:**

- Filter by: Severity, Type, Status
- **Bulk Change:** Fix multiple similar issues at once
- **Assign:** Assign issues to team members
- **Tags:** Add tags for tracking (technical-debt, quick-win, etc.)

#### **Measures Tab:**

- Detailed metrics breakdown
- Historical trends
- Code size and complexity metrics

#### **Activity Tab:**

- Analysis history
- Quality Gate history
- Event timeline

### Common Filters

**Finding quick wins:**

1. Go to Issues tab
2. Filter by: **Severity: Low** + **Effort: 1min**
3. Bulk fix all "unused import" issues in one go

**Finding critical issues:**

1. Filter by: **Type: Bug** + **Severity: Blocker/High**
2. Fix these first - they're production risks

### Integration with Development Workflow

#### **Pre-commit:**

```bash
# Add to .husky/pre-commit (optional)
pnpm test:coverage
```

#### **CI/CD Pipeline:**

```bash
# Add to GitHub Actions / GitLab CI
pnpm test:coverage
pnpm sonar
# Fail build if Quality Gate fails
```

#### **IDE Integration:**

- Install SonarLint extension for VSCode
- Get real-time feedback while coding
- See issues before committing

## Action Plan for Your Project

### Immediate (This Week):

1. ✅ Fix the **1 Blocker** issue
2. ✅ Fix all **22 High** severity issues
3. ✅ Fix **9 Reliability** issues (improve D rating to B)
4. ✅ Remove unused imports/variables (quick wins)

### Short Term (This Month):

1. Add component tests for critical components:
   - `TasksPane.tsx`, `TaskList.tsx`, `TaskItem.tsx`
   - `CalendarPane.tsx`
   - `TimelinePane.tsx`
2. Target: **40-50% coverage**
3. Reduce total issues from 120 to < 50

### Long Term (This Quarter):

1. Achieve **80% test coverage**
2. Add integration tests
3. Zero Blocker/High severity issues
4. Maintain < 20 total issues

## Exporting Issues for Coding Agents

You can export all SonarQube issues to feed them to a coding agent (like Claude, ChatGPT, etc.) for automated fixing.

### Export Commands:

```bash
# Export to Markdown (best for reading/sharing)
pnpm sonar:export:md
# Creates: sonar-issues.md

# Export to JSON (best for programmatic processing)
pnpm sonar:export:json
# Creates: sonar-issues.json

# Export to stdout (pipe to other tools)
pnpm sonar:export

# Export only specific severities
node scripts/export-sonar-issues.js --severity=BLOCKER,CRITICAL --format=markdown

# Export only bugs
node scripts/export-sonar-issues.js --type=BUG --format=json
```

### Using Exported Issues with Coding Agents:

**Option 1: Markdown file (recommended for AI chat)**

```bash
pnpm sonar:export:md
# Then paste sonar-issues.md content into your AI chat
```

**Option 2: JSON file (for programmatic processing)**

```bash
pnpm sonar:export:json
# Use the JSON for custom scripts or batch processing
```

**Option 3: Direct paste from terminal**

```bash
pnpm sonar:export | pbcopy  # macOS
pnpm sonar:export | xclip   # Linux
```

### Example Prompt for Coding Agents:

```
I have exported 120 SonarQube issues from my project. Please help me fix them
systematically, starting with BLOCKER and HIGH severity issues.

Here are the issues:
[paste sonar-issues.md content]

Please:
1. Group issues by file and type
2. Fix all issues in order of severity
3. Explain what each fix does
4. Ensure no regressions are introduced
```

### Export File Structure:

**Markdown format** includes:

- Issues grouped by severity (Blocker → Info)
- Sub-grouped by file
- Shows line numbers, effort estimates, and rule IDs
- Includes summary tables

**JSON format** includes:

- Simplified structure for easy parsing
- Each issue has: file, line, message, rule, severity, type, effort
- Perfect for custom automation scripts

## Resources

### Official Documentation:

- SonarQube Docs: https://docs.sonarqube.org/latest/
- Understanding Issues: https://docs.sonarqube.org/latest/user-guide/issues/

### Your SonarQube Instance:

- **Dashboard:** http://localhost:9000/dashboard?id=epoch-local
- **Issues:** http://localhost:9000/project/issues?id=epoch-local
- **Measures:** http://localhost:9000/component_measures?id=epoch-local

### Commands:

```bash
# Run tests with coverage
pnpm test:coverage

# View coverage in browser
open coverage/index.html

# Run SonarQube analysis
pnpm sonar

# Export issues for coding agents
pnpm sonar:export:md    # Markdown format
pnpm sonar:export:json  # JSON format

# Open SonarQube dashboard
open http://localhost:9000/dashboard?id=epoch-local
```

## Key Takeaways

1. **SonarQube is your automated code reviewer** - it catches issues humans miss
2. **19.4% coverage is low** - you need to test your React components
3. **120 issues is manageable** - most are quick fixes (unused imports, etc.)
4. **Your security is excellent** - 0 vulnerabilities is great
5. **Focus on Reliability** - your D rating needs improvement
6. **Set incremental goals** - don't try to fix everything at once
7. **Make it part of your workflow** - run before every PR
8. **Use it to learn** - SonarQube teaches you better coding patterns

## Next Steps

1. **Read this primer** ✅ (you're doing it!)
2. **Explore your dashboard:** http://localhost:9000/dashboard?id=epoch-local
3. **Fix your first issue:** Pick a "Low" severity, "1min effort" issue
4. **Add your first component test:** Start with `TaskItem.tsx`
5. **Make SonarQube part of your routine:** Run `pnpm sonar` before every commit

Happy coding! 🚀
