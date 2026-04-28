import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import skillsData from "@/data/skills.json"
import { Cpu, Tag, Calendar } from "lucide-react"

const categoryColors: Record<string, { bg: string; text: string }> = {
  diseño: { bg: "bg-violet-100", text: "text-violet-700" },
  datos: { bg: "bg-blue-100", text: "text-blue-700" },
  automatizacion: { bg: "bg-amber-100", text: "text-amber-700" },
  marca: { bg: "bg-rose-100", text: "text-rose-700" },
  general: { bg: "bg-slate-100", text: "text-slate-700" },
}

const categoryLabels: Record<string, string> = {
  diseño: "Diseño",
  datos: "Datos",
  automatizacion: "Automatización",
  marca: "Marca",
  general: "General",
}

export default function SkillsPage() {
  const skills = skillsData.skills
  const activeCount = skills.filter((s) => s.active).length

  return (
    <div>
      <Header
        title="Skills"
        description={`${activeCount} activos · ${skills.length} en total · Respaldo de Claude Code Skills`}
      />

      <div className="mb-4 p-4 rounded-lg bg-violet-50 border border-violet-100 text-sm text-violet-700">
        <strong>Tip:</strong> Para instalar el skill <code className="bg-violet-100 px-1 rounded font-mono text-xs">frontend-design</code> de Anthropic, ejecuta en la terminal de Claude Code:
        {" "}<code className="bg-violet-100 px-1 rounded font-mono text-xs">claude plugins add frontend-design@claude-code-plugins</code>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => {
          const cat = categoryColors[skill.category] ?? categoryColors.general
          return (
            <Card key={skill.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${cat.bg}`}>
                    <Cpu className={`h-4 w-4 ${cat.text}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={skill.active ? "default" : "secondary"} className="text-[10px] px-1.5">
                      {skill.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-sm mb-1">{skill.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>

                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cat.bg} ${cat.text}`}>
                    {categoryLabels[skill.category]}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">v{skill.version}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {skill.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground flex items-center gap-0.5">
                      <Tag className="h-2.5 w-2.5" /> {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 pt-3 border-t border-border text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Actualizado: {new Date(skill.updatedAt).toLocaleDateString("es-CL")}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add new skill card */}
        <Card className="border-0 shadow-sm border-dashed border-2 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-5 flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <span className="text-2xl text-muted-foreground">+</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Agregar skill</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">Sube un nuevo skill al repositorio</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
