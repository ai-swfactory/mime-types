import { charset, contentType, extension, extensions, lookup, types } from '@ai-swfactory/mime-types'
import { describe, expect, it } from 'vitest'

describe('MimeTypes', () => {
  describe('lookup', () => {
    it.each([
      ['json', 'application/json'],
      ['md', 'text/markdown'],
      ['XML', 'application/xml'],
      ['html', 'text/html'],
      ['txt', 'text/plain'],
      ['png', 'image/png'],
      ['pdf', 'application/pdf'],
    ])('should lookup MIME type for %s', (input, expected) => {
      expect(lookup(input)).toBe(expected)
    })

    it.each([
      ['path/to/file.jpeg', 'image/jpeg'],
      ['archive.zip', 'application/zip'],
      ['/absolute/path.html', 'text/html'],
    ])('should lookup MIME type for path %s', (path, expected) => {
      expect(lookup(path)).toBe(expected)
    })

    it.each([['unknown'], ['.nonexistent'], ['path/to/noextension'], ['path/to/.hiddenfile']])(
      'should return false for unknown extension %s',
      input => {
        expect(lookup(input)).toBe(false)
      },
    )

    it.each([[undefined], [null], [123], ['']])('should handle invalid input %s', (input: unknown) => {
      expect(lookup(input as string)).toBe(false)
    })
  })

  describe('contentType', () => {
    it.each([
      ['html', 'text/html; charset=utf-8'],
      ['json', 'application/json; charset=utf-8'],
      ['png', 'image/png'],
    ])('should create Content-Type header from extension %s', (ext, expected) => {
      expect(contentType(ext)).toBe(expected)
    })

    it.each([
      ['text/plain', 'text/plain; charset=utf-8'],
      ['text/plain; charset=iso-8859-1', 'text/plain; charset=iso-8859-1'],
      ['application/xml', 'application/xml'],
    ])('should create Content-Type header from MIME type %s', (mime, expected) => {
      expect(contentType(mime)).toBe(expected)
    })

    it.each([['unknown']])('should return false for unknown type %s', type => {
      expect(contentType(type)).toBe(false)
    })

    it.each([[undefined], [null], [123], ['']])('should handle invalid input %s', (input: unknown) => {
      expect(contentType(input as string)).toBe(false)
    })
  })

  describe('extension', () => {
    it.each([
      ['application/json', 'json'],
      ['text/html', 'html'],
      ['image/jpeg', 'jpeg'],
      ['application/vnd.ms-excel', 'xls'],
      ['IMAGE/PNG', 'png'],
      ['text/plain; charset=utf-8', 'txt'],
    ])('should get default extension for MIME type %s', (mime, expected) => {
      expect(extension(mime)).toBe(expected)
    })

    it.each([['application/x-unknown'], ['foo/bar']])('should return false for unknown MIME type %s', mime => {
      expect(extension(mime)).toBe(false)
    })

    it.each([[undefined], [null], [123], ['']])('should handle invalid input %s', (input: unknown) => {
      expect(extension(input as string)).toBe(false)
    })
  })

  describe('charset', () => {
    it.each([
      ['text/html', 'UTF-8'],
      ['text/plain', 'UTF-8'],
      ['application/json', 'UTF-8'],
      ['application/javascript', 'UTF-8'],
      ['application/xml', false],
      ['TEXT/XML', 'UTF-8'],
      ['text/markdown; foo=bar', 'UTF-8'],
    ])('should get default charset for MIME type %s', (mime, expected) => {
      expect(charset(mime)).toBe(expected)
    })

    it.each([['image/png'], ['application/octet-stream'], ['application/x-custom']])(
      'should return false for types without specific charset %s',
      mime => {
        expect(charset(mime)).toBe(false)
      },
    )

    it.each([[undefined], [null], [123], ['']])('should handle invalid input %s', (input: unknown) => {
      expect(charset(input as string)).toBe(false)
    })
  })

  describe('Data Maps', () => {
    it('should have html in types map', () => {
      expect(types.html).toBe('text/html')
    })

    it('should have js in types map', () => {
      expect(types.js).toBe('text/javascript')
    })

    it('should have json in types map', () => {
      expect(types.json).toBe('application/json')
    })

    it('should have many entries in types map', () => {
      expect(Object.keys(types).length).toBeGreaterThan(100)
    })

    it('should have html in extensions map', () => {
      expect(extensions['text/html']).toContain('html')
    })

    it('should have json in extensions map', () => {
      expect(extensions['application/json']).toContain('json')
    })

    it('should have png in extensions map', () => {
      expect(extensions['image/png']).toEqual(['png'])
    })

    it('should have many entries in extensions map', () => {
      expect(Object.keys(extensions).length).toBeGreaterThan(100)
    })
  })
})
