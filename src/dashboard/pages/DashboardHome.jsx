import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Images, LayoutGrid, Activity } from "lucide-react";
import api from "../lib/api";
import { imageUrl } from "../hooks/useGaleria";

function StatCard({ icon: Icon, label, value, color = "#c9a84c", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-white/[0.05] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${color}15`,
            border: `1px solid ${color}25`,
          }}
        >
          <Icon size={16} style={{ color }} strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value ?? "—"}
      </p>
      <p className="text-slate-400 dark:text-white/40 text-xs mt-1 font-medium">
        {label}
      </p>
    </motion.div>
  );
}

export default function DashboardHome() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/stats").then((r) => r.data),
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
          Vista general de tu agencia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={Users}
          label="Total clientes"
          value={stats?.total_clientes}
          delay={0}
        />
        <StatCard
          icon={Images}
          label="Imágenes generadas"
          value={stats?.imagenes_generadas}
          delay={0.05}
        />
        <StatCard
          icon={LayoutGrid}
          label="Campañas creadas"
          value={stats?.campanas_creadas}
          delay={0.1}
        />
        <StatCard
          icon={Activity}
          label="Assets pendientes"
          value="—"
          color="#6366f1"
          delay={0.15}
        />
      </div>

      {/* Últimas imágenes */}
      <div>
        <h2 className="text-slate-500 dark:text-white/70 text-sm font-semibold mb-4 uppercase tracking-wider">
          Últimas generaciones
        </h2>

        {stats?.ultimas_imagenes?.length ? (
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.ultimas_imagenes.map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] overflow-hidden"
              >
                {asset.url && (
                  <img
                    src={imageUrl(asset.url)}
                    alt={asset.tipo}
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl p-12 text-center">
            <p className="text-slate-300 dark:text-white/20 text-sm">
              Aún no hay imágenes generadas.
            </p>
            <p className="text-slate-200 dark:text-white/10 text-xs mt-1">
              Usá el Generador IA para crear tu primera pieza.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
