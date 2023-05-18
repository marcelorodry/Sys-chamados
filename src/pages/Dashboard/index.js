import { useState, useContext, useEffect, useCallback } from "react"
import Header from "../../components/Header";
import Title from '../../components/Title'
import Modal from "../../components/Modal";
import firebase from "../../services/firebaseConnection";
import { BiChat, BiPlus, BiSearch, BiEdit } from "react-icons/bi";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";
import { toast } from "react-toastify";
import { format } from 'date-fns';
import './dashboard.css';


const listRef = firebase.firestore().collection('chamados').orderBy('created', 'desc');

export default function Dashboard() {

    const { user } = useContext(AuthContext);
    const [chamados, setChamados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const [lastDocs, setLastDocs] = useState();
    const [showPostModal, setShowPostModal] = useState(false);
    const [itemDetail, setItemDetail] = useState();

    useEffect(() => {
        loadChamados();

        return () => {

        }
    }, [])

    async function loadChamados() {
        await listRef.limit(5)
            .get()
            .then(snapshot => {
                updateState(snapshot);
            })
            .catch(e => {
                toast.error('Algo deu errado :(');
                setLoadingMore(false);
            })

        setLoading(false);

    }

    async function updateState(snapshot) {
        const isCollectionEmpty = snapshot.size === 0;
        if (!isCollectionEmpty) {
            let arr = [];

            snapshot.forEach(item => {
                arr.push({
                    id: item.id,
                    assunto: item.data().subject,
                    cliente: item.data().customer,
                    idCliente: item.data().idCustomer,
                    complemento: item.data().complement,
                    dataCriacao: item.data().created,
                    dataCriacaoFormatada: format(item.data().created.toDate(), 'dd/MM/yyyy'),
                    status: item.data().status
                })
            });

            let lastDoc = snapshot.docs[snapshot.docs.length - 1] // pegando último documento buscado
            setChamados([...chamados, ...arr]);
            setLastDocs(lastDoc);
        } else {
            setIsEmpty(true);
        }
        setLoadingMore(false);
    }

    function statusColor(chamado) {
        switch (chamado.status) {
            case 'Aberto': return '#5cb85c';
            case 'Progresso': return '#f6a935';
            case 'Concluido': return '#ccc'
        }
    }

    if (loading) {
        return (
            <div>
                <Header />
                <div className="content">
                    <Title name='Atendimentos'>
                        <BiChat size={24} />
                    </Title>

                    <div className="container dashboard">
                        <span>Buscando chamados...</span>
                    </div>
                </div>
            </div>
        )
    }

    async function handleMore() {
        setLoadingMore(true);
        await listRef.startAfter(lastDocs).limit(3)
        .get()
        .then(snapshot => {
            updateState(snapshot);
        })

        .catch(e => {
            toast.error('Algo deu errado :(')
        })

    }

    function togglePostModal(item) {
        setShowPostModal(!showPostModal);
        setItemDetail(item);
    }

    return (
        <div>
            <Header />
            <div className='content'>
                <Title name='Atendimentos'>
                    <BiChat size={24} />
                </Title>

                {chamados.length === 0 ?
                    (
                        <div className="container dashboard">
                            <span>Nenhum chamado registrado.</span>

                            <Link to='/new' className="new">
                                <BiPlus size={20} color='#fff' />
                                Novo chamado
                            </Link>
                        </div>
                    )

                    : (

                        <>
                            <Link to='/new' className="new">
                                <BiPlus size={20} color='#fff' />
                                Novo chamado
                            </Link>

                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">Cliente</th>
                                        <th scope="col">Assunto</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Criado em</th>
                                        <th scope="col">#</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {chamados.map((chamado, index) => {
                                        return (
                                            <tr key={index}>
                                                <td data-label='Cliente'>{chamado.cliente}</td>
                                                <td data-label='Assunto'>{chamado.assunto}</td>
                                                <td data-label='Status'>
                                                    <span className="badge" style={{ backgroundColor: statusColor(chamado), color: '#fff' }}>
                                                        {chamado.status}
                                                    </span>
                                                </td>
                                                <td data-label='Cadastrado'>{chamado.dataCriacaoFormatada}</td>
                                                <td data-label='#'>
                                                    <div>
                                                        <button onClick={() => togglePostModal(chamado)} className="action" style={{ backgroundColor: '#3583f6' }}>
                                                            <BiSearch color="#fff" size={18} />
                                                        </button>

                                                        <Link to={`/new/${chamado.id}`} className="action" style={{ backgroundColor: '#f6a935' }}>
                                                            <BiEdit color="#fff" size={18} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {loadingMore && <h3 style={{textAlign: 'center', marginTop: 10}}>Carregando dados...</h3>}
                            {!loadingMore && !isEmpty && <button className="btn-more" onClick={handleMore}>Carregar mais</button>}
                        </>

                    )
                }
            </div>

                {showPostModal && (
                    <Modal 
                        conteudo={ itemDetail }
                        close={ togglePostModal }
                        statusColor={ statusColor }
                    />
                )}

        </div>
    )
};
