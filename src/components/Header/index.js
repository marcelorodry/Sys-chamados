import './header.css';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import defaultAvatar from '../../assets/avatar.png';
import { Link } from 'react-router-dom';
import { BiHome, BiUserPlus, BiCog, BiLogOutCircle } from "react-icons/bi";


export default function Header() {

    const { user, signOut } = useContext(AuthContext);

    return (
        <div className='sidebar'>
            <div>
                <img src={user.avatarUrl === null ? defaultAvatar : user.avatarUrl} alt='Foto de perfil' />
            </div>

            <Link to='/dashboard'>
                <BiHome size={24} />
                <span>Chamados</span>
            </Link>

            <Link to='/customers'>
                <BiUserPlus size={24} />
                <span>Clientes</span>
            </Link>

            <Link to='/profile'>
                <BiCog size={24} />
                <span>Configurações</span>
            </Link>

            <button onClick={signOut}>
                <BiLogOutCircle size={20}/>
                <span>SignOut</span>
            </button>
        </div>
    )
};
