'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FacturacionTab from '../../components/clientes/FacturacionTab'
import RecibosTab from '../../components/clientes/RecibosTab'
import NotasCreditoTab from '../../components/clientes/NotasCreditoTab'
import ClientesTab from '../../components/clientes/ClientesTab'
import ReportesTab from '../../components/clientes/ReportesTab'
import ConfiguracionesTab from '../../components/clientes/ConfiguracionesTab'
import ReporteProductos from '../../components/clientes/inventario/ReporteProductos'

type PestanaActiva =
  | 'facturacion'
  | 'recibos'
  | 'notasCredito'
  | 'productos'
  | 'clientes'
  | 'reportes'
  | 'configuraciones'

export default function ClientesPage() {
  const router = useRouter()
  const [pestanaActiva, setPestanaActiva] = useState<PestanaActiva>('facturacion')
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

  function estiloPestana(activa: boolean) {
    return {
      padding: '14px 18px',
      cursor: 'pointer',
      backgroundColor: activa ? '#005099' : '#FFFFFF',
      color: activa ? '#FFFFFF' : '#3F4A56',
      border: `1px solid ${activa ? '#005099' : '#D8DEE6'}`,
      borderRadius: '0',
      fontWeight: 'bold' as const,
      marginRight: '0',
      marginBottom: '0',
      boxShadow: activa
        ? '0 8px 18px rgba(15,23,42,0.10)'
        : '0 2px 6px rgba(0,0,0,0.03)',
      fontSize: '12px',
      minWidth: '120px',
      whiteSpace: 'nowrap' as const,
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F2F4F7',
        fontFamily: 'Arial, sans-serif',
        color: '#1F2933',
      }}
    >
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D8DEE6',
          boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
        }}
      >
        <div
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '0 18px',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: '140px 1fr 90px',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              minWidth: 0,
            }}
          >
            <img
              src="/logo-lud.png"
              alt="ERP LUD"
              style={{
                width: '112px',
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          </Link>

          <div />

          <div
            ref={menuRef}
            style={{
              position: 'relative',
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
      </header>

      <main
        style={{
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '18px 20px 32px 20px',
          boxSizing: 'border-box',
          fontSize: '12px',
        }}
      >
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
            fontSize: '12px',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: '#005099',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Dashboard
          </Link>
          <span style={{ color: '#A2A3A3' }}>›</span>
          <span style={{ color: '#7A828A' }}>Clientes</span>
        </nav>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D8DEE6',
            borderRadius: '8px',
            overflowX: 'auto',
            overflowY: 'hidden',
            marginBottom: '14px',
            boxShadow: '0 3px 10px rgba(15,23,42,0.04)',
          }}
        >
          <button
            type="button"
            onClick={() => setPestanaActiva('facturacion')}
            style={estiloPestana(pestanaActiva === 'facturacion')}
          >
            Facturación
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('recibos')}
            style={estiloPestana(pestanaActiva === 'recibos')}
          >
            Recibos
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('notasCredito')}
            style={estiloPestana(pestanaActiva === 'notasCredito')}
          >
            Notas de Crédito
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('productos')}
            style={estiloPestana(pestanaActiva === 'productos')}
          >
            Productos
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('clientes')}
            style={estiloPestana(pestanaActiva === 'clientes')}
          >
            Clientes
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('reportes')}
            style={estiloPestana(pestanaActiva === 'reportes')}
          >
            Reportes
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('configuraciones')}
            style={estiloPestana(pestanaActiva === 'configuraciones')}
          >
            Configuraciones
          </button>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #BFC7D1',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
          }}
        >
          {pestanaActiva === 'facturacion' && (
            <FacturacionTab irACrearCliente={() => setPestanaActiva('clientes')} />
          )}
          {pestanaActiva === 'recibos' && (
            <RecibosTab irACrearCliente={() => setPestanaActiva('clientes')} />
          )}
          {pestanaActiva === 'notasCredito' && (
            <NotasCreditoTab irACrearCliente={() => setPestanaActiva('clientes')} />
          )}
          {pestanaActiva === 'productos' && <ReporteProductos />}
          {pestanaActiva === 'clientes' && <ClientesTab />}
          {pestanaActiva === 'reportes' && <ReportesTab />}
          {pestanaActiva === 'configuraciones' && <ConfiguracionesTab />}
        </div>
      </main>
    </div>
  )
}
