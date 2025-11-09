const BASE = process.env.NEXT_PUBLIC_API_BASE!;
export const createJob = async (body: FormData) => {
  const res = await fetch(`${BASE}/api/jobs`, { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
export const getJob = async (id: string) => {
  const res = await fetch(`${BASE}/api/jobs/${id}`);
  return res.json();
};
