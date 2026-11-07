import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCallSettings, updateCallSettings } from "@/lib/api/call-settings";
import type { CallSettings, RelaisPrincipal } from "@/types";

const KEY = ["admin-call-settings"];

export function useCallSettings() {
  return useQuery({ queryKey: KEY, queryFn: fetchCallSettings });
}

/** La réponse porte l'état complet : on le pose en cache plutôt que de relire. */
export function useUpdateCallSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (relaisPrincipal: RelaisPrincipal) => updateCallSettings({ relaisPrincipal }),
    onSuccess: (data) => {
      qc.setQueryData<CallSettings>(KEY, data);
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    },
  });
}
