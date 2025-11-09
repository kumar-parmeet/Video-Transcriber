from typing import Dict

class Engine:
    def transcribe(self, audio_path: str) -> tuple[list[Dict], str|None]:
        """Return (segments, language). segments: [{start:float,end:float,text:str}]"""
        raise NotImplementedError
