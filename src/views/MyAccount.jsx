import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DatosForm from '../components/MyAccount/DatosForm';
import Privacidad from '../components/MyAccount/Privacidad';
import useAuthBase from '../hooks/useBaseAuth';
import EventosTabla from '../components/MyAccount/EventosTabla';
import ArchivosUser from '../components/MyAccount/ArchivosUser';
import UseAuth from '../hooks/useAuth';
const MyAccount = () => {
    const { user, mutate } = useAuthBase();
    const [tab, setTab] = useState('datos');
    const { logout } = UseAuth({ middleware: 'guest' });

    return (
        <div className="max-w-4xl mt-20 mx-auto p-6 bg-[#fefbf5] min-h-screen">
            <div className="flex justify-left gap-5 items-center mb-6">
                <h1 className="text-3xl font-bold text-[#008DD2]">Mi Cuenta</h1>
                {!!user?.admin && (
                    <Link
                        to="/admin-dash"
                        className="bg-[#008DD2] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#0072ad] transition"
                    >
                        Ir al panel admin
                    </Link>
                )}

                {user && (
                    <button
                        onClick={logout}
                        className="
      flex items-center gap-2
      px-4 py-2
      rounded-full
      text-sm font-medium
      text-red-600
      border border-red-200
      bg-white
      hover:bg-red-50
      hover:border-red-300
      transition
      cursor-pointer
    "
                    >
                        Cerrar sesión
                    </button>
                )}

            </div>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setTab('datos')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${tab === 'datos' ? 'bg-[#008DD2] text-white' : 'bg-white border border-[#008DD2] text-[#008DD2]'}`}
                >
                    Datos
                </button>
                <button
                    onClick={() => setTab('citas')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${tab === 'citas' ? 'bg-[#008DD2] text-white' : 'bg-white border border-[#008DD2] text-[#008DD2]'}`}
                >
                    Citas
                </button>
                <button
                    onClick={() => setTab('archivos')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${tab === 'archivos' ? 'bg-[#008DD2] text-white' : 'bg-white border border-[#008DD2] text-[#008DD2]'}`}
                >
                    Archivos
                </button>
                <button
                    onClick={() => setTab('privacidad')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${tab === 'privacidad' ? 'bg-[#008DD2] text-white' : 'bg-white border border-[#008DD2] text-[#008DD2]'}`}
                >
                    Privacidad
                </button>
            </div>

            <div className="bg-white shadow rounded-xl p-6">
                {tab === 'datos' && <DatosForm user={user} mutate={mutate} />}
                {tab === 'citas' && <EventosTabla user={user} />}
                {tab === 'archivos' && <ArchivosUser user={user} />}
                {tab === 'privacidad' && <Privacidad user={user} />}
            </div>
        </div>
    );
};

export default MyAccount;
