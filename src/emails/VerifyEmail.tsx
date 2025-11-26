import * as React from 'react'

export function VerifyEmail(props: { verifyUrl: string }) {
  const { verifyUrl } = props
  return (
    <div style={{ fontFamily: 'Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif', color: '#0f172a' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
          <tr>
            <td style={{ padding: '24px' }}>
              <div style={{ maxWidth: 560, margin: '0 auto', background: '#0b1220', borderRadius: 12, border: '1px solid #1e293b' }}>
                <div style={{ padding: 24 }}>
                  <h1 style={{ fontSize: 18, margin: '0 0 12px', color: '#e2e8f0' }}>Bienvenida/o a Inclusiva</h1>
                  <p style={{ margin: '0 0 12px', color: '#cbd5e1' }}>Para activar tu cuenta, verificá tu email haciendo clic en el botón:</p>
                  <p style={{ margin: '20px 0' }}>
                    <a href={verifyUrl} style={{ background: '#0ea5e9', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, display: 'inline-block' }}>
                      Verificar email
                    </a>
                  </p>
                  <p style={{ margin: '12px 0', color: '#94a3b8' }}>Si no funciona, copiá y pegá este enlace en tu navegador:</p>
                  <p style={{ wordBreak: 'break-all', margin: '4px 0', color: '#e2e8f0' }}>{verifyUrl}</p>
                  <hr style={{ border: 'none', borderTop: '1px solid #1e293b', margin: '20px 0' }} />
                  <p style={{ fontSize: 12, color: '#64748b' }}>Si no creaste una cuenta, podés ignorar este email.</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

