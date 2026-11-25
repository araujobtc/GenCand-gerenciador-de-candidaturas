import { useState, type InputHTMLAttributes } from 'react'
import styles from './PasswordInput.module.css'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  inputId?: string
}

function PasswordInput({ inputId, ...inputProps }: PasswordInputProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <span className={styles.wrapper}>
      <input
        {...inputProps}
        id={inputId}
        type={visivel ? 'text' : 'password'}
        className={[styles.input, inputProps.className].filter(Boolean).join(' ')}
      />
      <button
        className={styles.toggle}
        type="button"
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visivel}
        onMouseDown={event => event.preventDefault()}
        onClick={() => setVisivel(atual => !atual)}
      >
        {visivel ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 9 4.8 10 7-.4.9-1.3 2.1-2.6 3.2M6.2 6.2C3.8 7.7 2.4 10 2 12c1 2.2 4.8 7 10 7 1.2 0 2.3-.2 3.3-.7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </span>
  )
}

export default PasswordInput
