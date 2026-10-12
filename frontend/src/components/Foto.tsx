import { IconoCamara } from './Iconos'
import './Foto.css'

interface Props {
  // Ruta de la imagen, por ejemplo "/fotos/patio.jpg". Si esta vacia se muestra el espacio reservado.
  src?: string
  // Descripcion de la foto (se usa como texto alternativo y como etiqueta del espacio reservado)
  descripcion: string
  className?: string
}

export default function Foto({ src, descripcion, className = '' }: Props) {
  return (
    <div className={`foto ${className}`}>
      {src ? (
        <img src={src} alt={descripcion} loading="lazy" />
      ) : (
        <div className="foto-vacia" role="img" aria-label={`Espacio para foto: ${descripcion}`}>
          <IconoCamara width={22} height={22} />
          <span>{descripcion}</span>
        </div>
      )}
    </div>
  )
}
