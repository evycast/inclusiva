import * as React from 'react'

export function TestEmail(props: { appUrl: string }) {
  const { appUrl } = props
  return (
    <div style={{ fontFamily: 'Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif', color: '#0f172a' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
          <tr>
            <td style={{ padding: '24px' }}>
              <div style={{ maxWidth: 560, margin: '0 auto', background: '#0b1220', borderRadius: 12, border: '1ppx solid #1e293b' }}>
                <div style={{ padding: 24 }}>
                  <h1 style={{ fontSize: 18, margin: '0 0 12px', color: '#e2e8f0' }}>Prueba de correo</h1>
                  <p style={{ margin: '0 0 12px', color: '#cbd5e1' }}>Este es un email de prueba de Inclusiva. Sirve para validar la entrega y el diseño.</p>
                  <p style={{ margin: '20px 0' }}>
                    <a href={appUrl} style={{ background: '#a855f7', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, display: 'inline-block' }}>
                      Abrir Inclusiva
                    </a>
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>Si recibiste este correo, el envío está funcionando correctamente.</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

