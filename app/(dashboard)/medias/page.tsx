"use client";

import { useState, useMemo } from "react";
import { useMediaItems, useDeleteMedia } from "@/hooks/useMedias";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RefreshCw, Image, Video, FileText, Headphones, Search, Download, Trash2, Eye, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MediaItem } from "@/types";
import { FilterBar, FilterDef } from "@/components/dashboard/FilterBar";
import { PERIOD_OPTIONS } from "@/lib/period";

const mediaTypeLabels: Record<number, string> = { 1: "Image", 2: "Vidéo", 3: "Audio", 4: "Document" };
const mediaTypeColors: Record<number, string> = {
  1: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  3: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  4: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};
const mediaTypeIcons: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  1: Image, 2: Video, 3: Headphones, 4: FileText,
};

const MEDIA_DEFAULTS = { type: "", period: "", sort: "sendAt", order: "desc" };

export default function MediasPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(MEDIA_DEFAULTS);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { data: mediaItems, isLoading, isFetching, isError, refetch } = useMediaItems();
  const deleteMutation = useDeleteMedia();
  const { addToast } = useToast();

  const counts = useMemo(() => {
    const by: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    (mediaItems || []).forEach((m) => { if (by[m.type] !== undefined) by[m.type]++; });
    return { all: mediaItems?.length ?? 0, by };
  }, [mediaItems]);

  const mediaFilters: FilterDef[] = useMemo(() => [
    { key: "type", label: "Type", options: [
      { value: "", label: `Tous (${counts.all})` },
      { value: "1", label: `Images (${counts.by[1]})` },
      { value: "2", label: `Vidéos (${counts.by[2]})` },
      { value: "3", label: `Audios (${counts.by[3]})` },
      { value: "4", label: `Documents (${counts.by[4]})` },
    ] },
    { key: "period", label: "Période", options: [...PERIOD_OPTIONS] },
    { key: "sort", label: "Trier par", options: [
      { value: "sendAt", label: "Date" },
      { value: "mediaName", label: "Nom" },
      { value: "senderNom", label: "Expéditeur" },
    ] },
    { key: "order", label: "Ordre", options: [
      { value: "desc", label: "Décroissant" },
      { value: "asc", label: "Croissant" },
    ] },
  ], [counts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const typeN = values.type ? Number(values.type) : null;
    const list = (mediaItems || []).filter((m) => {
      if (typeN !== null && m.type !== typeN) return false;
      if (q && !`${m.mediaName} ${m.senderNom}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = values.order === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (values.sort) {
        case "mediaName": return dir * (a.mediaName || "").localeCompare(b.mediaName || "");
        case "senderNom": return dir * (a.senderNom || "").localeCompare(b.senderNom || "");
        case "sendAt":
        default: return dir * (new Date(a.sendAt || 0).getTime() - new Date(b.sendAt || 0).getTime());
      }
    });
  }, [mediaItems, search, values]);

  function handleDownload(media: MediaItem) {
    if (!media.mediaUrl) {
      addToast({ title: "Lien indisponible", variant: "error" });
      return;
    }
    const a = document.createElement("a");
    a.href = media.mediaUrl;
    a.download = media.mediaName || "media";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function handleDelete() {
    if (!confirmDelete) return;
    deleteMutation.mutate(confirmDelete, {
      onSuccess: () => {
        addToast({ title: "Média supprimé", variant: "success" });
        setConfirmDelete(null);
      },
      onError: () => {
        addToast({ title: "Échec", description: "Impossible de supprimer le média", variant: "error" });
        setConfirmDelete(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Médias</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Fichiers partagés sur Alanya ({filtered.length}{mediaItems ? ` / ${mediaItems.length}` : ""} médias)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters((s) => !s)} className={showFilters ? "bg-indigo-50 dark:bg-indigo-950" : ""}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtres
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par nom de fichier ou expéditeur..."
        showFilters={showFilters}
        filters={mediaFilters}
        values={values}
        defaults={MEDIA_DEFAULTS}
        onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
        onReset={() => setValues(MEDIA_DEFAULTS)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {(isLoading || isFetching) && <MediaGridSkeleton count={8} />}

      {!isLoading && !isFetching && isError && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      )}

      {!isLoading && !isFetching && mediaItems && mediaItems.length === 0 && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <Image className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          Aucun média
        </div>
      )}

      {!isLoading && !isFetching && mediaItems && mediaItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((media) => {
            const Icon = mediaTypeIcons[media.type] || Image;
            const colorClass = mediaTypeColors[media.type] || mediaTypeColors[1];
            return (
              <Card key={media.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium truncate">{media.mediaName}</p>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => setPreview(media)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                            <Eye className="h-3.5 w-3.5 text-zinc-500" />
                          </button>
                          <button onClick={() => handleDownload(media)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                            <Download className="h-3.5 w-3.5 text-zinc-500" />
                          </button>
                          <button onClick={() => setConfirmDelete(media.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded">
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">de {media.senderNom}</p>
                      <p className="text-xs text-zinc-400 truncate">#{media.conversationName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className={`${colorClass} border-0 text-[10px] px-1.5 py-0`}>{mediaTypeLabels[media.type] || "Fichier"}</Badge>
                        <span className="text-[10px] text-zinc-400">{new Date(media.sendAt).toLocaleDateString("fr")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && !isFetching && mediaItems && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <Search className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
          Aucun média trouvé
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{preview?.mediaName}</DialogTitle>
            <DialogDescription>
              {preview ? mediaTypeLabels[preview.type] : ""} · {preview?.senderNom} · #{preview?.conversationName}
            </DialogDescription>
          </DialogHeader>
          {preview && <MediaPreview media={preview} />}
          <div className="text-xs text-zinc-400 space-y-1">
            <p>Fichier : {preview?.mediaName}</p>
            <p>Envoyé le : {preview ? new Date(preview.sendAt).toLocaleString("fr") : ""}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Fermer</Button></DialogClose>
            <Button onClick={() => preview && handleDownload(preview)}>
              <Download className="h-4 w-4 mr-1" /> Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le média</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaPreview({ media }: { media: MediaItem }) {
  const [error, setError] = useState(false);
  const url = media.mediaUrl;

  if (!url || error) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-64 flex flex-col items-center justify-center gap-2">
        <Image className="h-12 w-12 text-zinc-300" />
        <p className="text-xs text-zinc-400">Aperçu non disponible</p>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
            Ouvrir le fichier
          </a>
        )}
      </div>
    );
  }

  if (media.type === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={media.mediaName}
        onError={() => setError(true)}
        className="rounded-lg max-h-80 w-full object-contain bg-zinc-100 dark:bg-zinc-800"
      />
    );
  }
  if (media.type === 2) {
    return <video src={url} controls onError={() => setError(true)} className="rounded-lg max-h-80 w-full bg-black" />;
  }
  if (media.type === 3) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 flex items-center gap-3">
        <Headphones className="h-8 w-8 text-zinc-400 shrink-0" />
        <audio src={url} controls onError={() => setError(true)} className="w-full" />
      </div>
    );
  }
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-32 flex flex-col items-center justify-center gap-2">
      <FileText className="h-12 w-12 text-zinc-300" />
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate max-w-full px-4">
        {media.mediaName}
      </a>
    </div>
  );
}
