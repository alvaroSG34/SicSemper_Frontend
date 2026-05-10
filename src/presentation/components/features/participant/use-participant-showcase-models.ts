import { useCallback, useEffect, useRef, useState } from "react";
import { participantService } from "@/application/participant/participant.service";
import type {
  ParticipantShowcaseModelItem,
  ParticipantShowcaseSortOption,
} from "@/domain/participant/participant.types";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;

type UseParticipantShowcaseModelsInput = {
  eventId: string;
  finalCategoryId: string;
};

export const useParticipantShowcaseModels = ({
  eventId,
  finalCategoryId,
}: UseParticipantShowcaseModelsInput) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<ParticipantShowcaseSortOption>("SCORE_DESC");
  const [items, setItems] = useState<ParticipantShowcaseModelItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestCounterRef = useRef(0);

  const loadPage = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      const requestId = requestCounterRef.current + 1;
      requestCounterRef.current = requestId;
      setError(null);

      if (mode === "replace") {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await participantService.getCategoryShowcase({
          eventId,
          finalCategoryId,
          page: targetPage,
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
          sort,
        });

        if (requestCounterRef.current !== requestId) {
          return;
        }

        const nextItems = response.models.items;
        setItems((previousItems) => {
          if (mode === "replace") {
            return nextItems;
          }

          const mergedItems = [...previousItems];
          for (const item of nextItems) {
            if (!mergedItems.some((existing) => existing.id === item.id)) {
              mergedItems.push(item);
            }
          }
          return mergedItems;
        });
        setPage(response.models.page);
        setTotal(response.models.total);
        setTotalPages(response.models.totalPages);
      } catch (requestError) {
        if (requestCounterRef.current !== requestId) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudo cargar la informacion.",
        );
      } finally {
        if (requestCounterRef.current === requestId) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearch, eventId, finalCategoryId, sort],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    void loadPage(1, "replace");
  }, [debouncedSearch, loadPage]);

  return {
    searchInput,
    setSearchInput,
    sort,
    setSort,
    items,
    page,
    total,
    totalPages,
    loadingInitial,
    loadingMore,
    error,
    loadMore: () => loadPage(page + 1, "append"),
  };
};

