// app/actions/papers.ts
'use server';

import { fetchPapers } from '@/lib/api/papers';

export async function searchPapers(formData: FormData) {
  const search = formData.get('search') as string;
  const category = formData.get('category') as string;
  
  return await fetchPapers(1, search, category);
}