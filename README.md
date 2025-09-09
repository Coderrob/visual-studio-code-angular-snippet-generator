# Visual Studio Code Angular Snippet Generator

A Visual Studio Code extension that automatically generates code snippets for Angular components based on their TypeScript definitions.

## Features

- Parses Angular component TypeScript files
- Extracts @Input and @Output properties
- Generates VS Code snippets for HTML usage
- Supports type-aware snippet placeholders
- Handles optional properties and EventEmitters

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the TypeScript code
4. Run `npm test` to execute the test suite

## Usage

The extension provides utilities to parse Angular components and generate snippets:

```typescript
import { parseComponent } from './src/parser';
import { createSnippet } from './src/snippet';

const componentCode = `
@Component({
  selector: 'my-component',
  template: '<div></div>'
})
export class MyComponent {
  @Input() title: string;
  @Output() onClick = new EventEmitter<void>();
}
`;

const components = parseComponent(componentCode);
const snippet = createSnippet(components[0]);
```

### CLI

This repository includes a small CLI to generate snippets from a folder.

Generate snippets from a folder:

```bash
# generate snippets from ./src/components and write to snippets.generated.code-snippets
npx ts-node src/cli.ts generate:folder ./src/components --out snippets.generated.code-snippets
```

```

## API

### parseComponent(fileData: string)

Parses a TypeScript file containing Angular components and returns an array of component information.

**Parameters:**

- `fileData` (string): The content of the TypeScript file

**Returns:** `ComponentInfo[] | undefined`

### createSnippet(component: ComponentInfo)

Creates a VS Code snippet definition for an Angular component.

**Parameters:**

- `component` (ComponentInfo): The component information

**Returns:** `Record<string, any>` - The snippet definition

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run compile
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details
