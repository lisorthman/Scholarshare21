// /lib/api/papers.ts

export interface Paper {
    id: string;
    title: string;
    abstract?: string;
    category: string;
    // Add other fields as needed
  }
  
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
  export interface ApiResponse {
    papers: Paper[];
    pagination: Pagination;
  }
  
  export async function fetchPapers(
    page = 1,
    search = '',
    category = '',
    limit = 10
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
  
    const res = await fetch(`/api/papers?${params.toString()}`);
  
    if (!res.ok) {
      throw new Error(`Failed to fetch papers: ${res.statusText}`);
    }
  
    return res.json();
  }
  