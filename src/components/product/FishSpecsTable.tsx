
interface FishSpecsData {
  scientific_name: string
  temp_min: number
  temp_max: number
  ph_min: number
  ph_max: number
  adult_size_cm: number
  difficulty: string
  lifespan_years: number
  feeding: string
  min_volume_liters: number
  water_type: string
}

const LABELS_ES: Record<string, string> = {
  scientific_name: 'Nombre científico',
  temp_min: 'Temp. mínima',
  temp_max: 'Temp. máxima',
  ph_min: 'pH mínimo',
  ph_max: 'pH máximo',
  adult_size_cm: 'Tamaño adulto',
  difficulty: 'Dificultad',
  lifespan_years: 'Esperanza de vida',
  feeding: 'Alimentación',
  min_volume_liters: 'Vol. mínimo',
  water_type: 'Tipo de agua',
}

export default function FishSpecsTable({ specs }: { specs: FishSpecsData }) {
  const rows: { key: string; value: string }[] = [
    { key: 'scientific_name', value: specs.scientific_name },
    { key: 'temp_min', value: `${specs.temp_min}°C - ${specs.temp_max}°C` },
    { key: 'ph_min', value: `${specs.ph_min} - ${specs.ph_max}` },
    { key: 'adult_size_cm', value: `Hasta ${specs.adult_size_cm} cm` },
    { key: 'difficulty', value: specs.difficulty },
    { key: 'lifespan_years', value: `${specs.lifespan_years} años` },
    { key: 'feeding', value: specs.feeding },
    { key: 'min_volume_liters', value: `${specs.min_volume_liters} L` },
    { key: 'water_type', value: specs.water_type },
  ]

  return (
    <div className="bg-arena/50 rounded-2xl p-6">
      <h2 className="font-semibold text-negro-suave mb-4">Especificaciones del pez</h2>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ key, value }) => (
            <tr key={key} className="border-b border-arena/60 last:border-0">
              <td className="py-2 pr-4 text-muted w-1/2">{LABELS_ES[key] || key}</td>
              <td className="py-2 font-medium text-negro-suave">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
