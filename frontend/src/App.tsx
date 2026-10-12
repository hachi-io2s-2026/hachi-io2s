import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router'
import { useSesion } from './auth/contexto'
import RutaProtegida from './auth/RutaProtegida'
import Navbar from './components/Navbar'
import InicioPanel from './panel/InicioPanel'
import ModuloPendiente from './panel/ModuloPendiente'
import { MODULOS } from './panel/modulos'
import PanelLayout from './panel/PanelLayout'
import Inicio from './pages/Inicio'
import Login from './pages/Login'

// Pagina informativa publica
function PaginaPublica() {
  const { usuario } = useSesion()
  const navegar = useNavigate()

  useEffect(() => {
    document.title = 'HACHI · Hotel canino'
  }, [])

  // Con sesion iniciada, los botones llevan directo al panel
  const entrar = () => navegar(usuario ? '/panel' : '/login')

  return (
    <>
      <Navbar onIniciarSesion={entrar} textoBoton={usuario ? 'Ir al panel' : 'Iniciar sesión'} />
      <Inicio onIniciarSesion={entrar} />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPublica />} />
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida />}>
        <Route path="/panel" element={<PanelLayout />}>
          <Route index element={<InicioPanel />} />
          {MODULOS.filter((m) => m.ruta !== '/panel').map((m) => (
            <Route
              key={m.ruta}
              path={m.ruta.replace('/panel/', '')}
              element={
                m.roles ? (
                  <RutaProtegida roles={m.roles} />
                ) : (
                  <ModuloPendiente modulo={m} />
                )
              }
            >
              {m.roles && <Route index element={<ModuloPendiente modulo={m} />} />}
            </Route>
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
