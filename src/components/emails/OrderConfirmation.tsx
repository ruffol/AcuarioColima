interface Props {
  nombre: string
  total: string
  moneda: string
  direccion: string
  items: { nombre: string; cantidad: number; precio: string }[]
}

export default function OrderConfirmationEmail({
  nombre,
  total,
  moneda,
  direccion,
  items,
}: Props) {
  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: 600,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <h1 style={{ color: '#c86a4e', fontSize: 24, marginBottom: 8 }}>
        ¡Gracias por tu compra!
      </h1>
      <p style={{ color: '#292524', fontSize: 16, marginBottom: 24 }}>
        Hola {nombre},
      </p>
      <p style={{ color: '#57534e', fontSize: 14, marginBottom: 24 }}>
        Tu pedido ha sido confirmado. Aquí están los detalles:
      </p>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 24,
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #f5f0eb' }}>
            <th style={{ textAlign: 'left', padding: 8, fontSize: 12, color: '#78716c' }}>
              Producto
            </th>
            <th style={{ textAlign: 'center', padding: 8, fontSize: 12, color: '#78716c' }}>
              Cantidad
            </th>
            <th style={{ textAlign: 'right', padding: 8, fontSize: 12, color: '#78716c' }}>
              Precio
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f5f0eb' }}>
              <td style={{ padding: 8, fontSize: 14, color: '#292524' }}>
                {item.nombre}
              </td>
              <td style={{ textAlign: 'center', padding: 8, fontSize: 14, color: '#57534e' }}>
                {item.cantidad}
              </td>
              <td style={{ textAlign: 'right', padding: 8, fontSize: 14, color: '#292524' }}>
                ${item.precio}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 18, fontWeight: 600, color: '#292524', marginBottom: 8 }}>
        Total: ${total} {moneda}
      </p>
      <p style={{ fontSize: 14, color: '#57534e', marginBottom: 24 }}>
        Enviar a: {direccion}
      </p>

      <p style={{ fontSize: 14, color: '#c86a4e', fontStyle: 'italic' }}>
        ¡Gracias por apoyar el arte mexicano!
      </p>
    </div>
  )
}
