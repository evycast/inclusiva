import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle, HeartHandshake, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SeguridadPage() {
  return (
    <div className="min-h-screen bg-background text-slate-900 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 border-b border-slate-100">
        <div className="absolute inset-0 bg-gradient-rainbow-soft opacity-30" />
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-6 animate-float">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
            Tu seguridad es nuestra prioridad
          </h1>
          <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            Construimos un espacio seguro, inclusivo y confiable para que puedas conectar con tranquilidad.
            Aquí te contamos cómo nos cuidamos entre todes.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        
        {/* Main Guidelines Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* For Publishers */}
          <div className="bg-white p-8 rounded-[2rem] shadow-friendly border border-slate-100">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-7 h-7 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Al publicar un servicio</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-slate-600">Verificá que tu información de contacto sea correcta, pero evitá compartir datos sensibles (dirección exacta, documentos) en la descripción pública.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-slate-600">Sé claro y honesto con los servicios que ofrecés. La transparencia genera confianza en la comunidad.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-slate-600">Utilizá fotos reales y profesionales de tu trabajo siempre que sea posible para dar mayor credibilidad.</p>
              </li>
            </ul>
          </div>

          {/* For Contractors */}
          <div className="bg-white p-8 rounded-[2rem] shadow-friendly border border-slate-100">
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-pink-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Al contratar o contactar</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-slate-600">Revisá el perfil completo antes de contactar. Si algo te genera dudas, preguntá todo lo necesario antes de coordinar.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-slate-600">Para los primeros encuentros o entrevistas, elegí lugares públicos o seguros y avisá a alguien de confianza.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                <p className="text-slate-600">Evitá realizar pagos por adelantado fuera de los canales acordados o sin haber verificado la identidad de la otra persona.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Community Values */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 text-center mb-16">
          <HeartHandshake className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6 text-slate-900">Cuidarnos es responsabilidad de todes</h2>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
            En Inclusiva, promovemos el respeto, la tolerancia y la diversidad. No toleramos ningún tipo de discriminación, acoso o violencia. Si ves algo que no cumple con nuestros valores, por favor reportalo.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50">
               <h3 className="font-bold text-lg mb-2 text-slate-800">Respeto Mutuo</h3>
               <p className="text-slate-600 text-sm">Tratá a los demás como te gustaría que te traten a vos, valorando la diversidad.</p>
             </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50">
               <h3 className="font-bold text-lg mb-2 text-slate-800">Comunicación Clara</h3>
               <p className="text-slate-600 text-sm">Mantené una comunicación fluida y respetuosa en todo momento.</p>
             </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50">
               <h3 className="font-bold text-lg mb-2 text-slate-800">Confidencialidad</h3>
               <p className="text-slate-600 text-sm">Respetá la privacidad y los datos personales de los demás usuarios.</p>
             </div>
          </div>
        </div>

        {/* Report Banner */}
        <div className="bg-red-50 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-red-100">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">¿Viste algo sospechoso?</h3>
              <p className="text-slate-600">Si encontrás un perfil falso o comportamiento inapropiado, avisanos.</p>
            </div>
          </div>
          <Link 
            href="mailto:soporte@inclusiva.ar" 
            className="px-8 py-3 bg-white text-red-600 font-bold rounded-full shadow-sm hover:shadow-md hover:bg-red-50 transition-all border border-red-100 whitespace-nowrap"
          >
            Reportar problema
          </Link>
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
