import { Resend } from 'resend';
import * as React from 'react'
import { VerifyEmail } from '@/emails/VerifyEmail'
import { TestEmail } from '@/emails/TestEmail'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
	if (!process.env.RESEND_API_KEY) return;
	const from =
		process.env.NODE_ENV === 'production'
			? process.env.RESEND_FROM_EMAIL || 'no-reply@inclusiva.dev'
			: 'onboarding@resend.dev';
	const subject = 'Verificá tu email — Inclusiva';
    try {
        await resend.emails.send({ from, to, subject, react: React.createElement(VerifyEmail, { verifyUrl }) });
    } catch {
        const html = await render(React.createElement(VerifyEmail, { verifyUrl }))
        await resend.emails.send({ from, to, subject, html })
    }
}

export async function sendTestEmail(to: string): Promise<string> {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing')
    const from = process.env.NODE_ENV === 'production'
        ? (process.env.RESEND_FROM_EMAIL || 'no-reply@inclusiva.dev')
        : 'onboarding@resend.dev'
    const subject = 'Prueba de correo — Inclusiva'
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    let resp = await resend.emails.send({ from, to, subject, react: React.createElement(TestEmail, { appUrl }) })
    const id = (resp as { data?: { id?: string }; error?: unknown }).data?.id
    if (!id) {
        const html = await render(React.createElement(TestEmail, { appUrl }))
        resp = await resend.emails.send({ from, to, subject, html })
        const id2 = (resp as { data?: { id?: string }; error?: unknown }).data?.id
        if (!id2) {
            const err = (resp as { error?: { message?: string } }).error
            throw new Error(err?.message ?? 'Resend send failed')
        }
        return id2
    }
    return id ?? ''
}
