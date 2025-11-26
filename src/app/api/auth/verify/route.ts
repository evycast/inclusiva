import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) {
        return NextResponse.redirect(new URL('/verified?error=token_required', req.url));
    }
    const vt = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vt) {
        return NextResponse.redirect(new URL('/verified?error=invalid_token', req.url));
    }
    if (vt.expires < new Date()) {
        return NextResponse.redirect(new URL('/verified?error=expired_token', req.url));
    }
    const user = await prisma.user.findUnique({ where: { email: vt.identifier } });
    if (!user) {
        return NextResponse.redirect(new URL('/verified?error=user_not_found', req.url));
    }
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date(), status: 'approved' } });
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(new URL('/verified?ok=1', req.url));
}
