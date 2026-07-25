import { db } from './firebase-config.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    limit,
    serverTimestamp 
} from "firebase/firestore";
import { auth } from './firebase-config.js';

class StorageManager {
    static COLLECTION = 'setlists';
    static PUBLIC_COLLECTION = 'public_setlists';

    // Guardar setlists del usuario
    static async saveUserSetlists(userId, setlists) {
        try {
            const data = setlists.map(s => s.toJSON());
            await setDoc(doc(db, this.COLLECTION, userId), {
                setlists: data,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error guardando:', error);
            return { success: false, error: error.message };
        }
    }

    // Cargar setlists del usuario
    static async loadUserSetlists(userId) {
        try {
            const docRef = doc(db, this.COLLECTION, userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.setlists) {
                    return data.setlists.map(item => SetList.fromJSON(item));
                }
            }
            return [];
        } catch (error) {
            console.error('Error cargando:', error);
            return [];
        }
    }

    // Publicar setlist (compartir con todos)
    static async publishSetlist(setlist) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuario no autenticado');

            await addDoc(collection(db, this.PUBLIC_COLLECTION), {
                ...setlist.toJSON(),
                publishedAt: serverTimestamp(),
                publishedBy: user.uid,
                publisherName: user.displayName || user.email
            });
            return { success: true };
        } catch (error) {
            console.error('Error publicando:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener setlists públicos
    static async getPublicSetlists() {
        try {
            const q = query(
                collection(db, this.PUBLIC_COLLECTION),
                orderBy('publishedAt', 'desc'),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            
            const setlists = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const setlist = SetList.fromJSON(data);
                setlist.publicId = doc.id;
                setlist.publisherName = data.publisherName || 'Anónimo';
                setlists.push(setlist);
            });
            return setlists;
        } catch (error) {
            console.error('Error obteniendo públicos:', error);
            return [];
        }
    }

    // Importar setlist público
    static async importPublicSetlist(publicId) {
        try {
            const docRef = doc(db, this.PUBLIC_COLLECTION, publicId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                const setlist = SetList.fromJSON(data);
                // Generar nuevo ID para no sobrescribir
                setlist.id = crypto.randomUUID();
                setlist.isPublic = false;
                setlist.importedFrom = publicId;
                return setlist;
            }
            return null;
        } catch (error) {
            console.error('Error importando:', error);
            return null;
        }
    }
}

export { StorageManager };