/** Type média d'un statut officiel : 0 texte, 1 image, 2 vidéo. */
export function statutMediaType(mediaUrl?: string | null): number {
  if (!mediaUrl?.trim()) return 0;
  return /\.(mp4|webm|mov|m4v|mkv|avi)(\?|#|$)/i.test(mediaUrl) ? 2 : 1;
}

/** Payload API : kind=1 pour statut, 0 pour message. */
export function toBroadcastApiPayload(data: import("@/types").BroadcastFormData) {
  const isStatus = data.isStatus === true || data.kind === 1;
  return {
    senderId: data.senderId,
    content: data.content,
    // Le serveur stocke `content_en` et le sert aux appareils en locale `en`
    // (pickLocalized). Sans ce champ, les anglophones reçoivent le texte
    // français quel que soit ce qui a été saisi dans l'onglet EN.
    contentEn: data.contentEn,
    // Toutes les langues saisies, chinois compris : la console d'origine ne
    // les envoyait pas, et le texte chinois se perdait (24/10/2026).
    translations: data.translations,
    type: isStatus ? statutMediaType(data.mediaUrl) : data.type,
    mediaUrl: data.mediaUrl,
    // La couleur n'a de sens que pour un statut texte : un statut média la
    // masque entièrement, un message ne l'affiche nulle part.
    backgroundColor:
      isStatus && !data.mediaUrl?.trim() ? data.backgroundColor || undefined : undefined,
    criteria: data.criteria,
    clientId: data.clientId,
    kind: isStatus ? 1 : 0,
    scheduledAt: data.scheduledAt,
    // `estimate` est ce que l'admin a vu ; `confirmedEstimate` déclenche la
    // vérification anti-obsolescence côté serveur (409 « Estimation obsolète »).
    estimate: data.estimate ?? data.confirmedEstimate,
    confirmedEstimate: data.confirmedEstimate,
  };
}
