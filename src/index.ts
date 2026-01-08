// mime-types.ts

// Import the db object itself and the derived literal types
import { type Charset, db, type Extension, type MimeType, type Source } from './db'

// Re-export types for consumers
export type { Charset, Extension, MimeType, Source }
export type { MimeData } from './db'

// --- Private Variables ---

const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
const TEXT_TYPE_REGEXP = /^text\//i

// Maps populated at module load using the specific literal types
const mimeTypes: Partial<Record<Extension, MimeType>> = {} // extension -> mime type
const mimeExtensions: Partial<Record<MimeType, readonly Extension[]>> = {} // mime type -> extensions

// --- Initialization ---

/**
 * Populates the mimeTypes and mimeExtensions maps based on the database.
 * @private
 */
const populateMaps = (
  extensionsMap: Partial<Record<MimeType, readonly Extension[]>>,
  typesMap: Partial<Record<Extension, MimeType>>,
  database: typeof db, // Use the specific inferred type of db
): void => {
  // Source preference (least -> most) - use union type including undefined
  const preference: (Source | undefined)[] = ['nginx', 'apache', undefined, 'iana']

  // Iterate over the specific MimeType keys
  ;(Object.keys(database) as MimeType[]).forEach(type => {
    const mime = database[type]
    // Check if mime entry has extensions property
    if (!('extensions' in mime)) {
      return
    }
    // Check if extensions array is not empty
    if (mime.extensions.length <= 0) {
      return
    }
    // Now TypeScript knows mime.extensions is ReadonlyArray<Extension>
    const exts = mime.extensions

    // Store direct mapping: mime type -> extensions
    extensionsMap[type] = exts

    // Store reverse mapping: extension -> mime type
    for (const extension of exts) {
      // Check preference for overwriting
      const currentMime = typesMap[extension]
      if (currentMime) {
        // Lookup currentMime data for source comparison
        const currentMimeData = database[currentMime]
        const currentSource = 'source' in currentMimeData ? currentMimeData.source : undefined
        const newSource = 'source' in mime ? mime.source : undefined

        // Lower index means lower preference
        const from = preference.indexOf(currentSource)
        const to = preference.indexOf(newSource)

        if (currentMime !== 'application/octet-stream' && (from > to || (from === to && currentMime.startsWith('application/')))) {
          // Skip remapping if preference is lower or equal (and not replacing octet-stream)
          continue
        }
      }

      // Set the extension -> mime type mapping
      typesMap[extension] = type
    }
  })
}

// Populate the maps upon module initialization
populateMaps(mimeExtensions, mimeTypes, db)

// --- Public API ---

/**
 * Lookup the MIME type for a file path or extension.
 * Input path is still generic string, but output is specific MimeType.
 *
 * @param path Path or extension string.
 * @return The corresponding MIME type literal or `false` if not found.
 */
export const lookup = (path: string): MimeType | false => {
  if (!path || typeof path !== 'string') {
    return false
  }

  const filename = 'x.' + path
  const lastDotIndex = filename.lastIndexOf('.')
  const potentialExtension = lastDotIndex < 1 ? '' : filename.substring(lastDotIndex + 1).toLowerCase()

  // Check for empty string before casting to Extension type
  if (!potentialExtension) {
    return false
  }

  // Safe to cast now - we've verified it's non-empty
  const extension = potentialExtension as Extension

  // Return the specific MimeType or false
  return mimeTypes[extension] ?? false
}

/**
 * Get the default charset for a MIME type.
 *
 * @param type MIME type string.
 * @return The default charset literal, 'UTF-8', or `false`.
 */
export const charset = (type: string): Charset | 'UTF-8' | false => {
  if (!type || typeof type !== 'string') {
    return false
  }

  const match = EXTRACT_TYPE_REGEXP.exec(type)
  const mimeKey = match?.[1]?.toLowerCase()

  if (!mimeKey) {
    return false
  }

  // Check if it's a valid key in our db before casting
  if (!(mimeKey in db)) {
    // Not a known MIME type, check if it's a text type
    if (TEXT_TYPE_REGEXP.test(mimeKey)) {
      return 'UTF-8'
    }
    return false
  }

  const mimeData = db[mimeKey as MimeType]

  if ('charset' in mimeData) {
    return mimeData.charset
  }

  // Known MIME type without charset - check if it's text type for default UTF-8
  if (TEXT_TYPE_REGEXP.test(mimeKey)) {
    return 'UTF-8'
  }

  return false
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param str MIME type or extension string.
 * @return The full Content-Type string or `false` if lookup fails.
 */
export const contentType = (str: string): string | false => {
  if (!str || typeof str !== 'string') {
    return false
  }

  // Attempt lookup if it doesn't seem like a full MIME type
  let mime: string | false = str.includes('/') ? str : lookup(str)

  if (!mime) {
    return false
  }

  // mime could be MimeType | string here. charset() handles both.
  if (!mime.includes('charset')) {
    const cs = charset(mime) // cs is Charset | 'UTF-8' | false
    if (cs) {
      // Ensure cs is lowercased correctly
      const charsetString = typeof cs === 'string' ? cs.toLowerCase() : cs
      mime += '; charset=' + charsetString
    }
  }

  // The final result is always a string
  return mime
}

/**
 * Get the default file extension for a MIME type.
 *
 * @param type MIME type string.
 * @return The first known extension literal for this type or `false`.
 */
export const extension = (type: string): Extension | false => {
  if (!type || typeof type !== 'string') {
    return false
  }

  const match = EXTRACT_TYPE_REGEXP.exec(type)
  // Ensure the matched type is treated as a potential MimeType key
  const mime = match?.[1]?.toLowerCase() as MimeType | undefined

  if (!mime) {
    return false
  }

  // Use the specific MimeType key for lookup
  const exts = mimeExtensions[mime] // exts is ReadonlyArray<Extension> | undefined

  if (exts && exts.length > 0) {
    // Inside this block, TS knows exts is defined and has elements
    const firstExt = exts[0]
    return firstExt ?? false
  }

  return false
}

/**
 * Exported map of extensions to corresponding MIME types.
 * Keys are specific Extension literals, values are specific MimeType literals.
 */
export const types: Readonly<Partial<Record<Extension, MimeType>>> = mimeTypes

/**
 * Exported map of MIME types to their known file extensions.
 * Keys are specific MimeType literals, values are readonly arrays of Extension literals.
 */
export const extensions: Readonly<Partial<Record<MimeType, readonly Extension[]>>> = mimeExtensions

/**
 * Exported object with a `lookup` method, same as the `charset` function.
 * Type signature reflects the improved charset function.
 */
export const charsets: { lookup: typeof charset } = { lookup: charset }
