'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

type Factura = {
  id_factura: number
  id_correlativo: number | null
  secuencia_fiscal: string
  nombre_cliente: string
  direccion: string | null
  correo: string | null
  telefono: string | null
  rtn: string | null
  fecha_factura: string
  subtotal: number
  importe_exonerado: number | null
  importe_exento: number | null
  importe_gravado_15: number | null
  importe_gravado_18: number | null
  isv_15: number | null
  isv_18: number | null
  impuesto_total: number
  total_factura: number
  estado: string
  descripcion_anulacion: string | null
}

type DetalleFactura = {
  id_detalle: number
  id_factura: number
  descripcion_producto: string
  cantidad: number
  precio_unitario: number
  tipo_impuesto: string | null
  porcentaje_impuesto: number
  subtotal_linea: number
  monto_impuesto_linea: number
  total_linea: number
}

type CorrelativoFiscal = {
  id_correlativo: number
  id_autorizacion: number | null
  codigo_autorizacion: string | null
  tipo_documento: string | null
  secuencia_fiscal: string
  numero: number
}

type AutorizacionFiscal = {
  id_autorizacion: number
  codigo_autorizacion: string
  tipo_documento: string
  nombre_secuencia: string
  prefijo: string
  valor_inicial: number
  valor_maximo: number
  relleno: number
  proximo_numero: number
  fecha_inicio: string
  fecha_expiracion: string
  activo: boolean
}

type NotaCreditoAplicada = {
  id_nota_credito: number
  secuencia_fiscal: string
  descripcion_aplicacion: string | null
  estado: string
}

const DATOS_EMPRESA = {
  nombre: 'Ferretería PROIS',
  eslogan: '“Todo para construir con confianza.”',
  rtn: '08011920048018',
  direccion: 'Colonia Miraflores, Calle principal',
  telefono: '2239-8747',
  correo: 'contacto@prois.com',
}

function numero(valor: number | string | null | undefined) {
  return Number(valor || 0)
}

