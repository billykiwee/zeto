import { getAuth, signInWithCustomToken } from "firebase/auth";
import {
  QueryConstraint,
  QueryFieldFilterConstraint,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, realtimeDB } from "../firebase/config";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

export const FirebaseServices = {
  async getDoc<T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Promise<T | null> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0]; // Premier document trouvé
        return { id: docSnapshot.id, ...docSnapshot.data() } as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du document :", error);
      throw error;
    }
  },

  async getDocs<T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef,
        ...[orderBy("createdAt", "desc"), ...constraints]
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
      } else {
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
      throw error;
    }
  },

  async getCount(
    collectionName: string,
    filter?: QueryFieldFilterConstraint
  ): Promise<number> {
    try {
      const collRef = collection(db, collectionName);
      const q = filter ? query(collRef, filter) : collRef;
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error(
        `Erreur lors du comptage de la collection ${collectionName}:`,
        error
      );
      return 0;
    }
  },

  async create<T extends { id: string }>(
    collectionName: string,
    data: T
  ): Promise<T | null> {
    try {
      if (!data.id) {
        throw new Error(
          "Le champ 'id' est requis dans data pour créer un document."
        );
      }

      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, {
        ...data,
        createdAt: (data as any).createdAt || new Date().toISOString(),
      });

      return data;
    } catch (error) {
      console.error("Erreur lors de la création du document :", error);
      return null;
    }
  },

  async update<T>(
    collectionName: string,
    docId: string,
    updatedData: Partial<T>
  ): Promise<{ success: boolean; error: string | null }> {
    if (!collectionName || !docId || !updatedData) {
      throw new Error(
        "Les paramètres collectionName, docId et updatedData sont requis."
      );
    }

    try {
      const documentRef = doc(db, collectionName, docId);

      // Mise à jour du document
      await updateDoc(documentRef, updatedData);

      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || "Erreur inconnue",
      };
    }
  },

  async add<T>(collectionName: string, docValue: any) {
    try {
      const docRef = doc(db, collectionName, docValue.id);
      await setDoc(docRef, {
        ...docValue,
      });
      return docValue as T;
    } catch (error) {
      console.error("Erreur lors de l'ajout du document :", error);
    }
  },

  async getDocumentById<T>(
    collectionName: string,
    docId: string
  ): Promise<{ data: T | null; error: boolean }> {
    try {
      const documentRef = doc(db, collectionName, docId);
      const documentSnapshot = await getDoc(documentRef);

      if (documentSnapshot.exists()) {
        return { data: documentSnapshot.data() as T, error: false };
      } else {
        console.warn(`Le document avec l'ID "${docId}" n'existe pas.`);
        return { data: null, error: false };
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du document :", error);
      return { data: null, error: true };
    }
  },

  async delete(collection: string, id: string) {
    try {
      const docRef = doc(db, collection, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        const message = `Aucun document trouvé avec l'ID ${id} dans la collection ${collection}`;
        console.warn(message);
        return { success: false, message };
      }

      await deleteDoc(docRef);
      const message = `Document avec l'ID ${id} supprimé de la collection ${collection}`;
      console.log(message);
      return { success: true, message };
    } catch (error) {
      const message = `Erreur lors de la suppression du document : ${error}`;
      console.error(message);
      return { success: false, message };
    }
  },

  async generateDocId(collectionName: string, docName?: string) {
    const key = (await this.getCollectionSize(collectionName)) || 0;
    const id = [docName, key + 1].join("-");

    return id;
  },

  async getCollectionSize(
    collectionName: string,
    where?: QueryFieldFilterConstraint
  ): Promise<number | null> {
    try {
      const collRef = collection(db, collectionName);
      const q = where ? query(collRef, where) : query(collRef);
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error("Error fetching collection size:", error);
      return null;
    }
  },

  listenToDocumentById<T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null, error: boolean) => void
  ) {
    try {
      const documentRef = doc(db, collectionName, docId);

      const unsubscribe = onSnapshot(
        documentRef,
        (documentSnapshot) => {
          if (documentSnapshot.exists()) {
            callback(documentSnapshot.data() as T, false);
          } else {
            console.warn(`Le document avec l'ID "${docId}" n'existe pas.`);
            callback(null, false);
          }
        },
        (error) => {
          console.error("Erreur lors de l'écoute du document :", error);
          callback(null, true);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Erreur lors de la configuration de l'écoute :", error);
      callback(null, true);
      return () => {};
    }
  },

  async deleteFromStorage(filePath: string) {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, filePath);

      await deleteObject(fileRef);
      console.log(`Fichier supprimé du storage à l'emplacement : ${filePath}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier :", error);
      throw error;
    }
  },

  async uploadVideoInStorage(
    id: string,
    file: File,
    pathRoot: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (file.type !== "video/mp4") {
        return reject(new Error("Seuls les fichiers .mp4 sont acceptés."));
      }

      // Validation basique du fichier
      if (!file || !file.type.startsWith("video/")) {
        return reject(
          new Error("Le fichier fourni n'est pas une vidéo valide.")
        );
      }

      const storage = getStorage();
      const fileName = `${id}.mp4`;
      const fullPath = `${pathRoot}/${fileName}`;
      const storageRef = ref(storage, fullPath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error("Erreur lors de l'upload :", error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            // Lire la durée de la vidéo depuis l'URL après upload
            const duration = await getVideoDurationFromUrl(url);

            resolve({ url, duration });
          } catch (err) {
            console.error("Erreur post-upload :", err);
            reject(err);
          }
        }
      );
    });

    // Fonction pour lire la durée d'une vidéo à partir de son URL
    async function getVideoDurationFromUrl(url: string): Promise<number> {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;

        video.onloadedmetadata = () => {
          resolve(video.duration);
        };

        video.onerror = () => {
          reject(new Error("Impossible de lire la durée de la vidéo."));
        };
      });
    }
  },
};
