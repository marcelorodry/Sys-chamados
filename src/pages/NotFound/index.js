import './notfound.css';
import Header from '../../components/Header';

export default function NotFound() {
    return(
        <div>
            <Header />
            <div className='notfound'>
                <h1>Página não<br/>encontrada :(</h1>
                <span>404</span>
            </div>
        </div>
    )
};
