'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const modulos = [
  {
    nombre: 'Inventario',
    ruta: '/inventario',
    icono: '📦',
    descripcion: 'Control de productos y stock',
  },
  {
    nombre: 'Clientes',
    ruta: '/clientes',
    icono: '👥',
    descripcion: 'Facturación y gestión de clientes',
  },
  {
    nombre: 'Proveedores',
    ruta: '/proveedores',
    icono: '🚚',
    descripcion: 'Control de proveedores',
  },
  {
    nombre: 'Personal',
    ruta: '/personal',
    icono: '🧑‍💼',
    descripcion: 'Gestión de empleados y puestos',
  },
  {
    nombre: 'Ajustes',
    ruta: '/ajustes',
    icono: '⚙️',
    descripcion: 'Configuración general del sistema',
  },
  {
    nombre: 'Contabilidad',
    ruta: '/contabilidad',
    icono: '📊',
    descripcion: 'Relación financiera y estados',
  },
  {
    nombre: 'CRM',
    ruta: '/crm',
    icono: '📈',
    descripcion: 'Gestión de clientes y ventas',
  },
  {
    nombre: 'Suscripciones',
    ruta: '/suscripciones',
    icono: '🔄',
    descripcion: 'Planes, pagos y renovaciones',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem('miniERPAuth')
    if (auth !== 'true') {
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    function manejarClickFuera(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false)
      }
    }

    document.addEventListener('mousedown', manejarClickFuera)
    return () => {
      document.removeEventListener('mousedown', manejarClickFuera)
    }
  }, [])

  function cerrarSesion() {
    localStorage.removeItem('miniERPAuth')
    router.push('/')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#EAECEF',
        fontFamily: 'Arial, sans-serif',
        color: '#1F2937',
      }}
    >
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D8DEE6',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
        }}
      >
        <div
          style={{
            maxWidth: '1600px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/logo-lud.png"
            alt="ERP LUD"
            style={{
              width: '220px',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />

          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={{
                height: '28px',
                padding: '0 9px',
                borderRadius: '8px',
                border: '1px solid #BFC7D1',
                backgroundColor: '#F5F6F7',
                color: '#5B6673',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
              }}
            >
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#A2A3A3',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                A
              </span>
              Admin
              <span style={{ fontSize: '9px', color: '#7A828A' }}>▾</span>
            </button>

            {menuAbierto && (
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  right: 0,
                  width: '185px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D8DEE6',
                  borderRadius: '8px',
                  boxShadow: '0 14px 30px rgba(15,23,42,0.12)',
                  overflow: 'hidden',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: '10px 13px',
                    borderBottom: '1px solid #EEF2F7',
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: '#3F4A56',
                      fontSize: '12px',
                    }}
                  >
                    Admin
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#7A828A',
                      marginTop: '3px',
                    }}
                  >
                    Usuario del sistema
                  </div>
                </div>

                <Link
                  href="/documentacion"
                  style={{
                    display: 'block',
                    padding: '10px 13px',
                    textDecoration: 'none',
                    color: '#3F4A56',
                    fontSize: '12px',
                    borderBottom: '1px solid #EEF2F7',
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  Documentación
                </Link>

                <Link
                  href="/soporte"
                  style={{
                    display: 'block',
                    padding: '10px 13px',
                    textDecoration: 'none',
                    color: '#3F4A56',
                    fontSize: '12px',
                    borderBottom: '1px solid #EEF2F7',
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  Soporte
                </Link>

                <Link
                  href="/preferencias"
                  style={{
                    display: 'block',
                    padding: '10px 13px',
                    textDecoration: 'none',
                    color: '#3F4A56',
                    fontSize: '12px',
                    borderBottom: '1px solid #EEF2F7',
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  Preferencias
                </Link>

                <button
                  onClick={cerrarSesion}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 13px',
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#00487A',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <main
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '20px 24px 32px 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 220px))',
            gap: '18px',
            justifyContent: 'start',
          }}
        >
          {modulos.map((modulo) => (
            <Link
              key={modulo.nombre}
              href={modulo.ruta}
              style={{
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D9DEE5',
                  borderRadius: '20px',
                  padding: '18px',
                  minHeight: '130px',
                  boxShadow: '0 10px 28px rgba(15,23,42,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
              >
                <div
                  style={{
                    width: '41px',
                    height: '41px',
                    borderRadius: '14px',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '19px',
                  }}
                >
                  {modulo.icono}
                </div>

                <div>
                  <h3
                    style={{
                      margin: '14px 0 6px 0',
                      fontSize: '15px',
                      color: '#111827',
                    }}
                  >
                    {modulo.nombre}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: '#6B7280',
                      fontSize: '11px',
                      lineHeight: 1.4,
                    }}
                  >
                    {modulo.descripcion}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
