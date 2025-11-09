import { describe, it, expect } from 'vitest';

function fmtSrt(ms: number) {
  const h = Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000), msx=ms%1000;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(msx).padStart(3,'0')}`;
}

describe('srt time formatting', () => {
  it('formats 01:02:03,045', () => {
    expect(fmtSrt(3723045)).toBe('01:02:03,045');
  });
});
