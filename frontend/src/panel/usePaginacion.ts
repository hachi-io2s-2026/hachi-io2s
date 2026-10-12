import { useState } from 'react'

// Paginacion en el navegador para listas que ya llegaron completas de la API.
// "clave" identifica los filtros actuales: si cambia, se vuelve a la pagina 1.
export function usePaginacion<T>(items: T[] | null | undefined, clave = '', porPagina = 10) {
  const [estado, setEstado] = useState({ clave, pagina: 1 })
  const lista = items ?? []
  const paginas = Math.max(1, Math.ceil(lista.length / porPagina))
  const pedida = estado.clave === clave ? estado.pagina : 1
  // Si la lista se achica, no quedarse en una pagina que ya no existe
  const pagina = Math.min(pedida, paginas)
  const inicio = (pagina - 1) * porPagina

  return {
    pagina,
    paginas,
    total: lista.length,
    desde: lista.length === 0 ? 0 : inicio + 1,
    hasta: Math.min(inicio + porPagina, lista.length),
    visibles: lista.slice(inicio, inicio + porPagina),
    irA: (p: number) => setEstado({ clave, pagina: Math.min(Math.max(1, p), paginas) }),
  }
}
