# TODO: Refactor to Object-Oriented Design

## Overview

The current codebase is primarily functional/procedural with standalone functions. Introducing object-oriented design (OOD) principles can improve modularity, encapsulation, and maintainability by grouping related functionality into classes, reducing global state, and making the code more extensible.

## Identified Improvements

- **Encapsulation**: Bundle related functions and data into classes (e.g., Parser class for parsing logic).
- **Abstraction**: Use interfaces and abstract classes where appropriate (logging already uses an interface, which is good).
- **Modularity**: Separate concerns into cohesive classes, reducing interdependencies.
- **Testability**: Classes can be mocked/injected more easily for unit testing.
- **Reusability**: Class instances can maintain state (e.g., a Parser with configuration).

## Tasks

### 1. Refactor Parser Module into Parser Class

- **Description**: Convert `src/parsing/parser.ts` functions into a `Parser` class.
- **Details**:
  - Create a `Parser` class with methods like `parseComponentFromSourceFile`, `parseComponent`.
  - Move internal helper functions (e.g., `getMemberName`, `resolveTypeForNode`) as private methods.
  - Inject dependencies like `TypeChecker` via constructor or method parameters.
  - Update `src/parsing/parser.spec.ts` to test the class instance.
- **Benefits**: Encapsulates parsing logic, allows for multiple parser instances with different configurations.
- **Files to Modify**: `src/parsing/parser.ts`, `src/parsing/parser.spec.ts`, `src/generator/generator.ts` (update imports/calls).
- **Status**: ✅ Completed - Parser class created with backward compatibility.

### 2. Refactor Snippet Module into SnippetGenerator Class

- **Description**: Convert `src/snippets/snippet.ts` functions into a `SnippetGenerator` class.
- **Details**:
  - Create a `SnippetGenerator` class with methods like `createSnippet`, `propertyToAttribute`, `propertyToFunction`.
  - Move constants (e.g., `INDENT`, `FUNCTION_PREFIX`) as class properties or static constants.
  - Make helper functions (e.g., `formatToFunctionName`) private methods.
  - Update `src/snippets/snippet.spec.ts` accordingly.
- **Benefits**: Groups snippet-related logic, easier to extend with new snippet formats.
- **Files to Modify**: `src/snippets/snippet.ts`, `src/snippets/snippet.spec.ts`, `src/generator/generator.ts` (update calls).
- **Status**: ✅ Completed - SnippetGenerator class created with backward compatibility.

### 3. Refactor Generator Module into Generator Class

- **Description**: Convert `src/generator/generator.ts` function into a `Generator` class.
- **Details**:
  - Create a `Generator` class with a method `generateFromFolder`.
  - Inject dependencies like `Logger`, `Parser`, `SnippetGenerator` via constructor (dependency injection).
  - Handle state like `tsconfigPath` and `options` as instance properties.
  - Update `src/generator/generator.logging.spec.ts` to test the class.
- **Benefits**: Allows for generator instances with different configurations, better separation of concerns.
- **Files to Modify**: `src/generator/generator.ts`, `src/generator/generator.logging.spec.ts`, `src/cli.ts` (update instantiation).
- **Status**: ✅ Completed - Generator class created with logger DI and backward compatibility.

### 4. Refactor Utility Modules into Utility Classes

- **Description**: Convert utility functions in `src/utils/` into static methods of utility classes.
- **Details**:
  - Create `FileUtils` class for `files.ts` functions.
  - Create `StringUtils` class for `strings.ts` functions.
  - Make methods static where no state is needed.
  - Update tests in `src/utils/files.spec.ts` and `src/utils/strings.spec.ts`.
- **Benefits**: Organizes utilities logically, prevents namespace pollution.
- **Files to Modify**: `src/utils/files.ts`, `src/utils/strings.ts`, `src/utils/files.spec.ts`, `src/utils/strings.spec.ts`, and all importers.
- **Status**: ✅ Completed - FileUtils and StringUtils classes created with static methods and backward compatibility.

### 5. Update CLI to Use Dependency Injection

- **Description**: Modify `src/cli.ts` to instantiate classes and inject dependencies.
- **Details**:
  - Create instances of `Generator`, `Parser`, `SnippetGenerator`, etc., in CLI.
  - Pass logger and other dependencies.
  - Ensure CLI remains the entry point without business logic.
- **Benefits**: Decouples CLI from implementation details.
- **Files to Modify**: `src/cli.ts`.
- **Status**: ✅ Completed - CLI now instantiates Generator class with logger DI.

### 6. Update Logging to Support OOD (if needed)

- **Description**: Ensure logging interface supports class-based usage.
- **Details**:
  - The current `Logger` interface is already good; verify child loggers work with class instances.
  - Update any direct logger usage in classes.
- **Benefits**: Consistent logging across OO structure.
- **Files to Modify**: `src/logging/logging.ts`, `src/logging/logging.structure.spec.ts`.
- **Status**: ✅ Completed - Logging interface already supports OOD; no changes needed.

### 7. Run Tests and Refactor Tests

- **Description**: After each refactor, run full test suite and update tests for new class structure.
- **Details**:
  - Use `npx jest` to ensure no regressions.
  - Update test files to instantiate classes and test methods.
- **Benefits**: Validates refactors maintain functionality.
- **Files to Modify**: All `.spec.ts` files.
- **Status**: ✅ Completed - All tests updated and passing (32/32).

### 8. Documentation and Code Comments

- **Description**: Add JSDoc comments to classes and methods.
- **Details**:
  - Document class responsibilities, method purposes, parameters, and return types.
  - Update README.md if needed to reflect OO structure.
- **Benefits**: Improves code readability and maintainability.
- **Files to Modify**: All refactored files, README.md.
- **Status**: ✅ Completed - JSDoc added to all new classes and methods.

## Implementation Order

1. ✅ Start with Task 1 (Parser) as it's foundational.
2. ✅ Then Task 2 (SnippetGenerator).
3. ✅ Task 3 (Generator) depends on 1 and 2.
4. ✅ Task 4 (Utilities) can be done in parallel.
5. ✅ Task 5 (CLI) after 3.
6. ✅ Tasks 6-8 throughout.

## Risks and Considerations

- Ensure backward compatibility if the module is used as a library.
- Incremental changes to avoid breaking tests.
- Use TypeScript's class features effectively (e.g., access modifiers).

## Completion Criteria

- ✅ All functions converted to class methods.
- ✅ No global functions outside of entry points (CLI).
- ✅ Tests pass for all refactored components.
- ✅ Code is more modular and easier to extend.
