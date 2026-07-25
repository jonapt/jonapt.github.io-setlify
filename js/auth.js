import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "firebase/auth";
import { db } from './firebase-config.js';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.onAuthChange = null;
        this.init();
    }

    init() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (this.onAuthChange) {
                this.onAuthChange(user);
            }
            if (user) {
                console.log('✅ Usuario autenticado:', user.email);
            } else {
                console.log('❌ Usuario no autenticado');
            }
        });
    }

    async register(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Actualizar perfil
            await updateProfile(user, { displayName: displayName });
            
            // Crear documento en Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                displayName: displayName,
                createdAt: serverTimestamp()
            });
            
            return { success: true, user: user };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Error en reset password:', error);
            return { success: false, error: error.message };
        }
    }

    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    onAuthStateChanged(callback) {
        this.onAuthChange = callback;
    }
}

export { AuthManager };