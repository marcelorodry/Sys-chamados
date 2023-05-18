import './customers.css';
import Title from '../../components/Title';
import Header from '../../components/Header';
import { BiGroup } from "react-icons/bi";
import { useState, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/auth';

export default function Customers() {

    const { saving, setSaving, user } = useContext(AuthContext);

    const [nomeFantasia, setNomeFantasia] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [endereco, setEndereco] = useState('');

    async function handleAdd(e) {
        e.preventDefault();
        
        if(nomeFantasia !== '' && cnpj !== '' && endereco !== '') {
            setSaving(true);
            await firebase.firestore().collection('customers')
            .add({
                nomeFantasia: nomeFantasia,
                cnpj: cnpj,
                endereco: endereco
            })
            .then(() => {
                setNomeFantasia('');
                setCnpj('');
                setEndereco('');
                toast.info('Empresa cadastrada com sucesso!')
            })
            
            .catch(e => {
                console.log(e)
                toast.error('Erro no cadastro.')
            })

            setSaving(false);

        } else {
            toast.error('Preencha todos os campos!')
        }
    }

    return (
        <div className={saving ? 'savingData' : ''}>
            <Header />
            <div className='content'>
                <Title name='Clientes'>
                    <BiGroup size={24} />
                </Title>

                <div className='container'>
                    <form className='form-profile customers' onSubmit={handleAdd}>
                        <label>Nome fantasia</label>
                        <input type='text' placeholder='Nome da empresa' value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)}/>

                        <label>CNPJ</label>
                        <input type='text' placeholder='CNPJ' value={cnpj} onChange={e => setCnpj(e.target.value)}/>

                        <label>Endereço</label>
                        <input type='text' placeholder='Endereço' value={endereco} onChange={e => setEndereco(e.target.value)}/>

                        <button type='submit'>Cadastrar</button>
                    </form>
                </div>



            </div>

        </div>
    )
};
