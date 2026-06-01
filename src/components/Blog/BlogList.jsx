import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import clienteAxios from '../../config/axios';
import { Calendar, Search, Tag, ArrowRight } from 'lucide-react';

export default function BlogList() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  const fetcher = (url) => clienteAxios(url).then((res) => res.data);

  const { data: postsData, isLoading } = useSWR('/api/posts', fetcher);
  const { data: categoriasData } = useSWR('/api/posts-categorias', fetcher);

  const posts = useMemo(() => {
    if (Array.isArray(postsData?.data)) return postsData.data;
    if (Array.isArray(postsData)) return postsData;
    return [];
  }, [postsData]);

  const categorias = useMemo(() => {
    if (Array.isArray(categoriasData?.data)) return categoriasData.data;
    if (Array.isArray(categoriasData)) return categoriasData;
    return [];
  }, [categoriasData]);

  // Filtrar posts
  const postsFiltrados = useMemo(() => {
    return posts.filter((post) => {
      const matchBusqueda = busqueda
        ? post.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          (post.contenido || '').toLowerCase().includes(busqueda.toLowerCase())
        : true;

      const matchCategoria = categoriaId
        ? post.categoria_id === parseInt(categoriaId)
        : true;

      return matchBusqueda && matchCategoria;
    });
  }, [posts, busqueda, categoriaId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const extractText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const PostCard = ({ post, idx }) => {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group relative rounded-lg overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      >
        <div className="relative">
          <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
            {post.imagen ? (
              <img
                src={post.imagen}
                alt={post.titulo}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl text-slate-300">📰</span>
              </div>
            )}
          </div>

          {post.categoria && (
            <div className="absolute top-2 left-2">
              <span className="bg-white/95 text-slate-700 text-[9px] font-semibold  tracking-widest px-2 py-1 rounded-full border border-slate-200 shadow-sm">
                {post.categoria.nombre}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] mb-1">
            <Calendar size={14} />
            <span>{formatDate(post.publicado_en)}</span>
          </div>

          <h3 className="text-sm font-semibold mb-1.5 tracking-tight leading-snug line-clamp-2 text-slate-900">
            {post.titulo}
          </h3>

          <p className="text-slate-600 text-xs mb-2 leading-relaxed line-clamp-2">
            {extractText(post.contenido || '')}
          </p>

          <div className="flex items-center gap-1 text-xs text-slate-700 group-hover:text-slate-900 font-medium">
            <span>Leer más</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <div className="border-b border-slate-200 bg-white ">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="py-10 text-5xl font-bold text-slate-900">
              Blog  
            </h1>
            <p className="text-slate-500 text-sm mt-1">Descubre historias, guías y artículos de interés</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Search Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Search size={18} className="text-[#0891b2]" />
                  <label className="text-sm font-semibold text-slate-900">Buscar</label>
                </div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Título o contenido..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-[#0891b2] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 transition-all duration-200 text-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={18} className="text-[#0891b2]" />
                  <label className="text-sm font-semibold text-slate-900">Categorías</label>
                </div>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-[#0891b2] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 transition-all duration-200 text-sm bg-white cursor-pointer"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(busqueda || categoriaId) && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setCategoriaId('');
                  }}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:shadow-lg text-white text-sm font-semibold rounded-lg transition-all duration-200"
                >
                  Limpiar filtros
                </button>
              )}

              {/* Results Counter */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs text-slate-600">
                  <span className="font-bold text-[#0891b2]">{postsFiltrados.length}</span> de{' '}
                  <span className="font-bold text-slate-900">{posts.length}</span> artículos
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Loading */}
            {isLoading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-[#0891b2]"></div>
                <p className="mt-3 text-slate-600 text-sm font-medium">Cargando artículos...</p>
              </div>
            )}

            {/* Grid de Posts */}
            {!isLoading && postsFiltrados.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {postsFiltrados.map((post, idx) => (
                  <PostCard key={post.id} post={post} idx={idx} />
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!isLoading && postsFiltrados.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-1">No se encontraron artículos</h3>
                <p className="text-slate-600 text-sm mb-5">
                  Intenta ajustar tus filtros de búsqueda
                </p>
                <button
                  onClick={() => {
                    setBusqueda('');
                    setCategoriaId('');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:shadow-lg text-white text-sm font-semibold rounded-lg transition-all duration-200"
                >
                  Ver todos los artículos
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
