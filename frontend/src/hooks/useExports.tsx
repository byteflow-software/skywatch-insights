import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

interface ExportRequest {
  eventId: string;
  network: string;
  format: string;
  objective?: string;
}

export interface ExportItem {
  id: string;
  eventId: string;
  eventTitle: string;
  network: string;
  format: string;
  objective?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  outputTextContent?: string;
  outputImageUrl?: string;
  createdAt: string;
}

export interface ExportTemplate {
  network: string;
  formats: string[];
}

export interface ExportPage {
  content: ExportItem[];
  data?: ExportItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export function useExports(params?: { eventId?: string; network?: string; page?: number; size?: number }) {
  return useQuery<ExportPage>({
    queryKey: ['exports', params],
    queryFn: () => api.get('/exports', { params }).then(r => r.data),
  });
}

export function useExportById(id: string) {
  return useQuery<ExportItem>({
    queryKey: ['export', id],
    queryFn: () => api.get(`/exports/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useExportTemplates(network?: string) {
  return useQuery<ExportTemplate[]>({
    queryKey: ['export-templates', network],
    queryFn: async () => {
      const { data } = await api.get('/exports/templates', { params: network ? { network } : {} });
      // Transform flat templates into grouped format
      const templateArray = Array.isArray(data) ? data : data?.data ?? [];
      const grouped: Record<string, Set<string>> = {};
      for (const t of templateArray) {
        const net = t.network;
        if (!grouped[net]) grouped[net] = new Set();
        grouped[net].add(t.format);
      }
      return Object.entries(grouped).map(([net, formats]) => ({
        network: net,
        formats: Array.from(formats),
      }));
    },
  });
}

export function useCreateExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExportRequest) => api.post('/exports', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
  });
}
