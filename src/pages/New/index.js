import './new.css';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { BiCommentAdd } from 'react-icons/bi'
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import firebase from '../../services/firebaseConnection';
import { toast } from 'react-toastify';
import { useHistory, useParams } from 'react-router-dom';

import { Route, Redirect } from 'react-router-dom';

export default function New() {

    const { id } = useParams();
    const history = useHistory();

    const { user, saving, setSaving } = useContext(AuthContext);

    const [loadCustomers, setLoadCustomers] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [customerSelected, setCustomerSelected] = useState(0);

    const [assunto, setAssunto] = useState('Suporte');
    const [status, setStatus] = useState('Aberto');
    const [complemento, setComplemento] = useState('');
    const [idCustomer, setIdCustomer] = useState(false);

    useEffect(() => {
        async function loadCustomers() {
            await firebase.firestore().collection('customers')
                .get()
                .then(snapshot => {
                    let arr = [];
                    snapshot.forEach(doc => {
                        arr.push({
                            id: doc.id,
                            nomeFantasia: doc.data().nomeFantasia
                        })
                    })

                    if (arr.length === 0) {
                        toast.info('Nenhuma empresa encontrada');
                        setCustomers([{
                            id: '1',
                            nomeFantasia: ''
                        }]);
                        setLoadCustomers(false);
                    }

                    setCustomers(arr);
                    setLoadCustomers(false);

                    if (id) {
                        loadId(arr);
                    }

                })
                .catch(e => {
                    toast.error('Deu algum erro');
                    setLoadCustomers(false);
                    setCustomers([{
                        id: '1',
                        nomeFantasia: ''
                    }]);
                })
        }

        loadCustomers();

    }, [id])

    async function loadId(arr) {
        await firebase.firestore().collection('chamados')
            .doc(id)
            .get()
            .then(snapshot => {
                setAssunto(snapshot.data().subject);
                setStatus(snapshot.data().status);
                setComplemento(snapshot.data().complement);

                let index = arr.findIndex(item => item.id === snapshot.data().idCustomer);
                setCustomerSelected(index);
                setIdCustomer(true);

            })

            .catch(e => {
                setIdCustomer(false);
                history.push('/error')
            })
    }

    async function handleRegister(e) {
        e.preventDefault();
        setSaving(true);

        // ESTÁ QUERENDO EDITAR
        if (idCustomer) {
            await firebase.firestore().collection('chamados').doc(id)
                .update({
                    customer: customers[customerSelected].nomeFantasia,
                    idCustomer: customers[customerSelected].id,
                    subject: assunto,
                    status: status,
                    complement: complemento,
                    userUid: user.uid
                })
                .then(() => {
                    toast.success('Chamado atualizado!')
                    setComplemento('');
                    setLoadCustomers('');
                    history.push('/dashboard');
                })
                .catch(e => {
                    toast.error('Erro ao registrar')
                })
                setSaving(false);

        } else {
            await firebase.firestore().collection('chamados')
            .add({
                created: new Date(),
                customer: customers[customerSelected].nomeFantasia,
                idCustomer: customers[customerSelected].id,
                subject: assunto,
                status: status,
                complement: complemento,
                userUid: user.uid
            })
            .then(() => {
                toast.success('Chamado criado com sucesso!');
                setComplemento('');
                setCustomerSelected(0);
                setAssunto('Suporte');
            })
            .catch(e => {
                console.log(e)
                toast.error('Algo deu errado :(');
            })
            setSaving(false);
        }

    }

    function handleChangeSelect(e) {
        setAssunto(e.target.value);
    }

    function handleOptionChange(e) {
        setStatus(e.target.value);
    }

    function handleChangeCustomer(e) {
        setCustomerSelected(e.target.value);

    }

    return (
        <div className={saving ? 'savingData' : ''}>
            <Header />
            <div className='content'>
                <Title name='Novo chamado'>
                    <BiCommentAdd size={24} />
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleRegister}>

                        <label>Cliente</label>

                        {loadCustomers ?
                            (<input type='text' disabled value='Carregando clientes...' />)
                            :
                            customers.length === 0 ?
                                (<input type='text' disabled value='Não há clientes cadastrados' />)
                                :
                                (<select disabled={id ? true : false} value={customerSelected} onChange={handleChangeCustomer}>
                                    {customers.map((item, i) => {
                                        return (
                                            <option key={item.id} value={i}>
                                                {item.nomeFantasia}
                                            </option>
                                        )
                                    })}
                                </select>)
                        }

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value='Suporte'>Suporte</option>
                            <option value='Visita'>Visita técnica</option>
                            <option value='Financeiro'>Financeiro</option>
                        </select>
                        
                        <span className='status-title'>Status</span>
                        <div className='status'>
                            <label>Aberto
                                <input
                                    type='radio'
                                    name='radio'
                                    value='Aberto'
                                    onChange={handleOptionChange}
                                    checked={status === 'Aberto'}
                                />
                            </label>

                            <label>Em progresso
                                <input
                                    type='radio'
                                    name='radio'
                                    value='Progresso'
                                    onChange={handleOptionChange}
                                    checked={status === 'Progresso'}
                                />
                            </label>

                            <label>Concluído
                                <input
                                    type='radio'
                                    name='radio'
                                    value='Concluido'
                                    onChange={handleOptionChange}
                                    checked={status === 'Concluido'}
                                />
                            </label>

                        </div>

                        <label>Complemento</label>
                        <textarea value={complemento} onChange={e => setComplemento(e.target.value)} type='text' placeholder='Escreva o problema' />

                        <button type='submit'>Salvar</button>
                    </form>
                </div>

            </div>
        </div>
    )
};
