import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import React from 'react';
import WhatsappHref from '../utils/WhatsappUrl';
import useCont from '../hooks/useCont';

const Cta = () => {
    const { contact } = useCont();
    return (
        <section className="bg-white overflow-hidden">
            {/* Final CTA */}
            <div className="max-w-6xl mx-auto px-6 py-24">
                <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#003366] via-blue-800 to-[#003366] rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative bg-[#003366] rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl overflow-hidden">
                        {/* Decoraciones */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full mb-8 border border-white/20">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                                <span className="text-sm font-black text-white  tracking-widest">Presupuesto sin cargo</span>
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
                                ¿Listo para transformar <br className="hidden md:block" /> tu negocio?
                            </h2>
                            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                                Desarrollamos soluciones tecnológicas a medida para tu empresa. <br className="hidden md:block" />
                                <span className="font-bold text-white">Solicitá tu asesoramiento técnico especializado hoy mismo.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
                                <a
                                    href={WhatsappHref({
                                        message: "Hola, me gustaría solicitar información sobre soluciones tecnológicas.",
                                    })}
                                    className="group bg-white hover:bg-slate-50 text-[#003366] px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 active:scale-95"
                                >
                                    <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    PEDIR PRESUPUESTO
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </a>
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <div className="flex flex-wrap items-center justify-center gap-8 text-blue-100">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                        <span className="font-bold text-lg">Envío a Obra</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                        <span className="font-bold text-lg">Garantía Escrita</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                        <span className="font-bold text-lg">Asesoramiento VIP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Cta;
