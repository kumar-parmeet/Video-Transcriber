from src.subtitles import format_srt

def test_srt_time_formatting():
    segs=[{"start":1.045,"end":3.5,"text":"Hello"}]
    out=format_srt(segs)
    assert '00:00:01,045 --> 00:00:03,500' in out
