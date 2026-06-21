import type { CSSProperties } from 'react'

export const erpColors = {
  fondo: '#F2F4F7',
  blanco: '#FFFFFF',
  azulPrincipal: '#005099',
  azulOscuro: '#00487A',
  textoPrincipal: '#1F2933',
  textoSecundario: '#3F4A56',
  textoSuave: '#7A828A',
  grisIcono: '#A2A3A3',
  borde: '#D8DEE6',
  bordeInput: '#BFC7D1',
  fondoSuave: '#F5F6F7',
  fondoTabla: '#F3F6F8',
  fondoAlerta: '#EEF5FB',
}

export const erpLayout = {
  page: {
    minHeight: '100vh',
    backgroundColor: erpColors.fondo,
    fontFamily: 'Arial, sans-serif',
    color: erpColors.textoPrincipal,
  } satisfies CSSProperties,

  header: {
    backgroundColor: erpColors.blanco,
    borderBottom: `1px solid ${erpColors.borde}`,
    boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
  } satisfies CSSProperties,

  headerGrid: {
    width: '100%',
    minHeight: '48px',
    padding: '0 18px',
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: '140px 1fr 90px',
    alignItems: 'center',
    gap: '12px',
  } satisfies CSSProperties,

  main: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '18px 20px 32px 20px',
    boxSizing: 'border-box',
    fontSize: '12px',
  } satisfies CSSProperties,

  tabsContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: erpColors.blanco,
    border: `1px solid ${erpColors.borde}`,
    borderRadius: '8px',
    overflowX: 'auto',
    overflowY: 'hidden',
    marginBottom: '14px',
    boxShadow: '0 3px 10px rgba(15,23,42,0.04)',
  } satisfies CSSProperties,

  card: {
    backgroundColor: erpColors.blanco,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
  } satisfies CSSProperties,
}

export const erpText = {
  title: {
    marginTop: 0,
    marginBottom: '14px',
    color: erpColors.textoPrincipal,
    fontWeight: 'bold',
    fontSize: '18px',
  } satisfies CSSProperties,

  label: {
    display: 'block',
    marginBottom: '6px',
    color: erpColors.textoSecundario,
    fontWeight: 600,
    fontSize: '13px',
  } satisfies CSSProperties,

  labelLinea: {
    margin: 0,
    color: erpColors.textoSecundario,
    fontWeight: 600,
    fontSize: '13px',
    minWidth: '112px',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  normal: {
    color: erpColors.textoSecundario,
    fontSize: '13px',
    fontWeight: 400,
  } satisfies CSSProperties,

  small: {
    color: erpColors.textoSuave,
    fontSize: '12px',
    fontWeight: 400,
  } satisfies CSSProperties,

  tableText: {
    color: erpColors.textoSecundario,
    fontSize: '12px',
    fontWeight: 400,
  } satisfies CSSProperties,
}

export const erpForm = {
  gridCompacto: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '12px 24px',
    alignItems: 'center',
  } satisfies CSSProperties,

  gridDosColumnas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '12px 24px',
    alignItems: 'center',
  } satisfies CSSProperties,

  campoLinea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  } satisfies CSSProperties,

  campoLineaAncho: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    gridColumn: 'span 2',
  } satisfies CSSProperties,

  acciones: {
    marginTop: '22px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  } satisfies CSSProperties,
}

export const erpInputs = {
  normal: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '12px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  compacto: {
    width: '100%',
    maxWidth: '210px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  pequeno: {
    width: '100%',
    maxWidth: '105px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  corto: {
    width: '100%',
    maxWidth: '140px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  medio: {
    width: '100%',
    maxWidth: '180px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  largo: {
    width: '100%',
    maxWidth: '280px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  descripcion: {
    width: '100%',
    maxWidth: '420px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  fecha: {
    width: '100%',
    maxWidth: '145px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  telefono: {
    width: '100%',
    maxWidth: '145px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  rtn: {
    width: '100%',
    maxWidth: '165px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  correo: {
    width: '100%',
    maxWidth: '280px',
    padding: '9px 11px',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoPrincipal,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,
}

export const erpButtons = {
  tabBase: {
    padding: '14px 18px',
    cursor: 'pointer',
    borderRadius: '0',
    fontWeight: 'bold',
    marginRight: '0',
    marginBottom: '0',
    fontSize: '12px',
    minWidth: '120px',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  primary: {
    padding: '10px 14px',
    cursor: 'pointer',
    backgroundColor: erpColors.azulPrincipal,
    color: erpColors.blanco,
    border: `1px solid ${erpColors.azulPrincipal}`,
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '12px',
    lineHeight: 1.2,
    boxShadow: '0 6px 14px rgba(15,23,42,0.10)',
  } satisfies CSSProperties,

  secondary: {
    padding: '10px 14px',
    cursor: 'pointer',
    backgroundColor: erpColors.blanco,
    color: erpColors.textoSecundario,
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '12px',
    lineHeight: 1.2,
  } satisfies CSSProperties,

  menuUser: {
    height: '28px',
    padding: '0 9px',
    borderRadius: '8px',
    border: `1px solid ${erpColors.bordeInput}`,
    backgroundColor: erpColors.fondoSuave,
    color: '#5B6673',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
  } satisfies CSSProperties,
}

export const erpTable = {
  container: {
    overflowX: 'auto',
    border: `1px solid ${erpColors.bordeInput}`,
    borderRadius: '8px',
    backgroundColor: erpColors.blanco,
  } satisfies CSSProperties,

  th: {
    padding: '10px 12px',
    textAlign: 'left',
    color: erpColors.textoSecundario,
    backgroundColor: erpColors.fondoTabla,
    borderBottom: `1px solid ${erpColors.bordeInput}`,
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #EEF2F7',
    fontSize: '12px',
    color: erpColors.textoSecundario,
    verticalAlign: 'middle',
  } satisfies CSSProperties,
}

export function estiloPestanaEstandar(activa: boolean): CSSProperties {
  return {
    ...erpButtons.tabBase,
    backgroundColor: activa ? erpColors.azulPrincipal : erpColors.blanco,
    color: activa ? erpColors.blanco : erpColors.textoSecundario,
    border: `1px solid ${activa ? erpColors.azulPrincipal : erpColors.borde}`,
    boxShadow: activa
      ? '0 8px 18px rgba(15,23,42,0.10)'
      : '0 2px 6px rgba(0,0,0,0.03)',
  }
}
