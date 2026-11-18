export interface ApiHealthResponse {
  success: boolean;
  service: string;
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
    connected: boolean;
  };
  version: string;
  environment: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchApiHealth(): Promise<ApiHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch backend health:', error);
    return null;
  }
}
