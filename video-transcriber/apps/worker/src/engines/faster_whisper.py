from faster_whisper import WhisperModel
from .base import Engine

class FasterWhisperEngine(Engine):
    def __init__(self, model_name: str = 'large-v3', compute_type: str = 'auto'):
        self.model = WhisperModel(model_name, compute_type=compute_type)

    def transcribe(self, audio_path: str):
        segments, info = self.model.transcribe(audio_path, vad_filter=True, word_timestamps=False)
        out = []
        for s in segments:
            out.append({"start": float(s.start), "end": float(s.end), "text": s.text})
        return out, getattr(info, 'language', None)
