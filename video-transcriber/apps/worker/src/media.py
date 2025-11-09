import os, subprocess
def run(cmd: list[str]):
    subprocess.run(cmd, check=True)

def fetch_to_audio(tmpdir: str, source_type: str, source_url: str|None, object_key: str|None,
                   s3, bucket_media: str) -> str:
    media = os.path.join(tmpdir, 'input.mp4')
    audio = os.path.join(tmpdir, 'audio.wav')
    if source_type == 'url' and source_url:
        run(["yt-dlp","-f","bestaudio/best","-o", media, source_url])
    else:
        with open(media, 'wb') as f:
            obj = s3.get_object(Bucket=bucket_media, Key=object_key)
            f.write(obj['Body'].read())
    run(["ffmpeg","-y","-i", media, "-ac","1","-ar","16000", audio])
    return audio
