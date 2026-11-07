import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDeveloperSettings, updateDeveloperSettings } from "@/lib/api/developer-settings";
import type { DeveloperSettings } from "@/types";

const KEY = ["admin-developer-settings"];

export function useDeveloperSettings() {
  return useQuery({ queryKey: KEY, queryFn: fetchDeveloperSettings });
}

/** La réponse porte l'état complet : on le pose en cache plutôt que de relire. */
export function useUpdateDeveloperSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enseignesParPersonne: number) => updateDeveloperSettings(enseignesParPersonne),
    onSuccess: (data) => {
      qc.setQueryData<DeveloperSettings>(KEY, data);
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    },
  });
}
