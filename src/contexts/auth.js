import { useState, createContext, useEffect } from 'react';
import firebase from '../services/firebaseConnection';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        function loadStorage() {
            const storageUser = localStorage.getItem('SistemaUser');
            if (storageUser) {
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }
            setLoading(false);
        }
        loadStorage();
    }, []);

    async function signIn(email, password) {
        setLoadingAuth(true);
        await firebase.auth().signInWithEmailAndPassword(email, password)
            .then(async value => {
                let uid = value.user.uid;
                const userProfile = await firebase.firestore().collection('users')
                    .doc(uid).get();

                let data = {
                    uid: uid,
                    name: userProfile.data().name,
                    avatarUrl: userProfile.data().avatarUrl,
                    email: value.user.email
                }

                setUser(data);
                storageUser(data);
                setLoadingAuth(false);
                toast.success(`Bem vindo(a), ${data.name.split(' ')[0]}!`);
            })
            .catch(e => {
                console.log(e.code)
                if(e.code === 'auth/invalid-email') {
                    toast.error('E-mail inválido!')
                } else if (e.code === 'auth/wrong-password') {
                    toast.error('Falha na autenticação')
                } else if (e.code === 'auth/user-not-found') {
                    toast.error('E-mail não cadastrado!')
                }
                setLoadingAuth(false);
            })
    }

    // CADASTRA UM NOVO USUARIO
    async function signUp(email, password, name) {
        setLoadingAuth(true);

        // CRIA CONTA NO AUTH FIREBASE
        await firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(async value => {
                // VALUE RETORNA OS DADOS DA CONTA CRIADA
                let uid = value.user.uid;
                // SALVO NA COLEÇÃO 'USERS' UM NOVO DOC
                // COM O ID DA NOVA CONTA CRIADA
                // PASSANDO O OS DADOS JA PASSADOS NA FUNÇÃO
                await firebase.firestore().collection('users')
                    .doc(uid).set({
                        name: name,
                        avatarUrl: null,

                    })
                    .then(() => {
                        let data = {
                            uid: uid,
                            name: name,
                            email: value.user.email,
                            avatarUrl: null
                        }
                        setUser(data);
                        storageUser(data);
                        setLoadingAuth(false);
                        toast.success('Bem vindo à plataforma')
                    })
            })
            .catch(e => {
                console.log(e);
                toast.error('Ops, algo de errado!');
                setLoadingAuth(false);
            })
    }

    // DESLOGA USUARIO
    async function signOut() {
        await firebase.auth().signOut();
        localStorage.removeItem('SistemaUser');
        setUser(null);
    }

    function storageUser(data) {
        localStorage.setItem('SistemaUser', JSON.stringify(data));
    }

    return (
        <AuthContext.Provider
            value={{
                signed: !!user,
                user,
                loading,
                signUp,
                signOut,
                signIn,
                loadingAuth,
                setUser,
                storageUser,
                saving,
                setSaving
            }}>
            {children}
        </AuthContext.Provider>
    )
}