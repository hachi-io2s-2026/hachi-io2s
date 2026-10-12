import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router'
import { useSesion } from './auth/contexto'
import RutaProtegida, { RutaCliente } from './auth/RutaProtegida'
import Navbar from './components/Navbar'
import Configuracion from './panel/configuracion/Configuracion'
import Daycare from './panel/daycare/Daycare'
import Hospedaje from './panel/hospedaje/Hospedaje'
import Hoy from './panel/Hoy'
import PanelLayout from './panel/PanelLayout'
import PropietarioDetalle from './panel/propietarios/PropietarioDetalle'
import Propietarios from './panel/propietarios/Propietarios'
import NuevaReservacion from './panel/reservaciones/NuevaReservacion'
import ReservacionDetalle from './panel/reservaciones/ReservacionDetalle'
import Reservaciones from './panel/reservaciones/Reservaciones'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Registro from './pages/Registro'
import InicioCliente from './portal/InicioCliente'
import PerrosCliente from './portal/PerrosCliente'
import PortalLayout from './portal/PortalLayout'
import ReservaClienteDetalle from './portal/ReservaClienteDetalle'
import ReservasCliente from './portal/ReservasCliente'

// Pagina informativa publica
function PaginaPublica() {
  const { usuario, cliente } = useSesion()
  const navegar = useNavigate()

  useEffect(() => {
    document.title = "HACHI · Hotel canino";
  }, []);

  // Con sesion iniciada, los botones llevan a su espacio: el panel (personal) o la cuenta (cliente)
  const entrar = () => navegar(usuario ? '/panel' : cliente ? '/mi-cuenta' : '/login')
  const texto = usuario ? 'Ir al panel' : cliente ? 'Mi cuenta' : 'Iniciar sesión'

  return (
    <>
      <Navbar onIniciarSesion={entrar} textoBoton={texto} />
      <Inicio onIniciarSesion={entrar} />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPublica />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Portal del cliente */}
      <Route element={<RutaCliente />}>
        <Route path="/mi-cuenta" element={<PortalLayout />}>
          <Route index element={<InicioCliente />} />
          <Route path="perros" element={<PerrosCliente />} />
          <Route path="reservas" element={<ReservasCliente />} />
          <Route path="reservas/:id" element={<ReservaClienteDetalle />} />
          <Route path="reservar" element={<NuevaReservacion modo="cliente" />} />
          <Route path="*" element={<Navigate to="/mi-cuenta" replace />} />
        </Route>
      </Route>

      <Route element={<RutaProtegida />}>
        <Route path="/panel" element={<PanelLayout />}>
          <Route index element={<Hoy />} />

          <Route path="reservaciones" element={<Reservaciones />} />
          <Route path="reservaciones/nueva" element={<NuevaReservacion />} />
          <Route path="reservaciones/:id" element={<ReservacionDetalle />} />

          <Route path="hospedaje" element={<Hospedaje />} />
          <Route path="daycare" element={<Daycare />} />

          <Route path="propietarios" element={<Propietarios />} />
          <Route path="propietarios/:id" element={<PropietarioDetalle />} />

          {/* Solo administradores */}
          <Route element={<RutaProtegida roles={['ADMIN']} />}>
            <Route path="configuracion" element={<Configuracion />} />
          </Route>

          <Route path="*" element={<Navigate to="/panel" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
