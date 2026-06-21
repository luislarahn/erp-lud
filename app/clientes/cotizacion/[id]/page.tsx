'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

type Cotizacion = {
  id_cotizacion: number
  id_cliente: number | null
  numero_cotizacion: string
  correlativo: number
  nombre_cliente: string
  direccion: string | null
  correo: string | null
  telefono: string | null
  rtn: string | null
  fecha_cotizacion: string
  subtotal: number
  impuesto_total: number
  total_cotizacion: number
  estado: string
  importe_exonerado: number | null
  importe_exento: number | null
  importe_gravado_15: number | null
  importe_gravado_18: number | null
  isv_15: number | null
  isv_18: number | null
  observaciones: string | null
}

type DetalleCotizacion = {
  id_detalle: number
  id_cotizacion: number
  id_producto: number
  descripcion_producto: string
  cantidad: number
  precio_unitario: number
  porcentaje_impuesto: number
  subtotal_linea: number
  monto_impuesto_linea: number
  total_linea: number
  tipo_impuesto: string | null
}

function moneda(valor: number | null | undefined) {
  const numero = Number(valor || 0)

  return `L ${numero.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function fechaLocal(fecha: string | null | undefined) {
  if (!fecha) return ''

  const partes = fecha.split('-')
  if (partes.length !== 3) return fecha

  return `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`
}

function obtenerMensajeError(error: any) {
  if (!error) return 'Ocurrió un error inesperado.'
  if (typeof error === 'string') return error
  if (error.message) return error.message
  if (error.details) return error.details
  if (error.hint) return error.hint

  try {
    return JSON.stringify(error)
  } catch {
    return 'Ocurrió un error inesperado.'
  }
}

export default function CotizacionPage() {
  const params = useParams()
  const router = useRouter()

  const id = params?.id ? String(params.id) : ''

  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [detalle, setDetalle] = useState<DetalleCotizacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (id) {
      cargarCotizacion()
    }
  }, [id])

  async function cargarCotizacion() {
    setCargando(true)
    setMensaje('')

    try {
      const { data: cotizacionData, error: errorCotizacion } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id_cotizacion', Number(id))
        .single()

      if (errorCotizacion) throw errorCotizacion

      const { data: detalleData, error: errorDetalle } = await supabase
        .from('cotizacion_detalle')
        .select('*')
        .eq('id_cotizacion', Number(id))
        .order('id_detalle', { ascending: true })

      if (errorDetalle) throw errorDetalle

      setCotizacion(cotizacionData as Cotizacion)
      setDetalle((detalleData || []) as DetalleCotizacion[])
    } catch (error: any) {
      console.log('Error al cargar cotización:', error)
      setMensaje(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#F2F4F7',
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
          color: '#1F2933',
        }}
      >
        Cargando cotización...
      </div>
    )
  }

  if (mensaje || !cotizacion) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#020617',
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            border: '1px solid #DC2626',
            borderRadius: '14px',
            padding: '22px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
          }}
        >
          {mensaje || 'No se encontró la cotización.'}
        </div>

        <button
          type="button"
          onClick={() => router.push('/clientes')}
          style={{
            marginTop: '16px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#334155',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Volver a Clientes
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F2F4F7',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#1F2933',
      }}
    >
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .no-print {
              display: none !important;
            }

            .documento {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }

            @page {
              size: letter;
              margin: 12mm;
            }
          }
        `}
      </style>

      <div
        className="no-print"
        style={{
          maxWidth: '980px',
          margin: '0 auto 16px auto',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/clientes')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #BFC7D1',
            backgroundColor: '#FFFFFF',
            color: '#3F4A56',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Volver a Clientes
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #005099',
            backgroundColor: '#005099',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Imprimir / PDF
        </button>
      </div>

      <main
        className="documento"
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D8DEE6',
          borderRadius: '12px',
          padding: '34px',
          boxShadow: '0 10px 30px rgba(15,23,42,0.10)',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '24px',
            borderBottom: '2px solid #1F2933',
            paddingBottom: '18px',
            marginBottom: '22px',
          }}
        >
          <div>
            <img
              src="/logo-lud.png"
              alt="ERP LUD"
              style={{
                width: '130px',
                height: 'auto',
                marginBottom: '14px',
              }}
            />

            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                color: '#1F2933',
                fontWeight: 'bold',
              }}
            >
              ERP LUD
            </h1>

            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: '12px',
                color: '#5B6673',
                lineHeight: 1.5,
              }}
            >
              Documento no fiscal. Esta cotización no sustituye factura.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '26px',
                color: '#005099',
                fontWeight: 'bold',
                letterSpacing: '0.04em',
              }}
            >
              COTIZACIÓN
            </h2>

            <div
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: '#3F4A56',
                lineHeight: 1.7,
              }}
            >
              <div>
                <strong>N.º:</strong> {cotizacion.numero_cotizacion}
              </div>
              <div>
                <strong>Fecha:</strong> {fechaLocal(cotizacion.fecha_cotizacion)}
              </div>
              <div>
                <strong>Estado:</strong> {cotizacion.estado}
              </div>
            </div>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              border: '1px solid #D8DEE6',
              borderRadius: '10px',
              padding: '14px',
              backgroundColor: '#F8FAFC',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                color: '#1F2933',
                fontWeight: 'bold',
              }}
            >
              Cliente
            </h3>

            <div style={{ fontSize: '12px', color: '#3F4A56', lineHeight: 1.7 }}>
              <div>
                <strong>Nombre:</strong> {cotizacion.nombre_cliente}
              </div>
              <div>
                <strong>RTN:</strong> {cotizacion.rtn || '-'}
              </div>
              <div>
                <strong>Dirección:</strong> {cotizacion.direccion || '-'}
              </div>
              <div>
                <strong>Teléfono:</strong> {cotizacion.telefono || '-'}
              </div>
              <div>
                <strong>Correo:</strong> {cotizacion.correo || '-'}
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px solid #D8DEE6',
              borderRadius: '10px',
              padding: '14px',
              backgroundColor: '#F8FAFC',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                color: '#1F2933',
                fontWeight: 'bold',
              }}
            >
              Información del documento
            </h3>

            <div style={{ fontSize: '12px', color: '#3F4A56', lineHeight: 1.7 }}>
              <div>
                <strong>Tipo:</strong> Cotización
              </div>
              <div>
                <strong>Número interno:</strong> {cotizacion.numero_cotizacion}
              </div>
              <div>
                <strong>Validez:</strong> Según condiciones comerciales acordadas.
              </div>
              <div>
                <strong>Condición:</strong> Documento preliminar no fiscal.
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '11px',
            }}
          >
            <thead>
              <tr>
                <th style={th}>Descripción</th>
                <th style={{ ...th, textAlign: 'center' }}>Cantidad</th>
                <th style={{ ...th, textAlign: 'right' }}>Precio</th>
                <th style={{ ...th, textAlign: 'center' }}>Impuesto</th>
                <th style={{ ...th, textAlign: 'right' }}>Subtotal</th>
                <th style={{ ...th, textAlign: 'right' }}>ISV</th>
                <th style={{ ...th, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>

            <tbody>
              {detalle.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...td, textAlign: 'center' }}>
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                detalle.map((item) => (
                  <tr key={item.id_detalle}>
                    <td style={td}>{item.descripcion_producto}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{moneda(item.precio_unitario)}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      {item.tipo_impuesto || `${item.porcentaje_impuesto}%`}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>{moneda(item.subtotal_linea)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{moneda(item.monto_impuesto_linea)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{moneda(item.total_linea)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#5B6673',
              lineHeight: 1.6,
            }}
          >
            <strong>Observaciones:</strong>
            <p style={{ marginTop: '6px' }}>
              {cotizacion.observaciones ||
                'Esta cotización es un documento comercial preliminar. Los precios y condiciones pueden estar sujetos a cambios según disponibilidad, alcance final y aprobación correspondiente.'}
            </p>
          </div>

          <div
            style={{
              border: '1px solid #D8DEE6',
              borderRadius: '10px',
              overflow: 'hidden',
              fontSize: '12px',
            }}
          >
            <FilaTotal label="Importe exonerado" valor={cotizacion.importe_exonerado} />
            <FilaTotal label="Importe exento" valor={cotizacion.importe_exento} />
            <FilaTotal label="Importe gravado 15%" valor={cotizacion.importe_gravado_15} />
            <FilaTotal label="Importe gravado 18%" valor={cotizacion.importe_gravado_18} />
            <FilaTotal label="ISV 15%" valor={cotizacion.isv_15} />
            <FilaTotal label="ISV 18%" valor={cotizacion.isv_18} />
            <FilaTotal label="Subtotal" valor={cotizacion.subtotal} />
            <FilaTotal label="Impuesto total" valor={cotizacion.impuesto_total} />
            <FilaTotal
              label="Total cotización"
              valor={cotizacion.total_cotizacion}
              destacado
            />
          </div>
        </section>

        <footer
          style={{
            marginTop: '34px',
            borderTop: '1px solid #D8DEE6',
            paddingTop: '14px',
            fontSize: '10px',
            color: '#7A828A',
            textAlign: 'center',
          }}
        >
          Cotización generada desde ERP LUD. Este documento no tiene validez fiscal.
        </footer>
      </main>
    </div>
  )
}

const th = {
  padding: '9px 8px',
  border: '1px solid #BFC7D1',
  backgroundColor: '#F3F6F8',
  color: '#1F2933',
  fontWeight: 'bold',
  textAlign: 'left' as const,
}

const td = {
  padding: '8px',
  border: '1px solid #D8DEE6',
  color: '#3F4A56',
  verticalAlign: 'top' as const,
}

function FilaTotal({
  label,
  valor,
  destacado = false,
}: {
  label: string
  valor: number | null | undefined
  destacado?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '8px 12px',
        borderBottom: '1px solid #EEF2F7',
        backgroundColor: destacado ? '#EEF5FB' : '#FFFFFF',
        color: destacado ? '#00487A' : '#3F4A56',
        fontWeight: destacado ? 'bold' : 400,
      }}
    >
      <span>{label}</span>
      <span>{moneda(valor)}</span>
    </div>
  )
}
