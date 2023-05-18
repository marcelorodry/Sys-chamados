import './modal.css';
import { BiX } from "react-icons/bi";

export default function Modal({ conteudo, close, statusColor }) {
    return(
        <div className='modal'>
            <div className='container'>

                <button className='close-btn' onClick={close}>
                    <BiX size={24} />
                </button>

                <h2>Detalhes do chamado</h2>
                <span className='chamado-data'>{conteudo.dataCriacaoFormatada}</span>

                <div className='row'>
                        <span>
                            Cliente: <a>{conteudo.cliente}</a>
                        </span>

                        <span>
                            Assunto: <a>{conteudo.assunto}</a>
                        </span>

                        <span>
                            Status: <a className='row-badge' style={{ backgroundColor: statusColor(conteudo), color: '#fff' }}>{conteudo.status}</a>
                        </span>

                    {conteudo.complemento !== '' && (
                        <>
                            <h3>Complemento</h3>
                            <p>{conteudo.complemento}</p>
                        </>
                    )}

                </div>

            </div>
        
        <span onClick={close} id='bg-close'></span>
        </div>
    )
};