function moneda(valor: number | string | null | undefined) {
  return `L ${numero(valor).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) return '-'

  const partes = fecha.split('-')
  if (partes.length !== 3) return fecha

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

function formatearSecuencia(prefijo: string, numero: number, relleno: number) {
  return `${prefijo}${String(numero).padStart(relleno, '0')}`
}

function numeroALetrasEntero(numero: number): string {
  const unidades = [
    '',
    'Uno',
    'Dos',
    'Tres',
    'Cuatro',
    'Cinco',
    'Seis',
    'Siete',
    'Ocho',
    'Nueve',
    'Diez',
    'Once',
    'Doce',
    'Trece',
    'Catorce',
    'Quince',
    'Dieciséis',
    'Diecisiete',
    'Dieciocho',
    'Diecinueve',
  ]

  const decenas = [
    '',
    '',
    'Veinte',
    'Treinta',
    'Cuarenta',
    'Cincuenta',
    'Sesenta',
    'Setenta',
    'Ochenta',
    'Noventa',
  ]

  const centenas = [
    '',
    'Ciento',
    'Doscientos',
    'Trescientos',
    'Cuatrocientos',
    'Quinientos',
    'Seiscientos',
    'Setecientos',
    'Ochocientos',
    'Novecientos',
  ]

  if (numero === 0) return 'Cero'
  if (numero === 100) return 'Cien'
  if (numero < 20) return unidades[numero]
  if (numero < 30) {
    if (numero === 20) return 'Veinte'
    return `Veinti${unidades[numero - 20].toLowerCase()}`
  }
  if (numero < 100) {
    const unidad = numero % 10
    const decena = Math.floor(numero / 10)
    return unidad === 0 ? decenas[decena] : `${decenas[decena]} y ${unidades[unidad]}`
  }
  if (numero < 1000) {
    const centena = Math.floor(numero / 100)
    const resto = numero % 100
    return resto === 0 ? centenas[centena] : `${centenas[centena]} ${numeroALetrasEntero(resto)}`
  }
  if (numero < 1000000) {
    const miles = Math.floor(numero / 1000)
    const resto = numero % 1000
    const textoMiles = miles === 1 ? 'Mil' : `${numeroALetrasEntero(miles)} Mil`
    return resto === 0 ? textoMiles : `${textoMiles} ${numeroALetrasEntero(resto)}`
  }

  const millones = Math.floor(numero / 1000000)
  const resto = numero % 1000000
  const textoMillones = millones === 1 ? 'Un Millón' : `${numeroALetrasEntero(millones)} Millones`
  return resto === 0 ? textoMillones : `${textoMillones} ${numeroALetrasEntero(resto)}`
}

function totalEnLetras(total: number | string | null | undefined) {
  const valor = numero(total)
  const enteros = Math.floor(valor)
  const centavos = Math.round((valor - enteros) * 100)

  return `${numeroALetrasEntero(enteros)} Lempiras con ${String(centavos).padStart(2, '0')}/100`
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

export default function FacturaPage() {
  const params = useParams()
  const router = useRouter()

  const idFactura = Number(params?.id)

  const [factura, setFactura] = useState<Factura | null>(null)
  const [detalle, setDetalle] = useState<DetalleFactura[]>([])
  const [correlativo, setCorrelativo] = useState<CorrelativoFiscal | null>(null)
  const [autorizacion, setAutorizacion] = useState<AutorizacionFiscal | null>(null)
  const [notasAplicadas, setNotasAplicadas] = useState<NotaCreditoAplicada[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (idFactura) {
      cargarFactura()
    }
  }, [idFactura])

  async function cargarFactura() {
    setCargando(true)
    setMensaje('')

    try {
      const { data: facturaData, error: facturaError } = await supabase
        .from('facturas')
        .select('*')
        .eq('id_factura', idFactura)
        .single()

      if (facturaError) throw facturaError

      const { data: detalleData, error: detalleError } = await supabase
        .from('factura_detalle')
        .select('*')
        .eq('id_factura', idFactura)
        .order('id_detalle', { ascending: true })

      if (detalleError) throw detalleError

      const { data: notasData, error: notasError } = await supabase
        .from('notas_credito')
        .select('id_nota_credito, secuencia_fiscal, descripcion_aplicacion, estado')
        .eq('id_factura_aplicada', idFactura)
        .eq('estado', 'Aplicada')
        .order('id_nota_credito', { ascending: true })

      if (notasError) throw notasError

      setFactura(facturaData)
      setDetalle(detalleData || [])
      setNotasAplicadas(notasData || [])

      if (facturaData?.id_correlativo) {
        const { data: correlativoData, error: correlativoError } = await supabase
          .from('correlativos_fiscales')
          .select('*')
          .eq('id_correlativo', facturaData.id_correlativo)
          .single()

        if (!correlativoError && correlativoData) {
          setCorrelativo(correlativoData)

          if (correlativoData.id_autorizacion) {
            const { data: autorizacionData, error: autorizacionError } = await supabase
              .from('autorizaciones_fiscales')
              .select('*')
              .eq('id_autorizacion', correlativoData.id_autorizacion)
              .single()

            if (!autorizacionError && autorizacionData) {
              setAutorizacion(autorizacionData)
            }
          }
        }
      }
    } catch (error: any) {
      console.log('Error al cargar factura:', error)
      setMensaje(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }

  function imprimirFactura() {
    if (factura?.secuencia_fiscal) {
      document.title = `Factura ${factura.secuencia_fiscal}`
    }

    window.print()
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
        Cargando factura...
      </div>
    )
  }

  if (mensaje) {
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
          {mensaje}
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

  if (!factura) {
    return null
  }

  const facturaAnulada = factura.estado === 'Anulada'
  const cai = autorizacion?.codigo_autorizacion || correlativo?.codigo_autorizacion || ''
  const rangoInicial = autorizacion
    ? formatearSecuencia(autorizacion.prefijo, autorizacion.valor_inicial, autorizacion.relleno)
    : ''
  const rangoFinal = autorizacion
    ? formatearSecuencia(autorizacion.prefijo, autorizacion.valor_maximo, autorizacion.relleno)
    : ''

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

            .marca-anulada {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            @page {
              size: letter;
              margin: 10mm;
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
          onClick={imprimirFactura}
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
          Imprimir / Guardar PDF
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
          position: 'relative',
          fontSize: '11px',
          lineHeight: 1.35,
        }}
      >
        {facturaAnulada && (
          <div
            className="marca-anulada"
            style={{
              position: 'absolute',
              top: '44%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-18deg)',
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'rgba(220,38,38,0.16)',
              border: '5px solid rgba(220,38,38,0.20)',
              padding: '12px 32px',
              borderRadius: '16px',
              zIndex: 2,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            ANULADA
          </div>
        )}

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
              {DATOS_EMPRESA.nombre}
            </h1>

            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: '#5B6673',
                lineHeight: 1.5,
              }}
            >
              {DATOS_EMPRESA.eslogan}<br />
              RTN: {DATOS_EMPRESA.rtn}<br />
              {DATOS_EMPRESA.direccion}<br />
              Tel: {DATOS_EMPRESA.telefono} | {DATOS_EMPRESA.correo}
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
              FACTURA
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
                <strong>No.:</strong> {factura.secuencia_fiscal}
              </div>
              <div>
                <strong>Fecha:</strong> {formatearFecha(factura.fecha_factura)}
              </div>
              <div>
                <strong>Estado:</strong> {factura.estado || 'Emitida'}
              </div>
            </div>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '18px',
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
              Datos del cliente
            </h3>

            <div style={{ fontSize: '12px', color: '#3F4A56', lineHeight: 1.7 }}>
              <div>
                <strong>Cliente:</strong> {factura.nombre_cliente}
              </div>
              <div>
                <strong>RTN:</strong> {factura.rtn || '-'}
              </div>
              <div>
                <strong>Dirección:</strong> {factura.direccion || '-'}
              </div>
              <div>
                <strong>Cod:</strong>
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
              Información fiscal
            </h3>

            <div style={{ fontSize: '12px', color: '#3F4A56', lineHeight: 1.7 }}>
              <div>
                <strong>C.A.I.:</strong> {cai || '-'}
              </div>
              <div>
                <strong>Fecha Límite de Emisión:</strong>{' '}
                {formatearFecha(autorizacion?.fecha_expiracion)}
              </div>
              <div>
                <strong>Rango Autorizado:</strong>{' '}
                {rangoInicial || '-'} - al - {rangoFinal || '-'}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '18px' }}>
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
                <th style={{ ...th, textAlign: 'center', width: '55px' }}>Cant.</th>
                <th style={{ ...th, textAlign: 'right', width: '75px' }}>Precio</th>
                <th style={{ ...th, textAlign: 'center', width: '72px' }}>Tipo Imp.</th>
                <th style={{ ...th, textAlign: 'right', width: '75px' }}>Impuesto</th>
                <th style={{ ...th, textAlign: 'right', width: '80px' }}>Total</th>
              </tr>
            </thead>

            <tbody>
              {detalle.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...td, textAlign: 'center' }}>
                    No hay detalle para esta factura.
                  </td>
                </tr>
              ) : (
                detalle.map((item) => (
                  <tr key={item.id_detalle}>
                    <td style={td}>{item.descripcion_producto}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{moneda(item.precio_unitario)}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{item.tipo_impuesto || '-'}</td>
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
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#5B6673',
              lineHeight: 1.6,
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <strong>Total en Letras:</strong>
              <p style={{ margin: '6px 0 0 0' }}>{totalEnLetras(factura.total_factura)}</p>
            </div>

            <div>
              <p style={{ margin: '3px 0' }}>
                <strong>Reg O/C Exenta:</strong>
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>Reg Exonerados:</strong>
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>No. Registro SAG:</strong>
              </p>
            </div>

            {facturaAnulada && factura.descripcion_anulacion && (
              <div
                style={{
                  marginTop: '10px',
                  border: '1px solid #FCA5A5',
                  borderRadius: '10px',
                  padding: '10px',
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                }}
              >
                <strong>Motivo de anulación:</strong> {factura.descripcion_anulacion}
              </div>
            )}

            {!facturaAnulada &&
              notasAplicadas.map((nota) => (
                <div
                  key={nota.id_nota_credito}
                  style={{
                    marginTop: '10px',
                    border: '1px solid #BFC7D1',
                    borderRadius: '10px',
                    padding: '10px',
                    backgroundColor: '#EEF5FB',
                    color: '#00487A',
                  }}
                >
                  <strong>Nota de crédito aplicada:</strong>{' '}
                  {nota.descripcion_aplicacion ||
                    `Nota de crédito ${nota.secuencia_fiscal} aplicada a esta factura.`}
                </div>
              ))}
          </div>

          <div
            style={{
              border: '1px solid #D8DEE6',
              borderRadius: '10px',
              overflow: 'hidden',
              fontSize: '12px',
            }}
          >
            <FilaTotal label="Sub Total" valor={factura.subtotal} />
            <FilaTotal label="Importe Exonerado" valor={factura.importe_exonerado} />
            <FilaTotal label="Importe Exento" valor={factura.importe_exento} />
            <FilaTotal label="Importe Gravado 15%" valor={factura.importe_gravado_15} />
            <FilaTotal label="Importe Gravado 18%" valor={factura.importe_gravado_18} />
            <FilaTotal label="I.S.V. 15%" valor={factura.isv_15} />
            <FilaTotal label="I.S.V. 18%" valor={factura.isv_18} />
            <FilaTotal label="TOTAL A PAGAR" valor={factura.total_factura} destacado />
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '24px',
            borderTop: '1px solid #D8DEE6',
            paddingTop: '14px',
            fontSize: '11px',
            color: '#5B6673',
            lineHeight: 1.6,
          }}
        >
          <div>
            <p style={{ margin: '3px 0' }}>
              <strong>C.A.I.:</strong> {cai || '-'}
            </p>
            <p style={{ margin: '3px 0' }}>
              <strong>Fecha Límite de Emisión:</strong>{' '}
              {formatearFecha(autorizacion?.fecha_expiracion)}
            </p>
            <p style={{ margin: '3px 0' }}>
              <strong>Rango Autorizado:</strong> {rangoInicial || '-'} - al - {rangoFinal || '-'}
            </p>
          </div>

          <div>
            <p style={{ margin: '3px 0' }}>Original: Cliente</p>
            <p style={{ margin: '3px 0' }}>Copia: Obligado Tributario</p>
            <p style={{ margin: '3px 0' }}>Triplicado: Archivo</p>
            <p style={{ margin: '3px 0' }}>Modalidad de Impresión: SFC en Red Fijo</p>
          </div>
        </section>

        <footer
          style={{
            marginTop: '24px',
            borderTop: '1px solid #D8DEE6',
            paddingTop: '14px',
            fontSize: '11px',
            color: '#1F2933',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          La Factura es beneficio de todos, ¡Exíjala!
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
  valor: number | string | null | undefined
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
