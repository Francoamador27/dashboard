import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#fefbf5] text-gray-800 px-6 text-center">
            <h1 className="text-6xl font-bold text-[#008DD2] mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">¡Uy! No encontramos lo que buscás</h2>
            <p className="mb-6 max-w-md text-gray-600">
                Es posible que el enlace esté roto o la página ya no exista.
                Pero no te preocupes, seguí navegando y encontrá imanes únicos para tus momentos inolvidables.
            </p>

            <div className="flex gap-4 flex-col sm:flex-row">
                <Link
                    to="/"
                    className="bg-[#008DD2] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#0072ad] transition"
                >
                    Volver al inicio
                </Link>
                <Link
                    to="/product"
                    className="bg-white border border-[#008DD2] text-[#008DD2] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#e6f7fd] transition"
                >
                    Ir a comprar
                </Link>
            </div>
        </div>
    );
}
