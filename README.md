# @ai-swfactory/mime-types

TypeScript MIME type database and utilities with full type inference.

## Installation

```bash
pnpm add @ai-swfactory/mime-types
```

## Usage

```typescript
import { lookup, extension, contentType, charset, types, extensions } from '@ai-swfactory/mime-types'

// Lookup MIME type by extension
lookup('json') // => 'application/json'
lookup('html') // => 'text/html'
lookup('unknown') // => false

// Lookup MIME type by file path
lookup('path/to/file.png') // => 'image/png'

// Get extension for MIME type
extension('application/json') // => 'json'
extension('text/html') // => 'html'

// Create Content-Type header
contentType('html') // => 'text/html; charset=utf-8'
contentType('text/plain') // => 'text/plain; charset=utf-8'
contentType('image/png') // => 'image/png'

// Get charset for MIME type
charset('text/html') // => 'UTF-8'
charset('application/json') // => 'UTF-8'
charset('image/png') // => false

// Access raw mappings
types.json // => 'application/json'
extensions['image/png'] // => ['png']
```

## Type Safety

All return types are fully typed with literal unions:

```typescript
import type { MimeType, Extension, Charset } from '@ai-swfactory/mime-types'

// MimeType is a union of all known MIME types
const mime: MimeType = 'application/json'

// Extension is a union of all known extensions
const ext: Extension = 'json'

// Charset is a union of all known charsets
const cs: Charset = 'UTF-8'
```

## API

### `lookup(path: string): MimeType | false`

Get the MIME type for a file path or extension.

### `extension(type: string): Extension | false`

Get the default extension for a MIME type.

### `contentType(str: string): string | false`

Create a full Content-Type header value for a MIME type or extension.

### `charset(type: string): Charset | 'UTF-8' | false`

Get the default charset for a MIME type.

### `types: Record<Extension, MimeType>`

Map of extensions to MIME types.

### `extensions: Record<MimeType, Extension[]>`

Map of MIME types to extensions.

### `charsets.lookup(type: string)`

Alias for `charset()`.

## License

MIT
