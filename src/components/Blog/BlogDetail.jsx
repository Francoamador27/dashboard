import React from 'react';
import useSWR from 'swr';
import { useParams, Link, useNavigate } from 'react-router-dom';
import clienteAxios from '../../config/axios';
import { Calendar, User, Tag, ArrowLeft, Share2, Clock } from 'lucide-react';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const fetcher = (url) => clienteAxios(url).then((res) => res.data);

  const { data, isLoading, error } = useSWR(`/api/posts/${slug}`, fetcher);

  const post = data?.data || data;

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const estimarTiempoLectura = (contenido) => {
    if (!contenido) return 1;
    const palabras = contenido.split(/\s+/).length;
    const minutos = Math.ceil(palabras / 200); // ~200 palabras por minuto
    return minutos;
  };

  const getYouTubeEmbedUrl = (value) => {
    if (!value) return null;
    const raw = value.trim();
    if (!raw) return null;
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    try {
      const url = new URL(withProtocol);
      const host = url.hostname.replace(/^www\./, '');
      let id = '';

      if (host === 'youtu.be') {
        id = url.pathname.slice(1);
      } else if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (url.pathname.startsWith('/watch')) {
          id = url.searchParams.get('v') || '';
        } else if (url.pathname.startsWith('/shorts/')) {
          id = url.pathname.split('/shorts/')[1] || '';
        } else if (url.pathname.startsWith('/embed/')) {
          id = url.pathname.split('/embed/')[1] || '';
        }
      }

      if (!id) return null;
      const cleanId = id.split('?')[0].split('&')[0];
      return `https://www.youtube.com/embed/${cleanId}`;
    } catch (err) {
      return null;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          text: `Lee este artículo: ${post.titulo}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#0891b2] border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">😞</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Artículo no encontrado</h2>
          <p className="text-slate-600 mb-8">
            El artículo que buscas no existe o ha sido eliminado.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold rounded-xl transition-all duration-200"
          >
            <ArrowLeft size={20} />
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header con imagen destacada */}
      <div className="flex justify-center">
        <div className="relative h-[70vh] min-h-[500px] bg-slate-900 overflow-hidden w-full max-w-6xl rounded-b-3xl">
          {post.imagen && (
            <>
              <img
                src={post.imagen}
                alt={post.titulo}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </>
          )}

          {/* Botón volver */}
          <div className="absolute top-8 left-8 z-20">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full transition-all duration-200 border border-white/20"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Volver</span>
            </button>
          </div>

          {/* Contenido del header */}
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-6 pb-12 w-full">
              <div className="max-w-3xl">
              {/* Categoría */}
              {post.categoria && (
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 bg-[#0891b2]/90 backdrop-blur-md text-white text-sm font-black  tracking-widest px-6 py-3 rounded-full shadow-lg border border-white/20">
                    <Tag size={16} />
                    {post.categoria.nombre}
                  </span>
                </div>
              )}

              {/* Título */}
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                {post.titulo}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-amber-300" />
                  <span className="text-sm">{estimarTiempoLectura(post.contenido)} min de lectura</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-200 border border-white/20"
                >
                  <Share2 size={18} />
                  <span className="text-sm font-semibold">Compartir</span>
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del artículo */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Contenido HTML */}
          <article
            className="prose prose-lg prose-slate max-w-none
              prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
              prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-lg
              prose-a:text-[#0891b2] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-slate-700 prose-li:marker:text-[#0891b2]
              prose-blockquote:border-l-4 prose-blockquote:border-[#0891b2] prose-blockquote:bg-cyan-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[#0891b2] prose-code:font-mono prose-code:text-sm
              prose-pre:bg-slate-900 prose-pre:text-slate-100
              prose-img:rounded-2xl prose-img:shadow-xl"
            dangerouslySetInnerHTML={{ __html: post.contenido }}
          />

          {/* Video de YouTube si existe */}
          {(() => {
            const rawUrl = post.youtube_url || post.youtubeUrl;
            if (!rawUrl) return null;
            const embedUrl = getYouTubeEmbedUrl(rawUrl);
            return (
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Video relacionado</h3>
                {embedUrl ? (
                  <div className="aspect-video w-full border rounded-2xl overflow-hidden shadow-xl">
                    <iframe
                      src={embedUrl}
                      title={`Video de ${post.titulo}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Ver video en YouTube
                    <ArrowLeft size={20} className="rotate-180" />
                  </a>
                )}
              </div>
            );
          })()}

          {/* Separador */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Tags/Categoría */}
              {post.categoria && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Categoría:</span>
                  <span className="inline-flex items-center gap-2 bg-cyan-100 text-[#0891b2] px-4 py-2 rounded-full text-sm font-semibold">
                    <Tag size={14} />
                    {post.categoria.nombre}
                  </span>
                </div>
              )}

              {/* Compartir */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold rounded-xl transition-all duration-200"
              >
                <Share2 size={18} />
                Compartir artículo
              </button>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-16 bg-gradient-to-r from-[#0891b2] to-[#0e7490] rounded-3xl p-10 text-white text-center">
            <h3 className="text-3xl font-black mb-4">¿Te gustó este artículo?</h3>
            <p className="text-amber-50 text-lg mb-6">
              Descubre más historias y consejos de viaje en nuestro blog
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0891b2] hover:bg-cyan-50 font-bold rounded-xl transition-all duration-200 shadow-lg"
            >
              Ver más artículos
              <ArrowLeft size={20} className="rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
