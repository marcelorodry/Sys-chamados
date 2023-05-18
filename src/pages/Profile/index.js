import './profile.css';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { BiCog, BiUpload } from "react-icons/bi";
import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import defaultAvatar from '../../assets/avatar.png';
import firebase from '../../services/firebaseConnection';
import { toast } from 'react-toastify';

export default function Profile() {

    const { user, signOut, setUser, storageUser, saving, setSaving } = useContext(AuthContext);
    
    const [salvando, setSalvando] = useState(false);
    const [nome, setNome] = useState(user && user.name);
    const [email, setEmail] = useState(user && user.email);
    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);
    const [imageAvatar, setImageAvatar] = useState(null);

    async function handleImageUpload() {
        const uploadTask = await firebase.storage()
        .ref(`images/${user.uid}/${imageAvatar.name}`)
        .put(imageAvatar)
        .then(async () => {
            await firebase.storage().ref(`images/${user.uid}`)
            .child(imageAvatar.name).getDownloadURL()
            .then(async url => {
                await firebase.firestore().collection('users')
                .doc(user.uid)
                .update({
                    avatarUrl: url,
                    name: nome
                })

                .then(() => {
                    let data = {
                        ...user,
                        avatarUrl: url,
                        name: nome
                    }
                    setUser(data);
                    storageUser(data);
                    toast.success('Dados alterados com sucesso!')
                    setSaving(false);
                })
            })

        })
        setImageAvatar(null);
    }

    function handleFile(e) {
        if(e.target.files[0]) {
            const image = e.target.files[0]

            if(image.type === 'image/jpeg' || image.type === 'image/png') {
                setImageAvatar(image);
                setAvatarUrl(URL.createObjectURL(e.target.files[0]));
            } else {
                toast.error('Envie apenas imagens .jpeg ou .png');
                setImageAvatar(null);
                return null;
            }
        }
    }

    async function handleSave(e){
        e.preventDefault();
        setSaving(true);

        if(imageAvatar === null && nome === user.name) {
            toast.error('Nenhum dado modificado!');
            return;
        }

        else if(imageAvatar === null && nome !== '' ) {
            await firebase.firestore().collection('users')
            .doc(user.uid)
            .update({
                name: nome
            })
            .then(() => {
                let data = {
                    ...user,
                    name: nome
                }

                setUser(data);
                storageUser(data);
                toast.success('Dados alterados com sucesso!');
                setSaving(false);
            })

            .catch(e => {
                console.log(e);
            })

        } else if (nome !== '' && imageAvatar !== null) {
            handleImageUpload();
        }

        setSalvando(false);
    }

    return (
        <div className={saving ? 'savingData' : ''}>
            <Header />

            <div className='content'>

                <Title name='Meu perfil'>
                    <BiCog size={24} />
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleSave}>
                        <label className='label-avatar'>
                            <span><BiUpload color='#fff' size={24}/></span>
                            <input type='file' accept='image/*' onChange={handleFile}/><br/>

                            { avatarUrl === null ?
                                <img src={defaultAvatar} width={200} height={200} alt='Foto de perfil do usuário'/>
                                : 
                                <img src={avatarUrl} width={200} height={200} alt='Foto de perfil do usuário'/>
                            }
                        </label>

                        <label>Nome</label>
                        <input type='text' value={nome} onChange={e => setNome(e.target.value)}/>

                        <label>Email</label>
                        <input type='email' value={email} disabled/>

                        {
                        ((nome !== user.name && nome.length >= 5)
                        || imageAvatar !== null) &&
                            <button type='submit'>Salvar</button>
                        }
                    </form>
                </div>

                <div className='container'>
                    <button onClick={signOut} className='logout-btn'>Desconectar</button>
                </div>

            </div>

        </div>
    )
};
