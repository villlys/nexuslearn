{!cargando && datosGrafica.length > 0 && historial.length > 0 && (
  <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
    <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
      <i className="ti ti-chart-bar text-green-300"></i>
      Rendimiento por pregunta
    </h2>
    <p className="text-white/40 text-xs mb-4">% de aciertos por pregunta</p>
    <GraficaBarras datos={datosGrafica} />
    <div className="flex items-center gap-4 mt-3 text-xs">
      <span className="flex items-center gap-1.5 text-white/50">
        <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span> ≥ 70% de aciertos
      </span>
      <span className="flex items-center gap-1.5 text-white/50">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Necesita refuerzo
      </span>
    </div>
  </div>
)}