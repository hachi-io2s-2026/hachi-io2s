import { useEffect, useState } from 'react'
import { mensajeError, verificarBackend } from './api/client'

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'ok'; mensaje: string }
  | { tipo: 'error'; mensaje: string }

function App() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [intento, setIntento] = useState(0)

  // Consulta /api/health al abrir la pagina y en cada reintento
  useEffect(() => {
    let vigente = true
    verificarBackend().then(
      (mensaje) => vigente && setEstado({ tipo: 'ok', mensaje }),
      (error) => vigente && setEstado({ tipo: 'error', mensaje: mensajeError(error) }),
    )
    return () => {
      vigente = false
    }
  }, [intento])

  const reintentar = () => {
    setEstado({ tipo: 'cargando' })
    setIntento((n) => n + 1)
  }

  return (
    <main className="portada">
      <img src="/logo.svg" alt="Logo de HACHI" className="logo" width="96" height="96" />
      <h1>HACHI</h1>


      {estado.tipo === 'error' && (
        <button type="button" onClick={reintentar}>
          Reintentar
        </button>
      )}

    </main>
  )
}

export default App
