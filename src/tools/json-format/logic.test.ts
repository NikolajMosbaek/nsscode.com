import { describe, expect, it } from 'vitest'
import { formatJson } from './logic'

describe('formatJson', () => {
  it('pretty-prints valid JSON with two-space indent', () => {
    const r = formatJson('{"a":1}')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe('{\n  "a": 1\n}')
  })

  it('honours a custom indent', () => {
    const r = formatJson('{"a":1}', 4)
    if (r.ok) expect(r.value).toBe('{\n    "a": 1\n}')
    else throw new Error('expected success')
  })

  it('preserves nested structure', () => {
    const r = formatJson('{"a":{"b":[1,2]}}')
    if (r.ok) expect(r.value).toContain('"b": [')
    else throw new Error('expected success')
  })

  it('fails on malformed JSON without throwing', () => {
    const r = formatJson('{nope}')
    expect(r.ok).toBe(false)
  })

  it('reports empty input as a failure rather than an exception', () => {
    const r = formatJson('   ')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('Nothing to format')
  })
})
