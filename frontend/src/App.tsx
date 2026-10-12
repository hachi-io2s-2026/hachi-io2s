import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'

function App() {
  // El login se conectara aqui en el siguiente paso
  const irAlLogin = undefined

  return (
    <>
      <Navbar onIniciarSesion={irAlLogin} />
      <Inicio onIniciarSesion={irAlLogin} />
    </>
  )
}

export default App
