"use client";

import {
  type DocumentData,
  type OrderByDirection,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  collection,
  endBefore,
  getCountFromServer,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";

import {
  useState,
  useEffect,
  type DependencyList,
  useCallback,
  useRef,
} from "react";
import { db } from "./config";

export interface PaginationProps<T> {
  collectionRef: string;
  field: keyof T;
  displayCount: number;
  directionStr?: OrderByDirection;
  constraints?: QueryConstraint[];
  enableRealtime?: boolean;
}

export class FirebasePagination {
  /**
   * Hook pour une pagination standard avec navigation par pages
   */
  static useSimple<T>(
    options: PaginationProps<T>,
    dependencies: DependencyList = []
  ) {
    /*     if (dependencies) {
      if (!Object.values(dependencies).every(Boolean)) {
        return {
          data: [],
          nextPage: () => {},
          prevPage: () => {},
          loading: true,
          page: 1,
          totalPages: 1,
          collectionSize: 0,
          isLastPage: true,
          isFirstPage: true,
        };
      }
    }
 */
    const {
      collectionRef,
      field,
      displayCount,
      directionStr = "asc",
      constraints = [],
      // enableRealtime = false,
    } = options;

    // États pour gérer les documents et la pagination
    const [currentDocs, setCurrentDocs] = useState<T[]>([]);
    const [lastVisible, setLastVisible] =
      useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [firstVisible, setFirstVisible] =
      useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [collectionSize, setCollectionSize] = useState(0);
    const [isFirstPage, setIsFirstPage] = useState(true);
    const [isLastPage, setIsLastPage] = useState(false);

    // Refs to avoid recreating functions on every render
    const collectionSizeRef = useRef(0);
    const isFirstPageRef = useRef(true);
    const isLastPageRef = useRef(false);
    const pageRef = useRef(1);

    // Fonction pour récupérer le nombre total de documents
    const fetchTotalSize = useCallback(async () => {
      try {
        const totalSnapshot = await getCountFromServer(
          query(collection(db, collectionRef), ...(constraints || []))
        );

        const totalSize = totalSnapshot.data().count;
        setCollectionSize(totalSize);
        collectionSizeRef.current = totalSize;
        return totalSize;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la taille totale :",
          error
        );
        setError(error instanceof Error ? error : new Error(String(error)));
        return 0;
      }
    }, [collectionRef, constraints]);

    // Fonction pour vérifier si on est sur la dernière page
    /*     const checkIfLastPage = useCallback(
      (dataLength: number, currentPage: number) => {
        // Si on a moins de documents que la limite, c'est forcément la dernière page
        if (dataLength < displayCount) return true;

        // Si on a récupéré tous les documents de la collection
        const totalFetched = currentPage * displayCount;
        return totalFetched >= collectionSizeRef.current;
      },
      [displayCount]
    ); */

    // Fonction pour récupérer la première page
    const fetchFirstPage = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, collectionRef),
          orderBy(field as string, directionStr),
          limit(displayCount),
          ...constraints
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setCurrentDocs(data);

        // Mettre à jour les curseurs de pagination
        setFirstVisible(querySnapshot.docs[0] || null);
        setLastVisible(
          querySnapshot.docs[querySnapshot.docs.length - 1] || null
        );

        // Mettre à jour les états de pagination
        setIsFirstPage(true);
        const isLast =
          data.length < displayCount ||
          data.length >= collectionSizeRef.current;
        setIsLastPage(isLast);
        isLastPageRef.current = isLast;
        setPage(1);

        isFirstPageRef.current = true;
        pageRef.current = 1;

        return data;
      } catch (error) {
        console.error("Erreur lors de la récupération des documents :", error);
        setError(error instanceof Error ? error : new Error(String(error)));
        return [];
      } finally {
        setLoading(false);
      }
    }, [collectionRef, field, directionStr, displayCount, constraints]);

    // Fonction pour récupérer la page suivante
    const fetchNextPage = useCallback(async () => {
      if (!lastVisible || isLastPageRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, collectionRef),
          orderBy(field as string, directionStr),
          startAfter(lastVisible),
          limit(displayCount),
          ...constraints
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        if (data.length === 0) {
          setIsLastPage(true);
          isLastPageRef.current = true;
          return [];
        }

        setCurrentDocs(data);

        // Mettre à jour les curseurs de pagination
        setFirstVisible(querySnapshot.docs[0] || null);
        setLastVisible(
          querySnapshot.docs[querySnapshot.docs.length - 1] || null
        );

        // Mettre à jour les états de pagination
        setIsFirstPage(false);
        const totalFetched = pageRef.current * displayCount;
        const isLast =
          data.length < displayCount ||
          totalFetched >= collectionSizeRef.current;
        setIsLastPage(isLast);
        isLastPageRef.current = isLast;

        isFirstPageRef.current = false;

        return data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la page suivante :",
          error
        );
        setError(error instanceof Error ? error : new Error(String(error)));
        return [];
      } finally {
        setLoading(false);
      }
    }, [
      collectionRef,
      field,
      directionStr,
      displayCount,
      constraints,
      lastVisible,
    ]);

    // Fonction pour récupérer la page précédente
    const fetchPrevPage = useCallback(async () => {
      if (!firstVisible || isFirstPageRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, collectionRef),
          orderBy(field as string, directionStr),
          endBefore(firstVisible),
          limitToLast(displayCount),
          ...constraints
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        if (data.length === 0) {
          // Si aucun résultat, revenir à la première page
          return fetchFirstPage();
        }

        setCurrentDocs(data);

        // Mettre à jour les curseurs de pagination
        setFirstVisible(querySnapshot.docs[0] || null);
        setLastVisible(
          querySnapshot.docs[querySnapshot.docs.length - 1] || null
        );

        // Vérifier si c'est la première page
        const isFirst = await isFirstPageCheck(querySnapshot.docs[0]);
        setIsFirstPage(isFirst);
        setIsLastPage(false);

        isFirstPageRef.current = isFirst;
        isLastPageRef.current = false;

        return data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la page précédente :",
          error
        );
        setError(error instanceof Error ? error : new Error(String(error)));
        return [];
      } finally {
        setLoading(false);
      }
    }, [
      collectionRef,
      field,
      directionStr,
      displayCount,
      constraints,
      firstVisible,
      fetchFirstPage,
    ]);

    // Fonction pour vérifier si un document est le premier de la collection
    const isFirstPageCheck = useCallback(
      async (doc: QueryDocumentSnapshot<DocumentData> | null) => {
        if (!doc) return true;

        try {
          const firstPageQuery = query(
            collection(db, collectionRef),
            orderBy(field as string, directionStr),
            limit(1),
            ...constraints
          );

          const firstPageSnapshot = await getDocs(firstPageQuery);

          return (
            firstPageSnapshot.docs.length > 0 &&
            firstPageSnapshot.docs[0].id === doc.id
          );
        } catch (error) {
          console.error(
            "Erreur lors de la vérification de la première page :",
            error
          );
          return false;
        }
      },
      [collectionRef, field, directionStr, constraints]
    );

    // Initialisation: récupérer la taille totale et la première page
    useEffect(() => {
      const initialize = async () => {
        setLoading(true);
        await fetchTotalSize();
        await fetchFirstPage();
      };

      initialize();
    }, [...dependencies, displayCount]);

    // Fonctions de navigation exposées
    const nextPage = useCallback(() => {
      if (!loading && !isLastPageRef.current) {
        const newPage = pageRef.current + 1;
        setPage(newPage);
        pageRef.current = newPage;
        fetchNextPage();
      }
    }, [loading, fetchNextPage]);

    const prevPage = useCallback(() => {
      if (!loading && !isFirstPageRef.current) {
        setPage((prev) => {
          pageRef.current = prev - 1;
          return prev - 1;
        });
        fetchPrevPage();
      }
    }, [loading, fetchPrevPage]);

    const goToFirstPage = useCallback(() => {
      if (!loading && !isFirstPageRef.current) {
        fetchFirstPage();
      }
    }, [loading, fetchFirstPage]);

    // Calculer le nombre total de pages
    const totalPages = Math.max(1, Math.ceil(collectionSize / displayCount));

    return {
      data: currentDocs,
      nextPage,
      prevPage,
      goToFirstPage,
      refresh: fetchFirstPage,
      loading,
      error,
      page,
      totalPages,
      displayCount,
      collectionSize,
      isFirstPage,
      isLastPage,
      hasMore: !isLastPage,
    };
  }

  /**
   * Hook pour un chargement infini (infinite scroll)
   */
  static useInfinite<T>(
    options: PaginationProps<T>,
    dependencies: DependencyList = []
  ) {
    const {
      collectionRef,
      field,
      displayCount,
      directionStr = "asc",
      constraints = [],
    } = options;

    // États pour gérer les documents et la pagination
    const [allDocs, setAllDocs] = useState<T[]>([]);
    const [lastVisible, setLastVisible] =
      useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [collectionSize, setCollectionSize] = useState(0);
    const [hasMore, setHasMore] = useState(allDocs.length < 1);
    const [_, setInitialLoad] = useState(true);

    // Refs to avoid recreating functions on every render
    const collectionSizeRef = useRef(0);
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const initialLoadRef = useRef(true);

    // Fonction pour récupérer le nombre total de documents
    const fetchTotalSize = useCallback(async () => {
      try {
        const totalSnapshot = await getCountFromServer(
          query(collection(db, collectionRef), ...(constraints || []))
        );

        const totalSize = totalSnapshot.data().count;
        setCollectionSize(totalSize);
        collectionSizeRef.current = totalSize;
        return totalSize;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la taille totale :",
          error
        );
        setError(error instanceof Error ? error : new Error(String(error)));
        return 0;
      }
    }, [collectionRef, constraints]);

    // Fonction pour récupérer les documents
    const fetchDocs = useCallback(
      async (isInitial = false) => {
        if (isInitial) {
          setLoading(true);
          initialLoadRef.current = true;
        }

        setError(null);

        try {
          let q = query(
            collection(db, collectionRef),
            orderBy(field as string, directionStr),
            limit(displayCount),
            ...constraints
          );

          // Si ce n'est pas le chargement initial et qu'il y a un dernier document visible
          if (!isInitial && lastVisible) {
            q = query(
              collection(db, collectionRef),
              orderBy(field as string, directionStr),
              startAfter(lastVisible),
              limit(displayCount),
              ...constraints
            );
          }

          const querySnapshot = await getDocs(q);
          const newDocs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          // Mettre à jour les documents
          if (isInitial) {
            setAllDocs(newDocs);
          } else {
            setAllDocs((prev) => [...prev, ...newDocs]);
          }

          // Mettre à jour le dernier document visible
          const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
          setLastVisible(lastDoc || null);

          // Vérifier s'il y a plus de documents à charger
          const newHasMore =
            newDocs.length === displayCount &&
            allDocs.length + newDocs.length < collectionSizeRef.current;

          setHasMore(newHasMore);
          hasMoreRef.current = newHasMore;

          return newDocs;
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des documents :",
            error
          );
          setError(error instanceof Error ? error : new Error(String(error)));
          return [];
        } finally {
          setLoading(false);
          if (isInitial) {
            setInitialLoad(false);
            initialLoadRef.current = false;
          }
        }
      },
      [
        collectionRef,
        field,
        directionStr,
        displayCount,
        constraints,
        lastVisible,
        allDocs.length,
      ]
    );

    // Initialisation: récupérer la taille totale et les premiers documents
    useEffect(() => {
      const initialize = async () => {
        await fetchTotalSize();
        await fetchDocs(true);
      };

      initialize();
    }, [...dependencies]);

    // Fonction pour charger plus de documents
    const loadMore = useCallback(() => {
      if (!loading && hasMoreRef.current) {
        setPage((prev) => {
          pageRef.current = prev + 1;
          return prev + 1;
        });
        fetchDocs(false);
      }
    }, [loading, fetchDocs]);

    // Fonction pour rafraîchir les données
    const refresh = useCallback(async () => {
      setPage(1);
      setLastVisible(null);
      await fetchTotalSize();
      return fetchDocs(true);
    }, [fetchTotalSize, fetchDocs]);

    return {
      data: allDocs,
      loadMore,
      refresh,
      loading,
      initialLoading: initialLoadRef.current,
      error,
      page,
      totalPages: Math.max(1, Math.ceil(collectionSize / displayCount)),
      displayCount,
      collectionSize,
      hasMore,
      isLast: !hasMore,
    };
  }
}
