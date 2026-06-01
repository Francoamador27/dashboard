import React from 'react';

const ImgFotoo = () => {
    return (
        <div>
            <div className="-translate-y-4 w-80 h-80 transition duration-300 perspective-[1200px] perspective-origin-top group">
                <img
                    alt="cuadrado"
                    src="https://tailwindcss.com/_next/static/media/3d-transforms.ebde7a6a.jpeg"
                    className="absolute inset-0 size-82 rounded-2xl shadow-2xl outline outline-gray-950/5 transition duration-300 transform-3d group-hover:scale-105"
                    tabIndex="0"
                    style={{
                        transform: "none", /* Imagen plana inicialmente */
                        transformStyle: "preserve-3d",
                        transition: "transform 0.5s ease"
                    }}
                    /* Usando CSS personalizado para el efecto hover */
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "rotateX(30deg) rotateY(-5deg) rotateZ(15deg)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                    }}
                />
                <div className="col-start-1 row-start-1 size-82 rounded-2xl bg-gray-950/5 p-2 shadow-inner inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10" />
                <div className="size-full rounded-lg outline-gray-950/10 outline-dashed">
                </div>
            </div>
        </div>
    );
}

export default ImgFotoo;
