from typing import List, Dict
import json

def format_txt(segments: List[Dict]) -> str:
    return "\n".join(s["text"].strip() for s in segments)

def _fmt_srt_time(t: float) -> str:
    ms = int(round(t*1000))
    h = ms//3600000; m=(ms%3600000)//60000; s=(ms%60000)//1000; msx=ms%1000
    return f"{h:02}:{m:02}:{s:02},{msx:03}"

def format_srt(segments: List[Dict]) -> str:
    lines = []
    for i, s in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{_fmt_srt_time(s['start'])} --> {_fmt_srt_time(s['end'])}")
        lines.append(s['text'].strip())
        lines.append("");
    return "\n".join(lines)

def format_vtt(segments: List[Dict]) -> str:
    def _fmt(t: float) -> str:
        ms = int(round(t*1000)); h=ms//3600000; m=(ms%3600000)//60000; s=(ms%60000)//1000; msx=ms%1000
        return f"{h:02}:{m:02}:{s:02}.{msx:03}"
    blocks = [f"{_fmt(s['start'])} --> {_fmt(s['end'])}\n{s['text'].strip()}" for s in segments]
    return "WEBVTT\n\n" + "\n\n".join(blocks)

def format_json(segments: List[Dict]) -> str:
    return json.dumps(segments, ensure_ascii=False)
