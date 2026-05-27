'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function iniciarSesion(e: FormEvent) {
    e.preventDefault()

    if (correo === 'admin@proyecto.com' && password === 'admin1986') {
      localStorage.setItem('miniERPAuth', 'true')
      router.push('/dashboard')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, #061A40 0%, #0A4D68 55%, #088395 100%)',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '34px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '18px',
          }}
        >
          <img
            src="/logo-lud.png"
            alt="ERP LUD"
            style={{
              width: '260px',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </div>

        <h2
          style={{
            textAlign: 'center',
            color: '#0A4D68',
            marginBottom: '10px',
            fontSize: '28px',
            fontWeight: 'normal',
          }}
        >
          Nombre de Empresa
        </h2>

        <p
          style={{
            textAlign: 'center',
            color: '#3A4A5A',
            marginBottom: '24px',
          }}
        >
          Iniciar sesión
        </p>

        <form onSubmit={iniciarSesion}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#3A4A5A' }}>Correo electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@empresa.com"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                borderRadius: '8px',
                border: '1px solid #BFC7D1',
                color: '#000000',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                fontSize: '15px',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#3A4A5A' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                borderRadius: '8px',
                border: '1px solid #BFC7D1',
                color: '#000000',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                fontSize: '15px',
              }}
              required
            />
          </div>

          {error && (
            <p
              style={{
                color: '#C62828',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#0A4D68',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )
}