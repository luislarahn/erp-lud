'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import * as XLSX from 'xlsx'

type PestanaActiva = 'registros' | 'operaciones' | 'reportes'
type VistaProductos = 'kanban' | 'lista'
type TipoReporteInventario = 'productos' | 'movimientos'


const unidadesMedidaSugeridas = [
  'Unidad','Bolsa','Caja','Metro','Metro Lineal','Metro Cuadrado',
  'Metro Cúbico','Galón','Litro','Kilogramo','Libra','Quintal',
  'Tonelada','Pieza','Paquete','Rollo','Cubeta','Barril',
  'Docena','Juego','Par',
]

function capitalizarInicial(texto: string) {
  return texto
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es-HN')
    .replace(/(^|\s)(\p{L})/gu, (_, espacio, letra) => {
      return `${espacio}${letra.toLocaleUpperCase('es-HN')}`
    })
}

export default function InventarioPage() {
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [pestanaActiva, setPestanaActiva] = useState<PestanaActiva>('registros')
  const [vistaProductos, setVistaProductos] = useState<VistaProductos>('lista')

  const [productos, setProductos] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [descripcionesExistentes, setDescripcionesExistentes] = useState<string[]>([])
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>([])
  const [unidadesExistentes, setUnidadesExistentes] = useState<string[]>([])

  const [descripcion, setDescripcion] = useState('')
  const [codigo, setCodigo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [unidadMedida, setUnidadMedida] = useState('')
  const [precioCompra, setPrecioCompra] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [stockActual, setStockActual] = useState('')
  const [stockMinimo, setStockMinimo] = useState('10')
  const [tipoImpuesto, setTipoImpuesto] = useState('ISV')
  const [fechaRegistro, setFechaRegistro] = useState('')

  const [idProductoEditando, setIdProductoEditando] = useState<number | null>(null)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [menuAccionAbierto, setMenuAccionAbierto] = useState<number | null>(null)

  const [codigoOperacion, setCodigoOperacion] = useState('')
  const [descripcionOperacion, setDescripcionOperacion] = useState('')
  const [tipoOperacion, setTipoOperacion] = useState('Entrada')
  const [cantidadOperacion, setCantidadOperacion] = useState('')
  const [fechaOperacion, setFechaOperacion] = useState('')

  const [tipoReporte, setTipoReporte] = useState<TipoReporteInventario>('productos')
  const [filtroCategoriaProducto, setFiltroCategoriaProducto] = useState('Todas')
  const [filtroUnidadProducto, setFiltroUnidadProducto] = useState('Todas')
  const [filtroRangoStock, setFiltroRangoStock] = useState('Todos')
  const [mostrarSoloAlertas, setMostrarSoloAlertas] = useState(false)

  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroCategoriaMovimiento, setFiltroCategoriaMovimiento] = useState('Todas')
  const [filtroTipoMovimiento, setFiltroTipoMovimiento] = useState('Todos')

  const unidadesMedidaCompletas = useMemo(() => {
    const unidadesNormalizadas = [
      ...unidadesMedidaSugeridas,
      ...unidadesExistentes,
    ]
      .map((unidad) => capitalizarInicial(unidad))
      .filter((unidad) => unidad.trim() !== '')

    return [...new Set(unidadesNormalizadas)].sort((a, b) => a.localeCompare(b, 'es'))
  }, [unidadesExistentes])

  const codigosExistentes = useMemo(() => {
    return [
      ...new Set(
        productos
          .map((producto) => String(producto.codigo || '').trim())
          .filter((codigoProducto) => codigoProducto !== '')
      ),
    ].sort((a, b) => a.localeCompare(b, 'es'))
  }, [productos])

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

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    setFechaRegistro(hoy)
    setFechaOperacion(hoy)
    obtenerProductos()
    obtenerMovimientos()
  }, [])

  useEffect(() => {
    if (!descripcion.trim() || idProductoEditando !== null) return

    const productoCoincidente = productos.find(
      (p) =>
        p.descripcion?.trim().toLowerCase() ===
        descripcion.trim().toLowerCase()
    )

    if (productoCoincidente) {
      setCategoria(productoCoincidente.categoria || '')
      setUnidadMedida(productoCoincidente.unidad_medida || '')
      setStockMinimo(String(productoCoincidente.stock_minimo ?? 10))
      setTipoImpuesto(Number(productoCoincidente.impuesto) === 0 ? 'Exento' : 'ISV')
      setFechaRegistro(
        productoCoincidente.fecha_registro || new Date().toISOString().split('T')[0]
      )
    }
  }, [descripcion, productos, idProductoEditando])

  async function obtenerProductos() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id_producto', { ascending: false })

    if (error) {
      console.log('Error al obtener productos:', error)
    } else {
      const lista = data || []
      setProductos(lista)

      const descripcionesUnicas = [
        ...new Set(lista.map((p) => p.descripcion).filter(Boolean)),
      ]

      const categoriasUnicas = [
        ...new Set(lista.map((p) => p.categoria).filter(Boolean)),
      ]

      const unidadesUnicas = [
        ...new Set(lista.map((p) => p.unidad_medida).filter(Boolean)),
      ]

      setDescripcionesExistentes(descripcionesUnicas)
      setCategoriasExistentes(categoriasUnicas)
      setUnidadesExistentes(unidadesUnicas)
    }
  }

  async function obtenerMovimientos() {
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .select('*')
      .order('fecha_registro', { ascending: false })
      .order('id_movimiento', { ascending: false })

    if (error) {
      console.log('Error al obtener movimientos:', error)
    } else {
      setMovimientos(data || [])
    }
  }

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault()

    const descripcionLimpia = descripcion.trim()
    const codigoLimpio = codigo.trim()
    const categoriaLimpia = categoria.trim()
    const unidadMedidaLimpia = capitalizarInicial(unidadMedida)
    const impuestoValor = tipoImpuesto === 'Exento' ? 0 : 15
    const stockMinimoValor = Number(stockMinimo || 10)

    if (idProductoEditando !== null) {
      const { error } = await supabase
        .from('productos')
        .update({
          codigo: codigoLimpio || null,
          descripcion: descripcionLimpia,
          categoria: categoriaLimpia,
          unidad_medida: unidadMedidaLimpia,
          precio_compra: Number(precioCompra),
          precio_venta: Number(precioVenta),
          stock_actual: Number(stockActual),
          stock_minimo: stockMinimoValor,
          impuesto: impuestoValor,
          fecha_registro: fechaRegistro,
        })
        .eq('id_producto', idProductoEditando)

      if (error) {
        console.log('Error al actualizar producto:', error)
        alert('Ocurrió un error al actualizar el producto')
      } else {
        alert('Producto actualizado correctamente')
        limpiarFormulario()
        obtenerProductos()
      }

      return
    }

    const productoExistente = productos.find(
      (p) =>
        p.descripcion?.trim().toLowerCase() ===
        descripcionLimpia.toLowerCase()
    )

    if (productoExistente) {
      const confirmar = confirm(
        'Ya existe un producto con esta descripción. ¿Desea actualizar ese registro?'
      )

      if (!confirmar) return

      const { error } = await supabase
        .from('productos')
        .update({
          codigo: codigoLimpio || null,
          categoria: categoriaLimpia,
          unidad_medida: unidadMedidaLimpia,
          precio_compra: Number(precioCompra),
          precio_venta: Number(precioVenta),
          stock_actual: Number(stockActual),
          stock_minimo: stockMinimoValor,
          impuesto: impuestoValor,
          fecha_registro: fechaRegistro,
        })
        .eq('id_producto', productoExistente.id_producto)

      if (error) {
        console.log('Error al actualizar producto:', error)
        alert('Ocurrió un error al actualizar el producto existente')
      } else {
        alert('Producto existente actualizado correctamente')
        limpiarFormulario()
        obtenerProductos()
      }
    } else {
      const { error } = await supabase.from('productos').insert([
        {
          codigo: codigoLimpio || null,
          descripcion: descripcionLimpia,
          categoria: categoriaLimpia,
          unidad_medida: unidadMedidaLimpia,
          precio_compra: Number(precioCompra),
          precio_venta: Number(precioVenta),
          stock_actual: Number(stockActual),
          stock_minimo: stockMinimoValor,
          impuesto: impuestoValor,
          fecha_registro: fechaRegistro,
        },
      ])

      if (error) {
        console.log('Error al guardar producto:', error)
        alert('Ocurrió un error al guardar el producto')
      } else {
        alert('Producto nuevo guardado correctamente')
        limpiarFormulario()
        obtenerProductos()
      }
    }
  }

  async function guardarOperacionStock(e: React.FormEvent) {
    e.preventDefault()

    const codigoLimpio = codigoOperacion.trim()
    const descripcionLimpia = descripcionOperacion.trim()
    const cantidad = Number(cantidadOperacion)

    if (!codigoLimpio && !descripcionLimpia) {
      alert('Debe ingresar un código o seleccionar una descripción')
      return
    }

    if (!cantidad || cantidad <= 0) {
      alert('La cantidad debe ser mayor que 0')
      return
    }

    const productoExistente = productos.find((p) => {
      const codigoProducto = String(p.codigo || '').trim().toLowerCase()
      const descripcionProducto = String(p.descripcion || '').trim().toLowerCase()

      if (codigoLimpio && codigoProducto === codigoLimpio.toLowerCase()) {
        return true
      }

      if (!codigoLimpio && descripcionLimpia && descripcionProducto === descripcionLimpia.toLowerCase()) {
        return true
      }

      return false
    })

    if (!productoExistente) {
      alert('El producto ingresado no existe en el inventario')
      return
    }

    const stockActualNumero = Number(productoExistente.stock_actual) || 0
    let nuevoStock = stockActualNumero

    if (tipoOperacion === 'Entrada') {
      nuevoStock = stockActualNumero + cantidad
    } else {
      nuevoStock = stockActualNumero - cantidad

      if (nuevoStock < 0) {
        alert('No puede hacer una salida mayor al stock actual')
        return
      }
    }

    const { error } = await supabase
      .from('productos')
      .update({
        stock_actual: nuevoStock,
      })
      .eq('id_producto', productoExistente.id_producto)

    if (error) {
      console.log('Error al guardar operación de stock:', error)
      alert('Ocurrió un error al actualizar el stock')
      return
    }

    const { error: errorMovimiento } = await supabase
      .from('movimientos_inventario')
      .insert([
        {
          id_producto: productoExistente.id_producto,
          descripcion: productoExistente.descripcion,
          categoria: productoExistente.categoria,
          tipo_operacion: tipoOperacion,
          cantidad: cantidad,
          stock_anterior: stockActualNumero,
          stock_nuevo: nuevoStock,
          fecha_registro: fechaOperacion,
        },
      ])

    if (errorMovimiento) {
      console.log('Error al guardar movimiento:', errorMovimiento)
      alert('Se actualizó el stock, pero falló el registro del movimiento')
      return
    }

    alert('Stock actualizado correctamente')
    limpiarFormularioOperacion()
    obtenerProductos()
    obtenerMovimientos()
  }

  function manejarCambioCodigoOperacion(valor: string) {
    setCodigoOperacion(valor)

    const productoCoincidente = productos.find(
      (p) => String(p.codigo || '').trim().toLowerCase() === valor.trim().toLowerCase()
    )

    if (productoCoincidente) {
      setDescripcionOperacion(productoCoincidente.descripcion || '')
    }
  }

  function manejarCambioDescripcionOperacion(valor: string) {
    setDescripcionOperacion(valor)

    const productoCoincidente = productos.find(
      (p) => String(p.descripcion || '').trim().toLowerCase() === valor.trim().toLowerCase()
    )

    if (productoCoincidente) {
      setCodigoOperacion(productoCoincidente.codigo || '')
    }
  }

  function limpiarFormulario() {
    const hoy = new Date().toISOString().split('T')[0]
    setDescripcion('')
    setCodigo('')
    setCategoria('')
    setUnidadMedida('')
    setPrecioCompra('')
    setPrecioVenta('')
    setStockActual('')
    setStockMinimo('10')
    setTipoImpuesto('ISV')
    setFechaRegistro(hoy)
    setIdProductoEditando(null)
  }

  function limpiarFormularioOperacion() {
    const hoy = new Date().toISOString().split('T')[0]
    setCodigoOperacion('')
    setDescripcionOperacion('')
    setTipoOperacion('Entrada')
    setCantidadOperacion('')
    setFechaOperacion(hoy)
  }

  function editarProducto(producto: any) {
    setIdProductoEditando(producto.id_producto)
    setDescripcion(producto.descripcion || '')
    setCodigo(producto.codigo || '')
    setCategoria(producto.categoria || '')
    setUnidadMedida(producto.unidad_medida || '')
    setPrecioCompra(String(producto.precio_compra ?? ''))
    setPrecioVenta(String(producto.precio_venta ?? ''))
    setStockActual(String(producto.stock_actual ?? ''))
    setStockMinimo(String(producto.stock_minimo ?? 10))
    setTipoImpuesto(Number(producto.impuesto) === 0 ? 'Exento' : 'ISV')
    setFechaRegistro(producto.fecha_registro || new Date().toISOString().split('T')[0])
    setMenuAccionAbierto(null)

    window.scrollTo({
      top: 120,
      behavior: 'smooth',
    })
  }

  async function eliminarProducto(id: number) {
    const confirmar = confirm('¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.')

    if (!confirmar) return

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id_producto', id)

    if (error) {
      console.log('Error al eliminar producto:', error)
      alert('Ocurrió un error al eliminar el producto')
    } else {
      alert('Producto eliminado correctamente')
      setMenuAccionAbierto(null)
      obtenerProductos()
    }
  }

  function cerrarSesion() {
    localStorage.removeItem('miniERPAuth')
    router.push('/')
  }

  function productoTieneStockBajo(producto: any) {
    return Number(producto.stock_actual || 0) <= Number(producto.stock_minimo ?? 10)
  }

  function obtenerProductoPorMovimiento(movimiento: any) {
    return productos.find(
      (p) =>
        Number(p.id_producto) === Number(movimiento.id_producto) ||
        p.descripcion?.trim().toLowerCase() === movimiento.descripcion?.trim().toLowerCase()
    )
  }

  function obtenerCategoriaMovimiento(movimiento: any) {
    if (movimiento.categoria && movimiento.categoria.trim() !== '') {
      return movimiento.categoria
    }

    const productoRelacionado = obtenerProductoPorMovimiento(movimiento)
    return productoRelacionado?.categoria || '-'
  }

  function obtenerCodigoMovimiento(movimiento: any) {
    const productoRelacionado = obtenerProductoPorMovimiento(movimiento)
    return productoRelacionado?.codigo || '-'
  }

  function obtenerTipoMovimientoBase(movimiento: any) {
    const tipo = movimiento.tipo_operacion || ''

    if (tipo.toLowerCase().includes('factura')) {
      return 'Venta'
    }

    if (tipo.toLowerCase().includes('salida')) {
      return 'Salida'
    }

    if (tipo.toLowerCase().includes('entrada')) {
      return 'Entrada'
    }

    return tipo
  }

  const productosFiltradosListado = useMemo(() => {
    const texto = busquedaProducto.trim().toLowerCase()

    if (!texto) return productos

    return productos.filter((p) => {
      return (
        p.codigo?.toLowerCase().includes(texto) ||
        p.descripcion?.toLowerCase().includes(texto) ||
        p.categoria?.toLowerCase().includes(texto) ||
        p.unidad_medida?.toLowerCase().includes(texto)
      )
    })
  }, [productos, busquedaProducto])

  const productosFiltradosReporte = useMemo(() => {
    return productos.filter((p) => {
      const cumpleCategoria =
        filtroCategoriaProducto === 'Todas' || p.categoria === filtroCategoriaProducto

      const cumpleUnidad =
        filtroUnidadProducto === 'Todas' || p.unidad_medida === filtroUnidadProducto

      const stock = Number(p.stock_actual || 0)
      let cumpleStock = true

      if (filtroRangoStock === '0') cumpleStock = stock === 0
      if (filtroRangoStock === '1-100') cumpleStock = stock >= 1 && stock <= 100
      if (filtroRangoStock === '101-200') cumpleStock = stock >= 101 && stock <= 200
      if (filtroRangoStock === '201-300') cumpleStock = stock >= 201 && stock <= 300
      if (filtroRangoStock === '301-400') cumpleStock = stock >= 301 && stock <= 400
      if (filtroRangoStock === '401-500') cumpleStock = stock >= 401 && stock <= 500
      if (filtroRangoStock === 'mayor-500') cumpleStock = stock > 500

      const cumpleAlerta = !mostrarSoloAlertas || productoTieneStockBajo(p)

      return cumpleCategoria && cumpleUnidad && cumpleStock && cumpleAlerta
    })
  }, [
    productos,
    filtroCategoriaProducto,
    filtroUnidadProducto,
    filtroRangoStock,
    mostrarSoloAlertas,
  ])

  const movimientosFiltradosReporte = useMemo(() => {
    return movimientos.filter((m) => {
      const categoriaMovimiento = obtenerCategoriaMovimiento(m)
      const tipoMovimientoBase = obtenerTipoMovimientoBase(m)

      const cumpleCategoria =
        filtroCategoriaMovimiento === 'Todas' || categoriaMovimiento === filtroCategoriaMovimiento

      const cumpleTipo =
        filtroTipoMovimiento === 'Todos' ||
        tipoMovimientoBase === filtroTipoMovimiento

      const fecha = m.fecha_registro || ''
      const cumpleFechaDesde = !filtroFechaDesde || fecha >= filtroFechaDesde
      const cumpleFechaHasta = !filtroFechaHasta || fecha <= filtroFechaHasta

      return cumpleCategoria && cumpleTipo && cumpleFechaDesde && cumpleFechaHasta
    })
  }, [
    movimientos,
    productos,
    filtroCategoriaMovimiento,
    filtroTipoMovimiento,
    filtroFechaDesde,
    filtroFechaHasta,
  ])

  function formatearImpuesto(impuesto: any) {
    return Number(impuesto) === 0 ? 'Exento (0%)' : 'ISV (15%)'
  }

  function formatearMoneda(valor: any) {
    const numero = Number(valor || 0)

    return `L ${numero.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  function formatearFecha(fecha: string | null | undefined) {
    if (!fecha) return 'Sin fecha'

    const partes = fecha.split('-')
    if (partes.length !== 3) return fecha

    return `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`
  }

  function formatearFechaGeneracion() {
    return new Date().toLocaleString('es-HN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function escaparHtml(valor: any) {
    return String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  function exportarProductosExcel() {
    const datos = productosFiltradosReporte.map((p) => ({
      Código: p.codigo || '',
      Descripción: p.descripcion || '',
      Categoría: p.categoria || '',
      Unidad: p.unidad_medida || '',
      'Precio compra': Number(p.precio_compra || 0),
      'Precio venta': Number(p.precio_venta || 0),
      'Stock actual': Number(p.stock_actual || 0),
      'Stock mínimo': Number(p.stock_minimo ?? 10),
      Impuesto: formatearImpuesto(p.impuesto),
      'Fecha registro': formatearFecha(p.fecha_registro),
      Alerta: productoTieneStockBajo(p) ? 'Stock bajo' : '',
    }))

    const hoja = XLSX.utils.json_to_sheet(datos)
    const libro = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(libro, hoja, 'Productos')
    XLSX.writeFile(libro, 'reporte_general_productos.xlsx')
  }

  function exportarMovimientosExcel() {
    const datos = movimientosFiltradosReporte.map((m) => ({
      Fecha: formatearFecha(m.fecha_registro),
      Código: obtenerCodigoMovimiento(m),
      Producto: m.descripcion || '',
      Categoría: obtenerCategoriaMovimiento(m),
      Tipo: m.tipo_operacion || '',
      Cantidad: Number(m.cantidad || 0),
      'Stock anterior': Number(m.stock_anterior || 0),
      'Stock nuevo': Number(m.stock_nuevo || 0),
    }))

    const hoja = XLSX.utils.json_to_sheet(datos)
    const libro = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(libro, hoja, 'Entradas y Salidas')
    XLSX.writeFile(libro, 'reporte_entradas_salidas.xlsx')
  }

  function imprimirReporte(titulo: string, encabezados: string[], filas: any[][], resumen: string) {
    const ventana = window.open('', '_blank')

    if (!ventana) {
      alert('No se pudo abrir la ventana de impresión. Revise si el navegador bloqueó ventanas emergentes.')
      return
    }

    const filasHtml = filas
      .map((fila) => {
        const celdas = fila
          .map((celda) => `<td>${escaparHtml(celda)}</td>`)
          .join('')

        return `<tr>${celdas}</tr>`
      })
      .join('')

    const encabezadosHtml = encabezados
      .map((encabezado) => `<th>${escaparHtml(encabezado)}</th>`)
      .join('')

    ventana.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escaparHtml(titulo)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 28px;
              color: #1F2933;
            }

            .encabezado {
              border-bottom: 2px solid #1F2933;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }

            h1 {
              margin: 0;
              font-size: 22px;
            }

            h2 {
              margin: 6px 0 0 0;
              font-size: 16px;
              color: #3F4A56;
              font-weight: normal;
            }

            .meta {
              margin-top: 10px;
              font-size: 12px;
              color: #5B6673;
              line-height: 1.5;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th {
              background: #F2F4F7;
              color: #1F2933;
              text-align: left;
              padding: 8px;
              border: 1px solid #BFC7D1;
            }

            td {
              padding: 7px;
              border: 1px solid #D8DEE6;
              vertical-align: top;
            }

            tr:nth-child(even) td {
              background: #FAFAFA;
            }

            .pie {
              margin-top: 18px;
              font-size: 11px;
              color: #7A828A;
            }

            @media print {
              body {
                margin: 18mm;
              }

              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="encabezado">
            <h1>ERP LUD</h1>
            <h2>${escaparHtml(titulo)}</h2>
            <div class="meta">
              Fecha de generación: ${escaparHtml(formatearFechaGeneracion())}<br />
              ${escaparHtml(resumen)}
            </div>
          </div>

          <table>
            <thead>
              <tr>${encabezadosHtml}</tr>
            </thead>
            <tbody>
              ${filasHtml || `<tr><td colspan="${encabezados.length}">No hay datos para mostrar.</td></tr>`}
            </tbody>
          </table>

          <div class="pie">
            Reporte generado desde ERP LUD.
          </div>

          <script>
            window.onload = function () {
              window.print()
            }
          </script>
        </body>
      </html>
    `)

    ventana.document.close()
  }

  function imprimirProductosPdf() {
    const encabezados = [
      'Código',
      'Descripción',
      'Categoría',
      'Unidad',
      'Precio compra',
      'Precio venta',
      'Stock',
      'Stock mínimo',
      'Impuesto',
      'Fecha registro',
      'Alerta',
    ]

    const filas = productosFiltradosReporte.map((p) => [
      p.codigo || '',
      p.descripcion || '',
      p.categoria || '',
      p.unidad_medida || '',
      formatearMoneda(p.precio_compra),
      formatearMoneda(p.precio_venta),
      p.stock_actual ?? 0,
      p.stock_minimo ?? 10,
      formatearImpuesto(p.impuesto),
      formatearFecha(p.fecha_registro),
      productoTieneStockBajo(p) ? 'Stock bajo' : '',
    ])

    imprimirReporte(
      'Reporte General de Productos',
      encabezados,
      filas,
      `Total de productos mostrados: ${productosFiltradosReporte.length}`
    )
  }

  function imprimirMovimientosPdf() {
    const encabezados = [
      'Fecha',
      'Código',
      'Producto',
      'Categoría',
      'Tipo',
      'Cantidad',
      'Stock anterior',
      'Stock nuevo',
    ]

    const filas = movimientosFiltradosReporte.map((m) => [
      formatearFecha(m.fecha_registro),
      obtenerCodigoMovimiento(m),
      m.descripcion || '',
      obtenerCategoriaMovimiento(m),
      m.tipo_operacion || '',
      m.cantidad ?? 0,
      m.stock_anterior ?? 0,
      m.stock_nuevo ?? 0,
    ])

    imprimirReporte(
      'Reporte Entradas / Salidas',
      encabezados,
      filas,
      `Total de movimientos mostrados: ${movimientosFiltradosReporte.length}`
    )
  }


  const totalProductos = productos.length
  const productosStockBajo = productos.filter((producto) => productoTieneStockBajo(producto)).length
  const totalEntradas = movimientos.filter((movimiento) => obtenerTipoMovimientoBase(movimiento) === 'Entrada').length
  const totalSalidas = movimientos.filter((movimiento) => obtenerTipoMovimientoBase(movimiento) === 'Salida').length
  const valorInventarioVenta = productos.reduce((total, producto) => {
    return total + Number(producto.precio_venta || 0) * Number(producto.stock_actual || 0)
  }, 0)


  function estiloPestana(activa: boolean) {
    return {
      padding: '14px 22px',
      cursor: 'pointer',
      backgroundColor: activa ? '#005099' : '#FFFFFF',
      color: activa ? '#FFFFFF' : '#3F4A56',
      border: `1px solid ${activa ? '#005099' : '#D8DEE6'}`,
      borderRadius: '0',
      fontWeight: 'bold' as const,
      marginRight: '0',
      boxShadow: activa
        ? '0 8px 18px rgba(15,118,110,0.18)'
        : '0 2px 6px rgba(0,0,0,0.03)',
      fontSize: '13px',
      minWidth: '130px',
    }
  }

  function estiloVista(activa: boolean) {
    return {
      padding: '10px 14px',
      cursor: 'pointer',
      backgroundColor: activa ? '#005099' : '#FFFFFF',
      color: activa ? '#FFFFFF' : '#3F4A56',
      border: `1px solid ${activa ? '#005099' : '#D8DEE6'}`,
      borderRadius: '10px',
      fontWeight: 'bold' as const,
      fontSize: '12px',
      marginLeft: '8px',
    }
  }

  const estiloBotonFormularioPrimario = {
    padding: '10px 14px',
    cursor: 'pointer',
    backgroundColor: '#005099',
    color: '#FFFFFF',
    border: '1px solid #005099',
    borderRadius: '10px',
    fontWeight: 'bold' as const,
    fontSize: '12px',
    lineHeight: 1.2,
    boxShadow: '0 6px 14px rgba(15,118,110,0.14)',
  }

  const estiloBotonFormularioSecundario = {
    padding: '10px 14px',
    cursor: 'pointer',
    backgroundColor: '#FFFFFF',
    color: '#3F4A56',
    border: '1px solid #BFC7D1',
    borderRadius: '10px',
    fontWeight: 'bold' as const,
    fontSize: '12px',
    lineHeight: 1.2,
  }

  const estiloInput = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#FFFFFF',
    color: '#1F2933',
    border: '1px solid #BFC7D1',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box' as const,
  }

  const estiloLabel = {
    display: 'block',
    marginBottom: '6px',
    color: '#3F4A56',
    fontWeight: 600,
    fontSize: '13px',
  }

  const estiloFormularioCompacto = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '12px 18px',
    alignItems: 'center',
  }

  const estiloCampoLinea = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  }

  const estiloLabelLinea = {
    margin: 0,
    color: '#3F4A56',
    fontWeight: 600,
    fontSize: '13px',
    minWidth: '112px',
    whiteSpace: 'nowrap' as const,
  }

  const estiloInputCompacto = {
    width: '100%',
    maxWidth: '210px',
    padding: '9px 11px',
    backgroundColor: '#FFFFFF',
    color: '#1F2933',
    border: '1px solid #BFC7D1',
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box' as const,
  }

  const estiloInputPequeno = {
    ...estiloInputCompacto,
    maxWidth: '105px',
  }

  const estiloInputFecha = {
    ...estiloInputCompacto,
    maxWidth: '145px',
  }

  const estiloCaja = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #BFC7D1',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
  }

  const estiloTablaContenedor = {
    overflowX: 'auto' as const,
    border: '1px solid #BFC7D1',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
  }

  const estiloTh = {
    padding: '10px 12px',
    textAlign: 'left' as const,
    color: '#3F4A56',
    backgroundColor: '#F3F6F8',
    borderBottom: '1px solid #BFC7D1',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap' as const,
  }

  const estiloTd = {
    padding: '10px 12px',
    borderBottom: '1px solid #EEF2F7',
    fontSize: '12px',
    color: '#3F4A56',
    verticalAlign: 'middle' as const,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F4F7', fontFamily: 'Arial, sans-serif', color: '#1F2933' }}>
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
                <Link
                  href="/documentacion"
                  style={{
                    display: 'block',
                    padding: '10px 13px',
                    textDecoration: 'none',
                    color: '#3F4A56',
                    fontSize: '12px',
                  }}
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
                    borderTop: '1px solid #EEF2F7',
                  }}
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
                    borderTop: '1px solid #EEF2F7',
                  }}
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
                    borderTop: '1px solid #EEF2F7',
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

      <main style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '18px 20px 32px 20px', boxSizing: 'border-box' }}>
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
          <span style={{ color: '#7A828A' }}>Inventario</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #D8DEE6', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 3px 10px rgba(15,23,42,0.04)' }}>
          <button type="button" onClick={() => setPestanaActiva('registros')} style={estiloPestana(pestanaActiva === 'registros')}>Registros</button>
          <button type="button" onClick={() => setPestanaActiva('operaciones')} style={estiloPestana(pestanaActiva === 'operaciones')}>Operaciones</button>
          <button type="button" onClick={() => setPestanaActiva('reportes')} style={estiloPestana(pestanaActiva === 'reportes')}>Reportes</button>
        </div>

        {pestanaActiva === 'registros' && (
          <>
            <div style={{ ...estiloCaja, marginBottom: '24px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '14px', color: '#1F2933', fontWeight: 'bold', fontSize: '18px' }}>
                {idProductoEditando ? 'Editar producto' : 'Registro de productos'}
              </h2>

              {idProductoEditando && (
                <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#EEF5FB', color: '#00487A', fontWeight: 'bold' }}>
                  Está editando un producto existente. Revise los campos y presione “Actualizar producto”.
                </div>
              )}

              <form onSubmit={guardarProducto}>
                <div style={estiloFormularioCompacto}>
                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Código</label>
                    <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código" style={estiloInputCompacto} />
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Descripción</label>
                    <input type="text" list="lista-descripciones" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required placeholder="Descripción" style={estiloInputCompacto} />
                    <datalist id="lista-descripciones">
                      {descripcionesExistentes.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                    </datalist>
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Categoría</label>
                    <input type="text" list="lista-categorias" value={categoria} onChange={(e) => setCategoria(e.target.value)} required placeholder="Categoría" style={estiloInputCompacto} />
                    <datalist id="lista-categorias">
                      {categoriasExistentes.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                    </datalist>
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Unidad</label>
                    <input
                      type="text"
                      list="lista-unidades-medida"
                      value={unidadMedida}
                      onChange={(e) => setUnidadMedida(e.target.value)}
                      onBlur={(e) => setUnidadMedida(capitalizarInicial(e.target.value))}
                      required
                      placeholder="Unidad"
                      style={estiloInputCompacto}
                    />
                    <datalist id="lista-unidades-medida">
                      {unidadesMedidaCompletas.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                    </datalist>
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Precio compra</label>
                    <input type="number" step="0.01" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} required style={estiloInputCompacto} />
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Precio venta</label>
                    <input type="number" step="0.01" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} required style={estiloInputCompacto} />
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Stock actual</label>
                    <input type="number" value={stockActual} onChange={(e) => setStockActual(e.target.value)} required style={estiloInputPequeno} />
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Stock mínimo</label>
                    <input type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} required min="0" style={estiloInputPequeno} />
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Impuesto</label>
                    <select value={tipoImpuesto} onChange={(e) => setTipoImpuesto(e.target.value)} required style={estiloInputPequeno}>
                      <option value="ISV">ISV (15%)</option>
                      <option value="Exento">Exento (0%)</option>
                    </select>
                  </div>

                  <div style={estiloCampoLinea}>
                    <label style={estiloLabelLinea}>Fecha</label>
                    <input type="date" value={fechaRegistro} onChange={(e) => setFechaRegistro(e.target.value)} required style={estiloInputFecha} />
                  </div>
                </div>

                <div style={{ marginTop: '22px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button type="submit" style={estiloBotonFormularioPrimario}>
                    {idProductoEditando ? 'Actualizar producto' : 'Guardar producto'}
                  </button>

                  {idProductoEditando && (
                    <button type="button" onClick={limpiarFormulario} style={estiloBotonFormularioSecundario}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={estiloCaja}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '14px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, color: '#1F2933', fontWeight: 'bold', fontSize: '18px' }}>Listado de productos</h2>
                <div>
                  <button type="button" onClick={() => setVistaProductos('kanban')} style={estiloVista(vistaProductos === 'kanban')}>Kanban</button>
                  <button type="button" onClick={() => setVistaProductos('lista')} style={estiloVista(vistaProductos === 'lista')}>Lista</button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={estiloLabel}>Buscar producto</label>
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Buscar por código, descripción, categoría o unidad"
                  style={estiloInput}
                />
              </div>

              <p style={{ color: '#7A828A', marginTop: 0 }}>
                Mostrando {productosFiltradosListado.length} producto(s).
              </p>

              {productosFiltradosListado.length === 0 ? (
                <p style={{ color: '#7A828A' }}>No hay productos para mostrar.</p>
              ) : vistaProductos === 'kanban' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  {productosFiltradosListado.map((p) => {
                    const esStockBajo = productoTieneStockBajo(p)
                    const stockMinimoValor = Number(p.stock_minimo ?? 10)

                    return (
                      <div key={p.id_producto} style={{ backgroundColor: esStockBajo ? '#F5F6F7' : '#FFFFFF', border: esStockBajo ? '1px solid #A2A3A3' : '1px solid #D8DEE6', padding: '20px', borderRadius: '20px' }}>
                        <strong>{p.descripcion}</strong>
                        <div style={{ color: '#7A828A', fontSize: '12px', marginTop: '6px' }}>
                          Código: {p.codigo || '-'}
                        </div>

                        {esStockBajo && (
                          <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '10px', backgroundColor: '#EEF5FB', color: '#00487A', fontWeight: 'bold', fontSize: '12px' }}>
                            ⚠ Stock bajo | Mínimo: {stockMinimoValor}
                          </div>
                        )}

                        <div style={{ color: '#5B6673', lineHeight: 1.8, fontSize: '13px', marginTop: '12px' }}>
                          <div><strong>Categoría:</strong> {p.categoria}</div>
                          <div><strong>Unidad:</strong> {p.unidad_medida}</div>
                          <div><strong>Precio compra:</strong> {formatearMoneda(p.precio_compra)}</div>
                          <div><strong>Precio venta:</strong> {formatearMoneda(p.precio_venta)}</div>
                          <div><strong>Stock actual:</strong> {p.stock_actual}</div>
                          <div><strong>Stock mínimo:</strong> {stockMinimoValor}</div>
                          <div><strong>Impuesto:</strong> {Number(p.impuesto) === 0 ? 'Exento (0%)' : 'ISV (15%)'}</div>
                          <div><strong>Fecha registro:</strong> {formatearFecha(p.fecha_registro)}</div>
                        </div>

                        <div style={{ marginTop: '16px', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setMenuAccionAbierto(menuAccionAbierto === p.id_producto ? null : p.id_producto)}
                            style={{ padding: '9px 15px', cursor: 'pointer', backgroundColor: '#EEF5FB', color: '#005099', border: '1px solid #D8DEE6', borderRadius: '999px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 6px 14px rgba(15,118,110,0.10)' }}
                          >
                            Acciones
                          </button>

                          {menuAccionAbierto === p.id_producto && (
                            <div style={{ position: 'absolute', top: '44px', left: 0, width: '170px', backgroundColor: '#FFFFFF', border: '1px solid #BFC7D1', borderRadius: '14px', boxShadow: '0 16px 34px rgba(15,23,42,0.14)', zIndex: 20, overflow: 'hidden' }}>
                              <button type="button" onClick={() => editarProducto(p)} style={{ width: '100%', padding: '12px 15px', textAlign: 'left', backgroundColor: '#FFFFFF', border: 'none', cursor: 'pointer', color: '#3F4A56', fontWeight: 'bold', fontSize: '12px' }}>
                                Editar
                              </button>
                              <button type="button" onClick={() => eliminarProducto(p.id_producto)} style={{ width: '100%', padding: '12px 15px', textAlign: 'left', backgroundColor: '#FFFFFF', border: 'none', cursor: 'pointer', color: '#00487A', fontWeight: 'bold', fontSize: '12px' }}>
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={estiloTablaContenedor}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F2F4F7' }}>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Código</th>
                        <th style={{ ...estiloTh, textAlign: 'left' as const }}>Descripción</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Categoría</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Unidad</th>
                        <th style={{ ...estiloTh, textAlign: 'right' as const }}>Precio compra</th>
                        <th style={{ ...estiloTh, textAlign: 'right' as const }}>Precio venta</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Stock</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Stock mínimo</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Impuesto</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Fecha registro</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltradosListado.map((p) => {
                        const esStockBajo = productoTieneStockBajo(p)

                        return (
                          <tr key={p.id_producto} style={{ backgroundColor: esStockBajo ? '#F5F6F7' : '#FFFFFF' }}>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{p.codigo || '-'}</td>
                            <td style={{ ...estiloTd, textAlign: 'left' as const }}>{p.descripcion}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{p.categoria}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{p.unidad_medida}</td>
                            <td style={{ ...estiloTd, textAlign: 'right' as const }}>{formatearMoneda(p.precio_compra)}</td>
                            <td style={{ ...estiloTd, textAlign: 'right' as const }}>{formatearMoneda(p.precio_venta)}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>
                              {p.stock_actual}
                              {esStockBajo && (
                                <span style={{ color: '#00487A', fontWeight: 'bold', marginLeft: '8px' }}>
                                  ⚠ Bajo
                                </span>
                              )}
                            </td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{Number(p.stock_minimo ?? 10)}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{Number(p.impuesto) === 0 ? 'Exento (0%)' : 'ISV (15%)'}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{formatearFecha(p.fecha_registro)}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const, position: 'relative' }}>
                              <button
                                type="button"
                                onClick={() => setMenuAccionAbierto(menuAccionAbierto === p.id_producto ? null : p.id_producto)}
                                style={{ padding: '8px 14px', cursor: 'pointer', backgroundColor: '#EEF5FB', color: '#005099', border: '1px solid #D8DEE6', borderRadius: '999px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 6px 14px rgba(15,118,110,0.10)' }}
                              >
                                Acciones
                              </button>

                              {menuAccionAbierto === p.id_producto && (
                                <div style={{ position: 'absolute', top: '48px', right: '14px', width: '170px', backgroundColor: '#FFFFFF', border: '1px solid #BFC7D1', borderRadius: '14px', boxShadow: '0 16px 34px rgba(15,23,42,0.14)', zIndex: 20, overflow: 'hidden' }}>
                                  <button type="button" onClick={() => editarProducto(p)} style={{ width: '100%', padding: '12px 15px', textAlign: 'left', backgroundColor: '#FFFFFF', border: 'none', cursor: 'pointer', color: '#3F4A56', fontWeight: 'bold', fontSize: '12px' }}>
                                    Editar
                                  </button>
                                  <button type="button" onClick={() => eliminarProducto(p.id_producto)} style={{ width: '100%', padding: '12px 15px', textAlign: 'left', backgroundColor: '#FFFFFF', border: 'none', cursor: 'pointer', color: '#00487A', fontWeight: 'bold', fontSize: '12px' }}>
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {pestanaActiva === 'operaciones' && (
          <div style={estiloCaja}>
            <h2 style={{ marginTop: 0, marginBottom: '14px', color: '#1F2933', fontWeight: 'bold', fontSize: '18px' }}>Operaciones de stock</h2>

            <form onSubmit={guardarOperacionStock}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={estiloLabel}>Código</label>
                  <input
                    type="text"
                    list="lista-codigos-operacion"
                    value={codigoOperacion}
                    onChange={(e) => manejarCambioCodigoOperacion(e.target.value)}
                    placeholder="Código del producto"
                    style={estiloInput}
                  />
                  <datalist id="lista-codigos-operacion">
                    {codigosExistentes.map((item, index) => (
                      <option key={index} value={item} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label style={estiloLabel}>Descripción</label>
                  <input
                    type="text"
                    list="lista-descripciones-operacion"
                    value={descripcionOperacion}
                    onChange={(e) => manejarCambioDescripcionOperacion(e.target.value)}
                    required={!codigoOperacion.trim()}
                    placeholder="Seleccione una descripción existente"
                    style={estiloInput}
                  />
                  <datalist id="lista-descripciones-operacion">
                    {descripcionesExistentes.map((item, index) => (
                      <option key={index} value={item} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label style={estiloLabel}>Tipo de operación</label>
                  <select value={tipoOperacion} onChange={(e) => setTipoOperacion(e.target.value)} required style={estiloInput}>
                    <option value="Entrada">Entrada</option>
                    <option value="Salida">Salida</option>
                  </select>
                </div>

                <div>
                  <label style={estiloLabel}>Cantidad</label>
                  <input type="number" value={cantidadOperacion} onChange={(e) => setCantidadOperacion(e.target.value)} required min="1" placeholder="Ingrese la cantidad" style={estiloInput} />
                </div>

                <div>
                  <label style={estiloLabel}>Fecha de operación</label>
                  <input type="date" value={fechaOperacion} onChange={(e) => setFechaOperacion(e.target.value)} required style={estiloInput} />
                </div>
              </div>

              <div style={{ marginTop: '22px' }}>
                <button type="submit" style={estiloBotonFormularioPrimario}>
                  Guardar operación
                </button>
              </div>
            </form>
          </div>
        )}

        {pestanaActiva === 'reportes' && (
          <div style={estiloCaja}>
            <h2 style={{ marginTop: 0, marginBottom: '14px', color: '#1F2933', fontWeight: 'bold', fontSize: '18px' }}>Reportes de inventario</h2>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                gap: '20px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  }}
>
  <button
    type="button"
    onClick={() => setTipoReporte('productos')}
    style={{
      ...estiloBotonFormularioSecundario,
      backgroundColor:
        tipoReporte === 'productos'
          ? '#005099'
          : '#FFFFFF',
      color:
        tipoReporte === 'productos'
          ? '#FFFFFF'
          : '#3F4A56',
      border:
        tipoReporte === 'productos'
          ? '1px solid #005099'
          : '1px solid #BFC7D1',
      boxShadow:
        tipoReporte === 'productos'
          ? '0 6px 14px rgba(15,118,110,0.14)'
          : 'none',
    }}
  >
    Reporte General
  </button>

  <button
    type="button"
    onClick={() => setTipoReporte('movimientos')}
    style={{
      ...estiloBotonFormularioSecundario,
      backgroundColor:
        tipoReporte === 'movimientos'
          ? '#005099'
          : '#FFFFFF',
      color:
        tipoReporte === 'movimientos'
          ? '#FFFFFF'
          : '#3F4A56',
      border:
        tipoReporte === 'movimientos'
          ? '1px solid #005099'
          : '1px solid #BFC7D1',
      boxShadow:
        tipoReporte === 'movimientos'
          ? '0 6px 14px rgba(15,118,110,0.14)'
          : 'none',
    }}
  >
    Entradas / Salidas
  </button>
</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() =>
                    tipoReporte === 'productos'
                      ? exportarProductosExcel()
                      : exportarMovimientosExcel()
                  }
                  style={estiloBotonFormularioPrimario}
                >
                  Exportar Excel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    tipoReporte === 'productos'
                      ? imprimirProductosPdf()
                      : imprimirMovimientosPdf()
                  }
                  style={{
                    ...estiloBotonFormularioSecundario,
                    backgroundColor: '#3F4A56',
                    color: '#FFFFFF',
                    border: '1px solid #3F4A56',
                  }}
                >
                  Imprimir / PDF
                </button>
              </div>
            </div>

            {tipoReporte === 'productos' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '22px', alignItems: 'end' }}>
                  <div>
                    <label style={estiloLabel}>Categoría</label>
                    <select value={filtroCategoriaProducto} onChange={(e) => setFiltroCategoriaProducto(e.target.value)} style={estiloInput}>
                      <option value="Todas">Todas</option>
                      {categoriasExistentes.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={estiloLabel}>Unidad</label>
                    <select value={filtroUnidadProducto} onChange={(e) => setFiltroUnidadProducto(e.target.value)} style={estiloInput}>
                      <option value="Todas">Todas</option>
                      {unidadesExistentes.map((unidad, index) => (
                        <option key={index} value={unidad}>{unidad}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={estiloLabel}>Rango de stock</label>
                    <select value={filtroRangoStock} onChange={(e) => setFiltroRangoStock(e.target.value)} style={estiloInput}>
                      <option value="Todos">Todos</option>
                      <option value="0">0</option>
                      <option value="1-100">1 - 100</option>
                      <option value="101-200">101 - 200</option>
                      <option value="201-300">201 - 300</option>
                      <option value="301-400">301 - 400</option>
                      <option value="401-500">401 - 500</option>
                      <option value="mayor-500">Mayor a 500</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setMostrarSoloAlertas(!mostrarSoloAlertas)}
                      style={{
                        ...estiloBotonFormularioPrimario,
                        width: '100%',
                        backgroundColor: mostrarSoloAlertas ? '#00487A' : '#005099',
                        border: `1px solid ${mostrarSoloAlertas ? '#00487A' : '#005099'}`,
                        boxShadow: '0 6px 14px rgba(220,38,38,0.14)',
                      }}
                    >
                      Alertas
                    </button>
                  </div>
                </div>

                <p style={{ color: '#7A828A', marginBottom: '14px' }}>
                  Mostrando {productosFiltradosReporte.length} producto(s)
                  {mostrarSoloAlertas ? ' con alerta de stock bajo.' : '.'}
                </p>

                <div style={estiloTablaContenedor}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F2F4F7' }}>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Código</th>
                        <th style={{ ...estiloTh, textAlign: 'left' as const }}>Descripción</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Categoría</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Unidad</th>
                        <th style={{ ...estiloTh, textAlign: 'right' as const }}>Precio compra</th>
                        <th style={{ ...estiloTh, textAlign: 'right' as const }}>Precio venta</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Stock</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Stock mínimo</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Impuesto</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Fecha registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltradosReporte.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ padding: '18px', textAlign: 'center', color: '#7A828A' }}>
                            No hay productos para mostrar.
                          </td>
                        </tr>
                      ) : (
                        productosFiltradosReporte.map((p) => {
                          const esStockBajo = productoTieneStockBajo(p)

                          return (
                            <tr key={p.id_producto} style={{ backgroundColor: esStockBajo ? '#F5F6F7' : '#FFFFFF' }}>
                              <td style={{ ...estiloTd, textAlign: 'center' as const }}>{p.codigo || '-'}</td>
                              <td style={{ ...estiloTd, textAlign: 'left' as const }}>{p.descripcion}</td>
                              <td style={{ ...estiloTd, textAlign: 'center' as const }}>{p.categoria}</td>
                              <td style={{ ...estiloTd, textAlign: 'center' as const }}>{p.unidad_medida}</td>
                              <td style={{ ...estiloTd, textAlign: 'right' as const }}>{formatearMoneda(p.precio_compra)}</td>
                              <td style={{ ...estiloTd, textAlign: 'right' as const }}>{formatearMoneda(p.precio_venta)}</td>
                              <td style={{ ...estiloTd, textAlign: 'center' as const }}>
                                {p.stock_actual}
                                {esStockBajo && (
                                  <span style={{ color: '#00487A', fontWeight: 'bold', marginLeft: '8px' }}>
                                    ⚠ Bajo
                                  </span>
                                )}
                              </td>
                              <td style={{ ...estiloTd, textAlign: 'center' as const }}>{Number(p.stock_minimo ?? 10)}</td>
                              <td style={{ ...estiloTd, textAlign: 'center' as const }}>{Number(p.impuesto) === 0 ? 'Exento (0%)' : 'ISV (15%)'}</td>
                              <td style={{ ...estiloTd, textAlign: 'center' as const }}>{formatearFecha(p.fecha_registro)}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tipoReporte === 'movimientos' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '22px' }}>
                  <div>
                    <label style={estiloLabel}>Fecha desde</label>
                    <input type="date" value={filtroFechaDesde} onChange={(e) => setFiltroFechaDesde(e.target.value)} style={estiloInput} />
                  </div>

                  <div>
                    <label style={estiloLabel}>Fecha hasta</label>
                    <input type="date" value={filtroFechaHasta} onChange={(e) => setFiltroFechaHasta(e.target.value)} style={estiloInput} />
                  </div>

                  <div>
                    <label style={estiloLabel}>Categoría</label>
                    <select value={filtroCategoriaMovimiento} onChange={(e) => setFiltroCategoriaMovimiento(e.target.value)} style={estiloInput}>
                      <option value="Todas">Todas</option>
                      {categoriasExistentes.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={estiloLabel}>Tipo</label>
                    <select value={filtroTipoMovimiento} onChange={(e) => setFiltroTipoMovimiento(e.target.value)} style={estiloInput}>
                      <option value="Todos">Todos</option>
                      <option value="Entrada">Entrada</option>
                      <option value="Salida">Salida</option>
                      <option value="Venta">Ventas</option>
                    </select>
                  </div>
                </div>

                <p style={{ color: '#7A828A', marginBottom: '14px' }}>
                  Mostrando {movimientosFiltradosReporte.length} movimiento(s).
                </p>

                <div style={estiloTablaContenedor}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F2F4F7' }}>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Fecha</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Código</th>
                        <th style={{ ...estiloTh, textAlign: 'left' as const }}>Producto</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Categoría</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Tipo</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Cantidad</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Stock anterior</th>
                        <th style={{ ...estiloTh, textAlign: 'center' as const }}>Stock nuevo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosFiltradosReporte.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '18px', textAlign: 'center', color: '#7A828A' }}>
                            No hay movimientos para mostrar.
                          </td>
                        </tr>
                      ) : (
                        movimientosFiltradosReporte.map((m) => (
                          <tr key={m.id_movimiento}>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{formatearFecha(m.fecha_registro)}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{obtenerCodigoMovimiento(m)}</td>
                            <td style={{ ...estiloTd, textAlign: 'left' as const }}>{m.descripcion}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{obtenerCategoriaMovimiento(m)}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{m.tipo_operacion}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{m.cantidad}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{m.stock_anterior}</td>
                            <td style={{ ...estiloTd, textAlign: 'center' as const }}>{m.stock_nuevo}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
