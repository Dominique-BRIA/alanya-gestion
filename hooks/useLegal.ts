import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPagesLegales, updatePageLegale, type PageLegale } from "@/lib/api/legal";

const KEY = ["admin-legal"];

export function usePagesLegales() {
  return useQuery({ queryKey: KEY, queryFn: fetchPagesLegales });
}

export function useUpdatePageLegale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, titre, contenu }: { slug: PageLegale["slug"]; titre: string; contenu: string }) =>
      updatePageLegale(slug, { titre, contenu }),
    onSuccess: (page) => {
      qc.setQueryData<PageLegale[]>(KEY, (avant) => (avant ?? []).map((p) => (p.slug === page.slug ? page : p)));
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    },
  });
}
