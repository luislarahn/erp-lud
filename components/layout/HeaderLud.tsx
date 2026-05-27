'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

type HeaderLudProps = {
  mostrarBotonDashboard?: boolean
}

export default function HeaderLud({
  mostrarBotonDashboard = true,
}: HeaderLudProps) {
  const router = useRouter()

  function cerrarSesion() {
    localStorage.removeItem('miniERPAuth')
    router.push('/')
  }

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '16px 32px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <img
          src="/logo-lud.png"
          alt="ERP LUD"
          style={{
            width: '145px',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {mostrarBotonDashboard && (
            <Link
              href="/dashboard"
              style={{
                textDecoration: 'none',
                padding: '11px 16px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              ← Dashboard
            </Link>
          )}

          <button
            onClick={cerrarSesion}
            style={{
              padding: '11px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#0F766E',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
