import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppService } from "../services/app.service";
import { FirebaseServices } from "../services/firebase.service";

type PaginationQuery = {
  orderBy?: string;
  direction?: "asc" | "desc";
  limit?: number;
  offset?: number;
  [key: string]: any;
};

type UsePaginationOptions<T> = {
  limit?: number;
  orderBy?: string;
  direction?: "asc" | "desc";
};

export function usePagination<T>({
  limit = 10,
  orderBy = "createdAt",
  direction = "desc",
}: UsePaginationOptions<T>) {
  const pageLocal = localStorage.getItem("contracts_page");
  const [data, setData] = useState<T[]>([]);
  const [collectionSize, setCollectionSize] = useState(0);
  const [page, setPage] = useState(Number(pageLocal) || 1);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(
    () => Math.ceil(collectionSize / limit),
    [collectionSize, limit]
  );

  const loadData = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      try {
        const query: PaginationQuery = {
          orderBy,
          direction,
          offset: (pageIndex - 1) * limit,
          limit,
        };
        const res = await AppService.getPaginationCollection<T>(
          "contracts",
          query
        );
        setData(res.data);
        setCollectionSize(res.collectionSize);
      } catch (err) {
        console.error("Erreur pagination :", err);
      } finally {
        setLoading(false);
      }
    },
    [limit, orderBy, direction]
  );

  const goToNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const goToPrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  useEffect(() => {
    loadData(page);
    localStorage.setItem("contracts_page", String(page));
  }, [page]);

  return {
    data,
    page,
    totalPages,
    loading,
    setPage,

    goToNextPage,
    goToPrevPage,
    collectionSize,
    rawData: data,
  };
}
