import os, json, tempfile, shutil
from redis import Redis
from models import JobPayload
from storage import s3_client
from db import conn
from media import fetch_to_audio
from engines.faster_whisper import FasterWhisperEngine
from subtitles import format_txt, format_srt, format_vtt, format_json

QUEUE_KEY = os.getenv('REDIS_QUEUE_KEY','transcribe:jobs')
BKT_MEDIA = os.getenv('S3_BUCKET_MEDIA','media')
BKT_OUT = os.getenv('S3_BUCKET_OUTPUTS','outputs')

engine = FasterWhisperEngine(os.getenv('WHISPER_MODEL','large-v3'))

redis = Redis.from_url(os.getenv('REDIS_URL','redis://localhost:6379'))
s3 = s3_client()

while True:
    _, raw = redis.brpop(QUEUE_KEY, timeout=0)
    payload = JobPayload.model_validate_json(raw)

    tmp = tempfile.mkdtemp()
    try:
        audio = fetch_to_audio(tmp, payload.sourceType, payload.sourceUrl, payload.objectKey, s3, BKT_MEDIA)
        segs, lang = engine.transcribe(audio)
        txt = format_txt(segs).encode('utf-8')
        srt = format_srt(segs).encode('utf-8')
        vtt = format_vtt(segs).encode('utf-8')
        jsn = format_json(segs).encode('utf-8')

        s3.put_object(Bucket=BKT_OUT, Key=f"{payload.jobId}.txt", Body=txt, ContentType='text/plain')
        s3.put_object(Bucket=BKT_OUT, Key=f"{payload.jobId}.srt", Body=srt, ContentType='application/x-subrip')
        s3.put_object(Bucket=BKT_OUT, Key=f"{payload.jobId}.vtt", Body=vtt, ContentType='text/vtt')
        s3.put_object(Bucket=BKT_OUT, Key=f"{payload.jobId}.json", Body=jsn, ContentType='application/json')

        with conn() as cx:
            cx.execute("update jobs set status='done', language=%s where id=%s", (lang, payload.jobId))
            cx.execute("insert into artifacts(job_id, txt_key, srt_key, vtt_key, json_key) values(%s,%s,%s,%s,%s) on conflict (job_id) do update set txt_key=excluded.txt_key, srt_key=excluded.srt_key, vtt_key=excluded.vtt_key, json_key=excluded.json_key", (
                payload.jobId, f"{payload.jobId}.txt", f"{payload.jobId}.srt", f"{payload.jobId}.vtt", f"{payload.jobId}.json"
            ))
            cx.commit()
    except Exception as e:
        with conn() as cx:
            cx.execute("update jobs set status='error', error=%s where id=%s", (str(e), payload.jobId))
            cx.commit()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
