import React from 'react';
import { Heart, Share2, MessageCircle, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ColaborarPage() {
  return (
    <div className="min-h-screen bg-background text-slate-900 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 border-b border-slate-100">
        <div className="absolute inset-0 bg-gradient-rainbow-soft opacity-30" />
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-6 animate-pulse">
            <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
            Ayudanos a seguir creciendo
          </h1>
          <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            Inclusiva es un proyecto 100% autogestionado y gratuito. Tu colaboración nos permite mantener la plataforma activa y seguir creando oportunidades para todes.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        
        {/* Donation Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-friendly p-8 md:p-12 border border-slate-100 mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-[10rem] opacity-50 pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-slate-900">Tu aporte hace la diferencia</h2>
                    <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                        No recibimos financiación externa ni cobramos comisiones. Todo lo que ves es fruto del esfuerzo de la comunidad y de personas como vos que creen en este proyecto.
                    </p>
                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                        Con una pequeña donación nos ayudás a pagar servidores, dominios y herramientas de desarrollo para que Inclusiva siga siendo libre y gratuita.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                         <Link 
                            href="https://link.mercadopago.com.ar/inclusiva" 
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            <Gift className="w-5 h-5" />
                            Donar con Mercado Pago
                        </Link>
                    </div>
                </div>
                
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h3 className="font-bold text-xl mb-4 text-slate-800">¿En qué invertimos tu ayuda?</h3>
                    <ul className="space-y-4">
                        {[
                            'Pago de servidores y base de datos',
                            'Mantenimiento del dominio web',
                            'Herramientas de seguridad y monitoreo',
                            'Desarrollo de nuevas funcionalidades',
                            'Difusión para llegar a más personas'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-700">
                                <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Other ways to help */}
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-900">Otras formas de colaborar</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Share2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Difundí el proyecto</h3>
                <p className="text-slate-600 mb-6">
                    Compartí Inclusiva en tus redes sociales, grupos de WhatsApp y con tus amigues. Cuanta más gente se sume, más oportunidades creamos.
                </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Danos tu feedback</h3>
                <p className="text-slate-600 mb-6">
                    ¿Tenés ideas para mejorar? ¿Encontraste un error? Escribinos. Construimos esta plataforma escuchando a la comunidad.
                </p>
                <Link href="mailto:hola@inclusiva.ar" className="text-violet-600 font-bold inline-flex items-center gap-2 hover:gap-3 transition-all">
                    Escribinos <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>

        <div className="text-center mt-12">
            <Link href="/" className="text-slate-500 hover:text-primary font-medium transition-colors">
                ← Volver al inicio
            </Link>
        </div>

      </div>
    </div>
  );
}
