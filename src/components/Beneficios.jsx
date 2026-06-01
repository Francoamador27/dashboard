import React from "react";
import {
  Shield,
  CheckCircle2,
  Star,
  Award,
  Ruler,
  Hammer,
  Clock,
  Truck,
} from "lucide-react";

const benefits = [
  "💻 Desarrollo de sistemas personalizados para tu negocio",
  "🛠️ Soluciones de software de última generación",
  "⚙️ Implementación de hardware enterprise optimizado",
  "📱 Aplicaciones web y móviles responsivas",
  "🎯 Estrategia de marketing digital integral",
  "🚀 Transformación digital acelerada y eficiente",
  "👥 Equipo experto en tecnología y consultoría",
  "🔒 Seguridad y escalabilidad garantizadas",
];

const testimonials = [
  {
    name: "Juan Martínez",
    role: "Director de IT",
    content:
      "Anka Loo Construcciones transformó nuestro sistema de gestión con una solución personalizada. Su equipo fue profesional y el resultado superó nuestras expectativas. ¡Muy recomendados!",
    rating: 5,
    image: "JM",
  },
  {
    name: "Andrea López",
    role: "CEO E-commerce",
    content:
      "El desarrollo de nuestra plataforma digital con Anka Loo Construcciones fue impecable. Escalabilidad, seguridad y un equipo que entiende nuestro negocio. Excelente ROI.",
    rating: 5,
    image: "AL",
  },
];

const Beneficios = () => {
  return (
    <></>
    // <div className="overflow-hidden">
    //     {/* Benefits Section */}
    //     <div className="bg-gradient-to-br from-slate-900 to-[#001f3f] py-24">
    //         <div className="max-w-7xl mx-auto px-6">
    //             <div className="grid lg:grid-cols-2 gap-16 items-center">
    //                 <div className="relative">
    //                     <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

    //                     <div className="relative z-10">
    //                         <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-8 border border-white/10">
    //                             <Award className="w-4 h-4 text-yellow-400" />
    //                             <span className="text-sm font-bold text-white  tracking-wider">Calidad Certificada</span>
    //                         </div>
    //                         <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
    //                             ¿Por qué elegirnos?
    //                         </h2>
    //                         <p className="text-slate-300 text-xl mb-10 leading-relaxed font-light">
    //                             Convertimos tus sueños en realidad con experiencias de viaje que combinan aventura,
    //                             confort y los mejores destinos del mundo.
    //                         </p>
    //                         <div className="grid gap-4">
    //                             {benefits.map((benefit, idx) => (
    //                                 <div key={idx} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all duration-300 group">
    //                                     <div className="bg-[#0891b2]/20 p-2 rounded-lg group-hover:bg-[#0891b2]/40 transition-colors">
    //                                         <CheckCircle2 className="w-5 h-5 text-[#0891b2] flex-shrink-0" />
    //                                     </div>
    //                                     <span className="text-slate-200 text-lg font-medium">{benefit}</span>
    //                                 </div>
    //                             ))}
    //                         </div>
    //                     </div>
    //                 </div>

    //                 <div className="space-y-8 relative">
    //                     <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-slate-500/10 rounded-full blur-3xl"></div>

    //                     {testimonials.map((testimonial, idx) => (
    //                         <div key={idx} className="relative z-10 bg-white shadow-2xl rounded-3xl p-8 border border-slate-100 hover:translate-y-[-5px] transition-transform duration-500">
    //                             <div className="flex gap-1 mb-6">
    //                                 {[...Array(testimonial.rating)].map((_, i) => (
    //                                     <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
    //                                 ))}
    //                             </div>
    //                             <p className="text-slate-700 text-xl mb-8 leading-relaxed font-medium italic">"{testimonial.content}"</p>
    //                             <div className="flex items-center gap-4">
    //                                 <div className="w-14 h-14 bg-gradient-to-br from-[#0891b2] to-cyan-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
    //                                     {testimonial.image}
    //                                 </div>
    //                                 <div>
    //                                     <p className="text-slate-900 font-black text-lg">{testimonial.name}</p>
    //                                     <p className="text-slate-500 font-bold  text-xs tracking-widest">{testimonial.role}</p>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     ))}

    //                     {/* Card de confianza adicional */}
    //                     <div className="relative z-10 bg-gradient-to-br from-[#0891b2] to-cyan-700 rounded-3xl p-8 shadow-2xl border border-white/10">
    //                         <div className="flex items-center gap-4 mb-6">
    //                             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
    //                                 <Shield className="w-7 h-7 text-white" />
    //                             </div>
    //                             <div>
    //                                 <h4 className="text-white font-black text-xl">Respaldo Garantizado</h4>
    //                                 <p className="text-amber-100 font-bold text-sm">Agencia Certificada</p>
    //                             </div>
    //                         </div>
    //                         <p className="text-white/95 leading-relaxed text-lg font-light">
    //                             Como agencia especializada, trabajamos directamente con los mejores proveedores,
    //                             asegurando las mejores tarifas del mercado y un servicio personalizado en cada viaje.
    //                         </p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // </div>
  );
};

export default Beneficios;
