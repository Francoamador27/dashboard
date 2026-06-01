import React, { useEffect, useRef, useState } from 'react';

const Testimonials = () => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Configuramos el observador para saber cuándo se inyectan los testimonios
        const observer = new MutationObserver((mutations) => {
            const widgetDiv = containerRef.current?.querySelector('[data-widget-id]');
            // Si el div del widget tiene hijos, significa que TrustIndex ya inyectó el contenido
            if (widgetDiv && widgetDiv.children.length > 0) {
                setLoading(false);
                observer.disconnect();
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current, { childList: true, subtree: true });
        }

        // 2. Cargamos el script de TrustIndex
        const script = document.createElement('script');
        script.src = 'https://cdn.trustindex.io/loader.js?7b7af9d6023024804e8687b608c';
        script.defer = true;
        script.async = true;

        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }

        // Timeout de seguridad: si en 5 segundos no cargó, quitamos el loading igual
        const timer = setTimeout(() => setLoading(false), 5000);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
            if (containerRef.current && script.parentNode === containerRef.current) {
                containerRef.current.removeChild(script);
            }
        };
    }, []);

    return (
        <section className="py-12 bg-gray-50 sm:py-16 lg:py-20" id="testimonios">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl xl:text-5xl">
                        Lo que dicen nuestros clientes
                    </h2>
                </div>

                <div className="relative">
                    {/* SKELETON LOADER: Se muestra solo mientras carga */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-8"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CONTENEDOR DE TRUSTINDEX */}
                    <div
                        ref={containerRef}
                        className={`trustindex-widget-container transition-opacity duration-500 ${loading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
                        style={{ minHeight: loading ? '0' : '400px', width: '100%' }}
                    >
                        <div data-widget-id="c98894b64a7541282a96c1bca2b"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;