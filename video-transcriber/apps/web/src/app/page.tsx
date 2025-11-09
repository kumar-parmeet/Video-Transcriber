'use client';
import { useState } from 'react';
import { createJob, getJob } from '../lib/api';

export default function Page() {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [links, setLinks] = useState<any>(null);

  async function submit() {
    const fd = new FormData();
    if (url) fd.append('url', url);
    if (file) fd.append('file', file);
    const { id } = await createJob(fd);
    setJobId(id);
    setStatus('pending');
    poll(id);
  }

  async function poll(id: string) {
    const timer = setInterval(async () => {
      const { job } = await getJob(id);
      setStatus(job?.status || '');
      if (job?.status === 'done') {
        setLinks({
          txt: `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs/${id}/artifact?format=txt`,
          srt: `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs/${id}/artifact?format=srt`,
          vtt: `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs/${id}/artifact?format=vtt`,
          json: `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs/${id}/artifact?format=json`,
        });
        clearInterval(timer);
      }
      if (job?.status === 'error') clearInterval(timer);
    }, 1500);
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Video → Text Transcriber</h1>
      <div className="space-y-2 border p-4 rounded">
        <label className="text-sm">Paste a video URL</label>
        <input className="w-full border p-2 rounded" placeholder="https://..." value={url} onChange={e=>setUrl(e.target.value)} />
        <div className="text-center text-sm">— or —</div>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="mt-2 px-4 py-2 bg-black text-white rounded" onClick={submit}>Transcribe</button>
      </div>

      {jobId && (
        <div className="border p-4 rounded">
          <div><b>Job:</b> {jobId}</div>
          <div><b>Status:</b> {status}</div>
          {links && (
            <div className="mt-2 space-x-3">
              <a className="underline" href={links.txt}>.txt</a>
              <a className="underline" href={links.srt}>.srt</a>
              <a className="underline" href={links.vtt}>.vtt</a>
              <a className="underline" href={links.json}>.json</a>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-gray-500">Upload only content you own or have permission to process.</p>
    </main>
  );
}
