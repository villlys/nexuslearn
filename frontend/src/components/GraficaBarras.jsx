// Componente de gráfica de barras en SVG puro — sin recharts, sin bugs
function GraficaBarras({ datos }) {
  if (!datos || datos.length === 0) return null;

  const altura = 180;
  const anchoBarra = 40;
  const gap = 20;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const anchoTotal = paddingLeft + datos.length * (anchoBarra + gap) + gap;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={anchoTotal} height={altura + paddingBottom + 10} style={{ minWidth: '100%' }}>
        {/* Líneas guía horizontales */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = 10 + (altura - (val / 100) * altura);
          return (
            <g key={val}>
              <line x1={paddingLeft} y1={y} x2={anchoTotal} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <text x={paddingLeft - 6} y={y + 4} textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.4)">{val}</text>
            </g>
          );
        })}

        {/* Barras */}
        {datos.map((d, i) => {
          const x = paddingLeft + gap + i * (anchoBarra + gap);
          const alturaBarra = (d.porcentaje / 100) * altura;
          const y = 10 + altura - alturaBarra;
          const color = d.porcentaje >= 70 ? '#4ade80' : '#fb923c';

          return (
            <g key={i}>
              {/* Barra */}
              <rect
                x={x} y={y}
                width={anchoBarra} height={alturaBarra}
                rx={6} ry={6}
                fill={color}
                opacity={0.85}
              />
              {/* Porcentaje encima */}
              {d.porcentaje > 0 && (
                <text x={x + anchoBarra / 2} y={y - 5} textAnchor="middle" fontSize={11} fill={color} fontWeight="600">
                  {d.porcentaje}%
                </text>
              )}
              {/* Etiqueta abajo */}
              <text x={x + anchoBarra / 2} y={10 + altura + paddingBottom - 10} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.5)">
                {d.pregunta}
              </text>
              {/* Intentos debajo de la etiqueta */}
              <text x={x + anchoBarra / 2} y={10 + altura + paddingBottom + 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)">
                {d.intentos} int.
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default GraficaBarras;