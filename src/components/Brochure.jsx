import useSWR from "swr";
import clienteAxios from "../config/axios";
import { Download, FileText } from "lucide-react";

const fetcher = (url) => clienteAxios(url).then((res) => res.data);

export default function Brochure() {
  const { data, isLoading } = useSWR("/api/brochure", fetcher, {
    revalidateOnFocus: false,
  });

  const brochure = data?.data ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#fdce27] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!brochure) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <FileText size={48} className="mb-4" />
        <p className="text-lg font-medium">No hay brochure disponible</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-100 min-h-[60vh] flex items-center">
      <div className="max-w-3xl px-6 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[#1c1c1c] mb-4 uppercase tracking-tight">
          {brochure.nombre}
        </h2>
        <p className="mb-10 text-lg font-light text-slate-500">
          Descargá nuestro brochure institucional y conocé todos nuestros
          servicios, proyectos y capacidades.
        </p>
        <a
          href={brochure.archivo}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#fdce27] hover:bg-[#1c1c1c] text-[#1c1c1c] hover:text-[#fdce27] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl transition-colors duration-300 shadow-lg"
        >
          <Download size={20} strokeWidth={2.5} />
          Descargar nuestro Brochure
        </a>
      </div>
    </section>
  );
}
