import { useState, useMemo, useRef, useEffect } from "react";
import {
  Beef, Wheat, Droplet, Plus, Minus, Trash2, User, Footprints,
  Dumbbell, Sunrise, Sun, Moon, Search, Gauge as GaugeIcon, X, ChevronDown, ChevronUp,
  Lightbulb, Camera, ImageOff, Scale, Layers, ChevronRight, ArrowLeft, ArrowUp, ArrowDown, Copy,
  UtensilsCrossed,
} from "lucide-react";

/* ---------------------------------------------------------
   BASE DE ALIMENTOS (valores por 100 g, salvo que se indique)
--------------------------------------------------------- */
const FOOD_DB_INITIAL = [
  { id: "f1", name: "Arroz blanco cocido", kcal: 130, p: 2.7, c: 28.2, f: 0.3, icon: "🍚" },
  { id: "f2", name: "Pechuga de pollo cocida", kcal: 165, p: 31, c: 0, f: 3.6, icon: "🍗" },
  { id: "f3", name: "Huevo entero", kcal: 155, p: 13, c: 1.1, f: 11, icon: "🥚" },
  { id: "f4", name: "Avena", kcal: 389, p: 16.9, c: 66.3, f: 6.9, icon: "🥣" },
  { id: "f5", name: "Pan integral", kcal: 247, p: 13, c: 41, f: 3.4, icon: "🍞" },
  { id: "f6", name: "Atún en agua", kcal: 116, p: 26, c: 0, f: 1, icon: "🐟" },
  { id: "f7", name: "Frijoles negros cocidos", kcal: 132, p: 8.9, c: 23.7, f: 0.5, icon: "🫘" },
  { id: "f8", name: "Aguacate", kcal: 160, p: 2, c: 8.5, f: 14.7, icon: "🥑" },
  { id: "f9", name: "Plátano", kcal: 89, p: 1.1, c: 22.8, f: 0.3, icon: "🍌" },
  { id: "f10", name: "Almendras", kcal: 579, p: 21, c: 22, f: 50, icon: "🌰" },
  { id: "f11", name: "Leche entera", kcal: 61, p: 3.2, c: 4.8, f: 3.3, icon: "🥛" },
  { id: "f12", name: "Yogur griego natural", kcal: 59, p: 10, c: 3.6, f: 0.4, icon: "🍶" },
  { id: "f13", name: "Salmón", kcal: 208, p: 20, c: 0, f: 13, icon: "🍣" },
  { id: "f14", name: "Carne de res molida 90/10", kcal: 176, p: 20, c: 0, f: 10, icon: "🥩" },
  { id: "f15", name: "Tortilla de maíz", kcal: 218, p: 5.7, c: 44.6, f: 2.3, icon: "🌽" },
  { id: "f16", name: "Camote cocido", kcal: 90, p: 2, c: 20.7, f: 0.1, icon: "🍠" },
  { id: "f17", name: "Brócoli", kcal: 34, p: 2.8, c: 6.6, f: 0.4, icon: "🥦" },
  { id: "f18", name: "Queso panela", kcal: 250, p: 18, c: 3, f: 19, icon: "🧀" },
  { id: "f19", name: "Mantequilla de maní", kcal: 588, p: 25, c: 20, f: 50, icon: "🥜" },
  { id: "f20", name: "Lentejas cocidas", kcal: 116, p: 9, c: 20, f: 0.4, icon: "🍲" },
  // valores de la etiqueta real del producto (San Juan, claras líquidas pasteurizadas): 42 kcal / 100 ml
  { id: "f21", name: "Claras de huevo líquidas (San Juan)", kcal: 42, p: 10, c: 1, f: 0, icon: "🫙" },
];

const round = (n, d = 0) => {
  const m = 10 ** d;
  return Math.round((n + Number.EPSILON) * m) / m;
};
const uid = () => Math.random().toString(36).slice(2, 10);

function addDaysToDate(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function formatDateEs(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

/* ---------------------------------------------------------
   BASE DE EJERCICIOS (Fase 2 — precargada)
--------------------------------------------------------- */
const DEFAULT_EXERCISE_CATALOG = [
  { name: "Sentadilla", muscleGroup: "Pierna" },
  { name: "Peso muerto", muscleGroup: "Espalda / pierna" },
  { name: "Peso muerto rumano", muscleGroup: "Isquiotibiales" },
  { name: "Press de banca", muscleGroup: "Pecho" },
  { name: "Press inclinado", muscleGroup: "Pecho" },
  { name: "Press militar", muscleGroup: "Hombro" },
  { name: "Elevaciones laterales", muscleGroup: "Hombro" },
  { name: "Remo", muscleGroup: "Espalda" },
  { name: "Jalón al pecho", muscleGroup: "Espalda" },
  { name: "Dominadas", muscleGroup: "Espalda" },
  { name: "Curl de bíceps", muscleGroup: "Bíceps" },
  { name: "Curl martillo", muscleGroup: "Bíceps" },
  { name: "Extensión de tríceps", muscleGroup: "Tríceps" },
  { name: "Press francés", muscleGroup: "Tríceps" },
  { name: "Fondos", muscleGroup: "Tríceps / pecho" },
  { name: "Prensa de piernas", muscleGroup: "Pierna" },
  { name: "Zancadas", muscleGroup: "Pierna" },
  { name: "Extensión de cuádriceps", muscleGroup: "Cuádriceps" },
  { name: "Curl femoral", muscleGroup: "Isquiotibiales" },
  { name: "Hip thrust", muscleGroup: "Glúteo" },
  { name: "Gemelos de pie", muscleGroup: "Pantorrilla" },
  { name: "Face pull", muscleGroup: "Hombro posterior" },
  { name: "Plancha", muscleGroup: "Core" },
  { name: "Abdominales", muscleGroup: "Core" },
].map((e, i) => ({ id: `ex${i + 1}`, isCustom: false, ...e }));

const backBtnStyle = { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };
const iconBtnStyle = { background: "var(--panel2)", border: "1px solid var(--border)", borderRadius: 7, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-dim)" };
const dashedButtonStyle = { width: "100%", padding: "10px", borderRadius: 9, border: "1px dashed var(--border)", background: "#0D0B14", color: "var(--accent)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };
const primaryButtonStyle = { width: "100%", padding: "11px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#07060B", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------
   CÁLCULOS
--------------------------------------------------------- */
function calcBMR({ sex, age, weight, height }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === "M" ? base + 5 : base - 161;
}

const KCAL_PER_STEP_PER_KG = 0.04 / 70;
const KCAL_PER_KG_PER_SESSION = 4.3;

function calcStepsCalories(weight, steps) {
  return steps * weight * KCAL_PER_STEP_PER_KG;
}
function calcTrainingCalories(weight, gymDays) {
  return (Math.min(gymDays, 7) * (weight * KCAL_PER_KG_PER_SESSION)) / 7;
}
function calcTargetCalories(tdee, goal, deficitAmount, surplusAmount) {
  if (goal === "deficit") return tdee - deficitAmount;
  if (goal === "volumen") return tdee + surplusAmount;
  return tdee;
}

const GOAL_META = {
  deficit: { label: "Déficit", sub: "-20%", color: "var(--carbs)" },
  mantenimiento: { label: "Mantenimiento", sub: "±0%", color: "var(--accent2)" },
  volumen: { label: "Volumen", sub: "+12%", color: "var(--accent)" },
};

const DEFICIT_OPTIONS = [
  { value: 200, label: "-200 kcal", sub: "Conservador", color: "var(--accent2)", advice: "Pérdida lenta y sostenible. La opción más fácil de mantener a largo plazo y la que menos músculo arriesga." },
  { value: 300, label: "-300 kcal", sub: "Moderado", color: "var(--accent2)", advice: "Buen equilibrio entre velocidad de pérdida y calidad de vida. Es el punto de partida recomendado para la mayoría." },
  { value: 400, label: "-400 kcal", sub: "Moderado-alto", color: "var(--accent)", advice: "Resultados algo más rápidos, pero ya exige más disciplina y buen descanso para no sentirte agotado en el gym." },
  { value: 500, label: "-500 kcal", sub: "Agresivo", color: "var(--fat)", advice: "Advertencia: ritmo de ~0.5 kg/semana. Vigila tu fuerza y energía; si bajan mucho, es señal de que es demasiado." },
  { value: 600, label: "-600 kcal", sub: "Muy agresivo", color: "var(--danger)", advice: "Advertencia: alto riesgo de perder músculo y rendimiento. Solo recomendable por periodos cortos y con proteína alta." },
];

const SURPLUS_OPTIONS = [
  { value: 200, label: "+200 kcal", sub: "Conservador", color: "var(--accent2)", advice: "Ganancia magra con mínima grasa acumulada. La opción más lenta pero más limpia a largo plazo." },
  { value: 300, label: "+300 kcal", sub: "Moderado", color: "var(--accent2)", advice: "Buen balance entre ganancia de músculo y grasa para la mayoría de las personas." },
  { value: 400, label: "+400 kcal", sub: "Moderado-alto", color: "var(--fat)", advice: "Más energía disponible para entrenar duro, a cambio de acumular algo más de grasa." },
  { value: 500, label: "+500 kcal", sub: "Agresivo", color: "var(--danger)", advice: "Advertencia: ganancia rápida, pero buena parte será grasa. Útil solo en bloques cortos y planificados." },
];

/* ---- guías educativas para proteína y grasa ---- */
function proteinGuidance(goal, gymDays) {
  const trains = gymDays >= 3;
  let base = trains
    ? "Como entrenas con regularidad, 1.8–2.2 g/kg de tu peso es el rango que mejor sostiene el mantenimiento o crecimiento muscular."
    : "Entrenando menos días, con 1.4–1.8 g/kg normalmente cubres tus necesidades sin excederte.";
  let extra = "";
  if (goal === "deficit") extra = " En déficit conviene irte al extremo alto del rango: es lo que más te ayuda a proteger el músculo mientras pierdes grasa.";
  if (goal === "volumen") extra = " En volumen puedes quedarte en la parte media-baja del rango, porque el excedente calórico ya favorece la ganancia muscular.";
  return base + extra;
}
function fatGuidance(goal) {
  let base = "Muy poca grasa (menos de ~20%) puede afectar la producción hormonal y la absorción de vitaminas A, D, E y K. Demasiada grasa deja poco espacio para carbohidratos, que son el combustible principal en el gym.";
  let extra = " Para alguien que entrena, 25–30% suele ser el punto medio: cuida las hormonas y deja carbohidratos suficientes para rendir.";
  if (goal === "deficit") extra = " En déficit, moverte al extremo bajo (20–25%) te da más margen de carbohidratos y saciedad mientras comes menos calorías en total.";
  return base + extra;
}

/* ---------------------------------------------------------
   GAUGE — medidor tipo tanque de gasolina
--------------------------------------------------------- */
function CalorieGauge({ consumed, target }) {
  const pct = target > 0 ? (consumed / target) * 100 : 0;
  const gaugeMax = 120;
  const shown = Math.min(pct, gaugeMax);
  const angle = 180 - (shown / gaugeMax) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 150, cy = 152, rNeedle = 106, rArc = 122;
  const tipX = cx + rNeedle * Math.cos(rad);
  const tipY = cy - rNeedle * Math.sin(rad);

  let needleColor = "var(--accent2)";
  if (pct >= 100 && pct < 110) needleColor = "var(--accent)";
  if (pct >= 110) needleColor = "var(--danger)";

  const ticks = [0, 25, 50, 75, 100, 120];
  const arcPoint = (p) => {
    const a = 180 - (Math.min(p, gaugeMax) / gaugeMax) * 180;
    const r = (a * Math.PI) / 180;
    return [cx + rArc * Math.cos(r), cy - rArc * Math.sin(r)];
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 320, margin: "0 auto" }}>
      <svg viewBox="0 0 300 175" style={{ width: "100%", display: "block" }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2A3244" />
            <stop offset="55%" stopColor="var(--accent2)" />
            <stop offset="85%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--danger)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M 28 152 A 122 122 0 0 1 272 152" fill="none" stroke="#1E1929" strokeWidth="14" strokeLinecap="round" />
        <path
          d={`M 28 152 A 122 122 0 0 1 ${arcPoint(shown)[0].toFixed(2)} ${arcPoint(shown)[1].toFixed(2)}`}
          fill="none" stroke="url(#arcGrad)" strokeWidth="14" strokeLinecap="round"
        />
        {ticks.map((t) => {
          const a = 180 - (t / gaugeMax) * 180;
          const r = (a * Math.PI) / 180;
          const x1 = cx + 100 * Math.cos(r), y1 = cy - 100 * Math.sin(r);
          const x2 = cx + 112 * Math.cos(r), y2 = cy - 112 * Math.sin(r);
          const lx = cx + 88 * Math.cos(r), ly = cy - 88 * Math.sin(r);
          return (
            <g key={t}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4B5468" strokeWidth="2" />
              <text x={lx} y={ly} fill="#6B7488" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" dominantBaseline="middle">{t}</text>
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke={needleColor} strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
        <circle cx={cx} cy={cy} r="9" fill="#07060B" stroke={needleColor} strokeWidth="3" />
      </svg>
      <div style={{ textAlign: "center", marginTop: -8 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 34, fontWeight: 700, color: "var(--text)", letterSpacing: 1 }}>
          {round(consumed)} <span style={{ fontSize: 15, color: "var(--text-dim)" }}>/ {round(target)} kcal</span>
        </div>
        <div style={{ fontSize: 12, color: pct > 105 ? "var(--danger)" : "var(--text-dim)", marginTop: 2, textTransform: "uppercase", letterSpacing: 1.5 }}>
          {pct > 105 ? `Excedido +${round(consumed - target)} kcal` : `Restan ${round(Math.max(target - consumed, 0))} kcal`}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   GRÁFICA DE PESO CORPORAL
--------------------------------------------------------- */
function WeightChart({ logs }) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) {
    return <div style={{ fontSize: 11.5, color: "var(--text-dim)", padding: "10px 0" }}>Registra al menos 2 días para ver tu tendencia aquí.</div>;
  }
  const kg = sorted.map((w) => (w.unit === "lb" ? w.weight * 0.453592 : w.weight));
  const min = Math.min(...kg), max = Math.max(...kg);
  const pad = (max - min) * 0.2 || 1;
  const yMin = min - pad, yMax = max + pad;
  const W = 300, H = 110, mX = 8, mY = 12;
  const pts = kg.map((w, i) => [
    mX + (i / (sorted.length - 1)) * (W - mX * 2),
    mY + (1 - (w - yMin) / (yMax - yMin)) * (H - mY * 2),
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <filter id="weightGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#weightGlow)" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 ? "var(--accent)" : "var(--accent2)"} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-dim)", marginTop: 4 }}>
        <span>{formatDateEs(sorted[0].date)} · {round(min, 1)}kg</span>
        <span>{formatDateEs(sorted[sorted.length - 1].date)} · {round(max, 1)}kg</span>
      </div>
    </div>
  );
}

function MacroBar({ icon: Icon, label, consumed, target, color }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>
          <Icon size={13} color={color} /> {label}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "var(--text)" }}>
          {round(consumed)}g <span style={{ color: "var(--text-dim)" }}>/ {round(target)}g</span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: "#1E1929", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5, transition: "width .3s ease", boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ÍCONO / FOTO DE ALIMENTO
--------------------------------------------------------- */
function FoodIcon({ food, size = 36 }) {
  if (food.image) {
    return <img src={food.image} alt={food.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--panel2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5, flexShrink: 0 }}>
      {food.icon || "🍽️"}
    </div>
  );
}

/* ---------------------------------------------------------
   UI COMPARTIDA
--------------------------------------------------------- */
function Panel({ children, style }) {
  return <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, ...style }}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}
function TipBox({ children }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 6, padding: "9px 10px", background: "var(--panel2)", border: "1px solid var(--border)", borderRadius: 8 }}>
      <Lightbulb size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 11.5, color: "var(--text-dim)", lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#0D0B14", border: "1px solid var(--border)", borderRadius: 8,
  padding: "9px 11px", color: "var(--text)", fontFamily: "'JetBrains Mono', monospace",
  fontSize: 14, outline: "none", boxSizing: "border-box",
};
const selectStyle = { ...inputStyle, fontFamily: "'Inter', sans-serif" };

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: "1 1 auto", minWidth: 90, padding: "10px 12px", borderRadius: 9,
              border: `1px solid ${active ? opt.color || "var(--accent)" : "var(--border)"}`,
              background: active ? `${opt.color || "var(--accent)"}1A` : "#0D0B14",
              color: active ? opt.color || "var(--accent)" : "var(--text-dim)",
              fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all .15s ease",
            }}
          >
            <div>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 2 }}>{opt.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

function ModalShell({ title, onClose, children, wide }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(5,7,11,0.72)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "18px 18px 0 0", width: "100%", maxWidth: wide ? 520 : 460, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>{title}</div>
          <button onClick={onClose} style={{ background: "#1E1929", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color="var(--text-dim)" />
          </button>
        </div>
        <div style={{ padding: 18, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   APP PRINCIPAL
--------------------------------------------------------- */
const STORAGE_KEY = "nutridash-data-v1";
function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function NutriDash() {
  const [stored] = useState(loadStored);

  const [profile, setProfile] = useState(stored.profile ?? { sex: "M", age: 25, weight: 70, height: 170 });
  const [steps, setSteps] = useState(stored.steps ?? 6000);
  const [gymDays, setGymDays] = useState(stored.gymDays ?? 3);
  const [goal, setGoal] = useState(stored.goal ?? "mantenimiento");
  const [deficitAmount, setDeficitAmount] = useState(stored.deficitAmount ?? 500);
  const [surplusAmount, setSurplusAmount] = useState(stored.surplusAmount ?? 300);
  const [proteinPerKg, setProteinPerKg] = useState(stored.proteinPerKg ?? 2.0);
  const [fatPercent, setFatPercent] = useState(stored.fatPercent ?? 25);

  const [foods, setFoods] = useState(stored.foods ?? FOOD_DB_INITIAL);
  const [mealTemplates, setMealTemplates] = useState(stored.mealTemplates ?? []); // {id, name, items}
  const [saveTemplateMealId, setSaveTemplateMealId] = useState(null);
  const [templateNameDraft, setTemplateNameDraft] = useState("");
  const [templatePickerMealId, setTemplatePickerMealId] = useState(null);
  const [mealCount, setMealCount] = useState(stored.mealCount ?? 3);
  const [meals, setMeals] = useState(stored.meals ?? (() => Array.from({ length: 3 }, (_, i) => ({ id: uid(), name: `Comida ${i + 1}`, items: [] }))));

  useEffect(() => {
    setMeals((prev) => {
      if (mealCount === prev.length) return prev;
      if (mealCount > prev.length) {
        const extra = Array.from({ length: mealCount - prev.length }, (_, i) => ({ id: uid(), name: `Comida ${prev.length + i + 1}`, items: [] }));
        return [...prev, ...extra];
      }
      return prev.slice(0, mealCount);
    });
  }, [mealCount]);




  const [pickerMeal, setPickerMeal] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerGrams, setPickerGrams] = useState({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", portion: 100, kcal: "", p: "", c: "", f: "", image: null });
  const [customError, setCustomError] = useState("");
  const fileInputRef = useRef(null);

  /* ---- Fase 2: entrenamiento + Fase 3: navegación e identidad ---- */
  const [appView, setAppView] = useState("inicio"); // 'inicio' | 'perfil' | 'nutricion' | 'entrenamiento'
  const [account, setAccount] = useState(stored.account ?? { name: "", email: "", password: "" });


  const [weightLogs, setWeightLogs] = useState(stored.weightLogs ?? []);
  const [weightDraft, setWeightDraft] = useState({ weight: "", unit: "kg" });

  const [catalog, setCatalog] = useState(stored.catalog ?? DEFAULT_EXERCISE_CATALOG);
  const [blocks, setBlocks] = useState(stored.blocks ?? []);
  const [weeks, setWeeks] = useState(stored.weeks ?? []);
  const [days, setDays] = useState(stored.days ?? []);
  const [dayExercises, setDayExercises] = useState(stored.dayExercises ?? []);
  const [sets, setSets] = useState(stored.sets ?? []);

  const [activeBlockId, setActiveBlockId] = useState(null);
  const [expandedWeekId, setExpandedWeekId] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);

  const [showNewBlockModal, setShowNewBlockModal] = useState(false);
  const [newBlockForm, setNewBlockForm] = useState({ name: "", startDate: todayISO(), endDate: "", goal: "mantenimiento" });

  const [addDayWeekId, setAddDayWeekId] = useState(null);
  const [addDayDate, setAddDayDate] = useState(todayISO());
  const [addDayName, setAddDayName] = useState("");

  const [exercisePickerDayId, setExercisePickerDayId] = useState(null);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [variantDrafts, setVariantDrafts] = useState({});
  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
  const [customExerciseForm, setCustomExerciseForm] = useState({ name: "", muscleGroup: "" });

  const [setDrafts, setSetDrafts] = useState({});

  const GOAL_OPTIONS = Object.entries(GOAL_META).map(([value, meta]) => ({ value, label: meta.label, sub: meta.sub, color: meta.color }));

  const latestWeightKg = useMemo(() => {
    if (weightLogs.length === 0) return null;
    const latest = [...weightLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
    return latest.unit === "lb" ? latest.weight * 0.453592 : latest.weight;
  }, [weightLogs]);
  const effectiveWeight = latestWeightKg ?? profile.weight;

  const bmr = useMemo(() => calcBMR({ ...profile, weight: effectiveWeight }), [profile, effectiveWeight]);
  const tef = bmr * 0.1;
  const stepsCal = useMemo(() => calcStepsCalories(effectiveWeight, steps), [effectiveWeight, steps]);
  const trainingCal = useMemo(() => calcTrainingCalories(effectiveWeight, gymDays), [effectiveWeight, gymDays]);
  const tdee = bmr + tef + stepsCal + trainingCal;
  const targetCalories = calcTargetCalories(tdee, goal, deficitAmount, surplusAmount);
  const targetProtein = effectiveWeight * proteinPerKg;
  const targetFat = (targetCalories * (fatPercent / 100)) / 9;
  const targetCarbs = Math.max(0, (targetCalories - targetProtein * 4 - targetFat * 9) / 4);

  const totals = useMemo(() => {
    let kcal = 0, p = 0, c = 0, f = 0;
    meals.forEach((meal) => meal.items.forEach((it) => { kcal += it.kcal; p += it.p; c += it.c; f += it.f; }));
    return { kcal, p, c, f };
  }, [meals]);

  function removeFromMeal(mealId, itemId) {
    setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m)));
  }
  function renameMeal(mealId, name) {
    setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, name } : m)));
  }

  /** Guarda los ingredientes actuales de una comida como plantilla reutilizable. */
  function confirmSaveTemplate() {
    const meal = meals.find((m) => m.id === saveTemplateMealId);
    if (!meal || meal.items.length === 0 || !templateNameDraft.trim()) return;
    const template = { id: uid(), name: templateNameDraft.trim(), items: meal.items.map((i) => ({ ...i, id: uid() })) };
    setMealTemplates((prev) => [template, ...prev]);
    setSaveTemplateMealId(null);
    setTemplateNameDraft("");
  }

  /** Aplica una plantilla guardada a una comida: agrega sus ingredientes con ids nuevos. */
  function applyTemplate(mealId, template) {
    const items = template.items.map((i) => ({ ...i, id: uid() }));
    setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, items: [...m.items, ...items] } : m)));
  }

  function deleteTemplate(templateId) {
    setMealTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }
  function openPicker(mealId) {
    setPickerMeal(mealId);
    setPickerSearch("");
    setShowCustomForm(false);
    setCustomError("");
  }
  function addFoodFromPicker(food) {
    const grams = pickerGrams[food.id] ?? 100;
    if (!grams || grams <= 0) return;
    const factor = grams / 100;
    const item = { id: uid(), name: food.name, grams, kcal: food.kcal * factor, p: food.p * factor, c: food.c * factor, f: food.f * factor, icon: food.icon, image: food.image };
    setMeals((prev) => prev.map((m) => (m.id === pickerMeal ? { ...m, items: [...m.items, item] } : m)));
  }
  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCustomForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  }
  function addCustomFood() {
    const { name, portion, kcal, p, c, f, image } = customForm;
    if (!name.trim() || !portion || Number(portion) <= 0) { setCustomError("Ponle nombre y un tamaño de porción válido."); return; }
    if ([kcal, p, c, f].some((v) => v === "" || isNaN(Number(v)) || Number(v) < 0)) { setCustomError("Revisa que calorías, proteína, carbos y grasas sean números válidos."); return; }
    const factor = 100 / Number(portion);
    const newFood = { id: uid(), name: name.trim(), kcal: Number(kcal) * factor, p: Number(p) * factor, c: Number(c) * factor, f: Number(f) * factor, custom: true, image: image || null, icon: "🍽️" };
    setFoods((prev) => [newFood, ...prev]);
    setCustomForm({ name: "", portion: 100, kcal: "", p: "", c: "", f: "", image: null });
    setCustomError("");
    setShowCustomForm(false);
  }

  const filteredFoods = foods.filter((f) => f.name.toLowerCase().includes(pickerSearch.toLowerCase()));

  /* ---------------------------------------------------------
     FASE 2 — funciones de entrenamiento
  --------------------------------------------------------- */
  function logTodayWeight() {
    const w = Number(weightDraft.weight);
    if (!w || w <= 0) return;
    const date = todayISO();
    setWeightLogs((prev) => {
      const exists = prev.find((x) => x.date === date);
      if (exists) return prev.map((x) => (x.date === date ? { ...x, weight: w, unit: weightDraft.unit } : x));
      return [...prev, { id: uid(), date, weight: w, unit: weightDraft.unit }];
    });
    setWeightDraft((d) => ({ ...d, weight: "" }));
  }

  function createBlock() {
    const { name, startDate, endDate, goal } = newBlockForm;
    if (!name.trim() || !startDate || !endDate) return;
    const block = { id: uid(), name: name.trim(), startDate, endDate, goal };
    setBlocks((prev) => [...prev, block]);
    setActiveBlockId(block.id);
    setShowNewBlockModal(false);
    setNewBlockForm({ name: "", startDate: todayISO(), endDate: "", goal: "mantenimiento" });
  }

  function updateBlockGoal(blockId, newGoal) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, goal: newGoal } : b)));
  }

  function getWeeksForBlock(blockId) {
    return weeks.filter((w) => w.blockId === blockId).sort((a, b) => a.order - b.order);
  }
  function getDaysForWeek(weekId) {
    return days.filter((d) => d.weekId === weekId).sort((a, b) => a.order - b.order);
  }
  function getExercisesForDay(dayId) {
    return dayExercises.filter((e) => e.dayId === dayId).sort((a, b) => a.order - b.order);
  }
  function getSetsForExercise(dayExerciseId) {
    return sets.filter((s) => s.dayExerciseId === dayExerciseId).sort((a, b) => a.order - b.order);
  }
  function getLastWeekRecord(dayExerciseId) {
    const ex = dayExercises.find((e) => e.id === dayExerciseId);
    if (!ex || !ex.sourceDayExerciseId) return null;
    const recSets = getSetsForExercise(ex.sourceDayExerciseId);
    return recSets.length ? recSets : null;
  }

  function addWeek(blockId) {
    const order = getWeeksForBlock(blockId).length;
    const week = { id: uid(), blockId, order, label: `Semana ${order + 1}`, clonedFromWeekId: null };
    setWeeks((prev) => [...prev, week]);
    setExpandedWeekId(week.id);
  }

  /**
   * Duplicar semana con historial: crea una semana nueva con los mismos
   * días/ejercicios pero sin series (vacíos). Cada ejercicio nuevo guarda
   * `sourceDayExerciseId` apuntando al ejercicio original, para poder
   * mostrar el "récord de la semana pasada" sin importar cómo se
   * reordene o edite después.
   */
  function duplicateWeek(weekId) {
    const sourceWeek = weeks.find((w) => w.id === weekId);
    if (!sourceWeek) return;
    const sourceDays = getDaysForWeek(weekId);
    const newOrder = getWeeksForBlock(sourceWeek.blockId).length;
    const newWeek = { id: uid(), blockId: sourceWeek.blockId, order: newOrder, label: `Semana ${newOrder + 1}`, clonedFromWeekId: sourceWeek.id };

    const newDays = [];
    const newDayExercises = [];

    sourceDays.forEach((sourceDay) => {
      const newDay = { id: uid(), weekId: newWeek.id, date: addDaysToDate(sourceDay.date, 7), order: sourceDay.order };
      newDays.push(newDay);
      getExercisesForDay(sourceDay.id).forEach((sourceEx) => {
        newDayExercises.push({
          id: uid(),
          dayId: newDay.id,
          catalogExerciseId: sourceEx.catalogExerciseId,
          variantName: sourceEx.variantName,
          order: sourceEx.order,
          sourceDayExerciseId: sourceEx.id,
        });
      });
    });

    setWeeks((prev) => [...prev, newWeek]);
    setDays((prev) => [...prev, ...newDays]);
    setDayExercises((prev) => [...prev, ...newDayExercises]);
    setExpandedWeekId(newWeek.id);
  }

  function confirmAddDay() {
    if (!addDayWeekId || !addDayDate) return;
    const order = getDaysForWeek(addDayWeekId).length;
    const day = { id: uid(), weekId: addDayWeekId, date: addDayDate, order };
    setDays((prev) => [...prev, day]);
    setAddDayWeekId(null);
  }

  function confirmAddDay() {
    if (!addDayWeekId || !addDayDate) return;
    const order = getDaysForWeek(addDayWeekId).length;
    const day = { id: uid(), weekId: addDayWeekId, date: addDayDate, order, name: addDayName.trim() || `Día ${order + 1}` };
    setDays((prev) => [...prev, day]);
    setAddDayWeekId(null);
    setAddDayName("");
  }

  function renameDay(dayId, name) {
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, name } : d)));
  }

  /** Elimina un día completo junto con sus ejercicios y series. */
  function removeDay(dayId) {
    const exIds = getExercisesForDay(dayId).map((e) => e.id);
    setDays((prev) => prev.filter((d) => d.id !== dayId));
    setDayExercises((prev) => prev.filter((e) => e.dayId !== dayId));
    setSets((prev) => prev.filter((s) => !exIds.includes(s.dayExerciseId)));
    if (selectedDayId === dayId) setSelectedDayId(null);
  }

  function updateExerciseVariant(dayExerciseId, variantName) {
    setDayExercises((prev) => prev.map((e) => (e.id === dayExerciseId ? { ...e, variantName } : e)));
  }

  /** Edición completa de una serie ya guardada: peso, unidad, reps o RIR. */
  function updateSet(setId, field, value) {
    setSets((prev) => prev.map((s) => (s.id === setId ? { ...s, [field]: field === "unit" ? value : Number(value) } : s)));
  }

  function addExerciseFromPicker(catalogEx) {
    const variantName = (variantDrafts[catalogEx.id] ?? catalogEx.name).trim() || catalogEx.name;
    const order = getExercisesForDay(exercisePickerDayId).length;
    const newEx = { id: uid(), dayId: exercisePickerDayId, catalogExerciseId: catalogEx.id, variantName, order, sourceDayExerciseId: null };
    setDayExercises((prev) => [...prev, newEx]);
  }

  function addCustomCatalogExercise() {
    const { name, muscleGroup } = customExerciseForm;
    if (!name.trim()) return;
    const entry = { id: uid(), name: name.trim(), muscleGroup: muscleGroup.trim(), isCustom: true };
    setCatalog((prev) => [entry, ...prev]);
    setCustomExerciseForm({ name: "", muscleGroup: "" });
    setShowCustomExerciseForm(false);
  }

  function removeExercise(dayExerciseId) {
    setDayExercises((prev) => prev.filter((e) => e.id !== dayExerciseId));
    setSets((prev) => prev.filter((s) => s.dayExerciseId !== dayExerciseId));
  }

  /** Reordenamiento: mueve un ejercicio una posición arriba/abajo dentro de su día. */
  function moveExercise(dayId, exerciseId, direction) {
    const list = getExercisesForDay(dayId);
    const idx = list.findIndex((e) => e.id === exerciseId);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx], b = list[swapIdx];
    setDayExercises((prev) => prev.map((e) => {
      if (e.id === a.id) return { ...e, order: b.order };
      if (e.id === b.id) return { ...e, order: a.order };
      return e;
    }));
  }

  function updateSetDraft(dayExerciseId, field, value) {
    setSetDrafts((prev) => ({ ...prev, [dayExerciseId]: { weight: "", unit: "kg", reps: "", rir: "", ...prev[dayExerciseId], [field]: value } }));
  }

  function confirmAddSet(dayExerciseId) {
    const draft = setDrafts[dayExerciseId] || { weight: "", unit: "kg", reps: "", rir: "" };
    const weight = Number(draft.weight), reps = Number(draft.reps), rir = draft.rir === "" ? 0 : Number(draft.rir);
    if (!weight || weight <= 0 || !reps || reps <= 0) return;
    const order = getSetsForExercise(dayExerciseId).length;
    const set = { id: uid(), dayExerciseId, order, weight, unit: draft.unit || "kg", reps, rir };
    setSets((prev) => [...prev, set]);
    setSetDrafts((prev) => ({ ...prev, [dayExerciseId]: { weight: draft.weight, unit: draft.unit, reps: "", rir: "" } }));
  }

  function removeSet(setId) {
    setSets((prev) => prev.filter((s) => s.id !== setId));
  }

  const filteredCatalog = catalog.filter((e) => e.name.toLowerCase().includes(exerciseSearch.toLowerCase()));

  useEffect(() => {
    const data = {
      profile, steps, gymDays, goal, deficitAmount, surplusAmount, proteinPerKg, fatPercent,
      foods, mealTemplates, mealCount, meals, account, weightLogs,
      catalog, blocks, weeks, days, dayExercises, sets,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [profile, steps, gymDays, goal, deficitAmount, surplusAmount, proteinPerKg, fatPercent,
      foods, mealTemplates, mealCount, meals, account, weightLogs,
      catalog, blocks, weeks, days, dayExercises, sets]);

  return (
    <div style={{
      "--bg": "#07060B", "--panel": "#120F1B", "--panel2": "#1A1524", "--border": "#2B2438",
      "--accent": "#8B5CF6", "--accent2": "#C084FC", "--protein": "#E85D75", "--carbs": "#5CACFF",
      "--fat": "#FFC857", "--text": "#F3F1EA", "--text-dim": "#8A93A6", "--danger": "#FF5C5C",
      background: "var(--bg)", minHeight: "100vh", fontFamily: "'Inter', sans-serif",
      color: "var(--text)", padding: "18px 14px 40px", boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: var(--accent) !important; }
        ::selection { background: var(--accent); color: #07060B; }
      `}</style>

      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {appView !== "inicio" && (
              <button onClick={() => setAppView("inicio")} style={backBtnStyle}><ArrowLeft size={16} color="var(--text-dim)" /></button>
            )}
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), #5B21B6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(139,92,246,0.4)", flexShrink: 0 }}>
              <GaugeIcon size={20} color="#07060B" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: 0.5, lineHeight: 1 }}>
                NUTRI<span style={{ color: "var(--accent)" }}>DASH</span>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-dim)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                {appView === "inicio" && "Menú principal"}
                {appView === "perfil" && "Tu perfil"}
                {appView === "nutricion" && "Tablero de nutrición"}
                {appView === "entrenamiento" && "Tablero de entrenamiento"}
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- PANTALLA: INICIO -------------------- */}
        {appView === "inicio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "perfil", title: "Perfil", sub: "Tus datos y seguimiento de peso", icon: User },
            { key: "nutricion", title: "Nutrición", sub: "Calorías, macros y comidas", icon: UtensilsCrossed },
            { key: "entrenamiento", title: "Entrenamiento", sub: "Bloques, semanas y ejercicios", icon: Dumbbell },
          ].map(({ key, title, sub, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setAppView(key)}
              style={{
                display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                padding: "20px 18px", borderRadius: 16, border: "1px solid var(--border)",
                background: "var(--panel)", cursor: "pointer", color: "var(--text)",
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), #5B21B6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}>
                <Icon size={24} color="#07060B" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18 }}>{title}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>
              </div>
              <ChevronRight size={20} color="var(--text-dim)" />
            </button>
          ))}
        </div>
        )}

        {appView === "nutricion" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel style={{ paddingTop: 22 }}>
            <CalorieGauge consumed={totals.kcal} target={targetCalories} />
            <div style={{ marginTop: 18 }}>
              <MacroBar icon={Beef} label="Proteína" consumed={totals.p} target={targetProtein} color="var(--protein)" />
              <MacroBar icon={Wheat} label="Carbohidratos" consumed={totals.c} target={targetCarbs} color="var(--carbs)" />
              <MacroBar icon={Droplet} label="Grasas" consumed={totals.f} target={targetFat} color="var(--fat)" />
            </div>
          </Panel>

          {meals.map((meal) => {
            const mealTotal = meal.items.reduce((s, i) => s + i.kcal, 0);
            const mealMacros = meal.items.reduce((a, i) => ({ p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { p: 0, c: 0, f: 0 });
            return (
              <Panel key={meal.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <input
                    value={meal.name}
                    onChange={(e) => renameMeal(meal.id, e.target.value)}
                    style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, padding: 0, minWidth: 0, flex: 1 }}
                  />
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-dim)", flexShrink: 0 }}>{round(mealTotal)} kcal</div>
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
                  <span style={{ color: "var(--protein)" }}>P {round(mealMacros.p)}g</span>
                  <span style={{ color: "var(--carbs)" }}>C {round(mealMacros.c)}g</span>
                  <span style={{ color: "var(--fat)" }}>G {round(mealMacros.f)}g</span>
                </div>

                {meal.items.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {meal.items.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <FoodIcon food={item} size={32} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                              {item.grams} g · {round(item.kcal)} kcal · P {round(item.p)}g · C {round(item.c)}g · G {round(item.f)}g
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeFromMeal(meal.id, item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 6, flexShrink: 0 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => openPicker(meal.id)} style={dashedButtonStyle}>
                  <Plus size={16} /> Agregar alimento
                </button>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {mealTemplates.length > 0 && (
                    <button onClick={() => setTemplatePickerMealId(meal.id)} style={{ ...dashedButtonStyle, flex: 1, borderColor: "var(--accent2)", color: "var(--accent2)" }}>
                      <Copy size={14} /> Usar guardada
                    </button>
                  )}
                  {meal.items.length > 0 && (
                    <button onClick={() => { setSaveTemplateMealId(meal.id); setTemplateNameDraft(meal.name); }} style={{ ...dashedButtonStyle, flex: 1 }}>
                      Guardar como plantilla
                    </button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
        )}

        {appView === "entrenamiento" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* -------- Lista de bloques -------- */}
          {!activeBlockId && (
            <Panel>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 7 }}>
                <Layers size={15} color="var(--accent)" /> Tus bloques
              </div>
              {blocks.length === 0 && (
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
                  Un bloque agrupa varias semanas de entrenamiento bajo un mismo objetivo (ej. "Mesociclo fuerza — jul/ago").
                </div>
              )}
              {blocks.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {blocks.map((b) => (
                    <button key={b.id} onClick={() => setActiveBlockId(b.id)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel2)", cursor: "pointer", color: "var(--text)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</div>
                        <ChevronRight size={16} color="var(--text-dim)" />
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4 }}>
                        {formatDateEs(b.startDate)} – {formatDateEs(b.endDate)} · <span style={{ color: GOAL_META[b.goal].color }}>{GOAL_META[b.goal].label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setShowNewBlockModal(true)} style={dashedButtonStyle}><Plus size={16} /> Nuevo bloque</button>
            </Panel>
          )}

          {/* -------- Detalle de bloque: semanas y días -------- */}
          {activeBlockId && !selectedDayId && (() => {
            const block = blocks.find((b) => b.id === activeBlockId);
            if (!block) return null;
            const blockWeeks = getWeeksForBlock(block.id);
            return (
              <>
                <Panel>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <button onClick={() => { setActiveBlockId(null); setExpandedWeekId(null); }} style={backBtnStyle}><ArrowLeft size={16} color="var(--text-dim)" /></button>
                    <div>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17 }}>{block.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{formatDateEs(block.startDate)} – {formatDateEs(block.endDate)}</div>
                    </div>
                  </div>
                  <ToggleGroup options={GOAL_OPTIONS} value={block.goal} onChange={(g) => updateBlockGoal(block.id, g)} />
                </Panel>

                {blockWeeks.map((week) => {
                  const weekDays = getDaysForWeek(week.id);
                  const expanded = expandedWeekId === week.id;
                  const clonedFrom = week.clonedFromWeekId ? weeks.find((w) => w.id === week.clonedFromWeekId) : null;
                  return (
                    <Panel key={week.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpandedWeekId(expanded ? null : week.id)}>
                        <div>
                          <div style={{ fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", fontSize: 15 }}>{week.label}</div>
                          {clonedFrom && <div style={{ fontSize: 10.5, color: "var(--accent2)", marginTop: 2 }}>Clonada de {clonedFrom.label}</div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button onClick={(e) => { e.stopPropagation(); duplicateWeek(week.id); }} title="Duplicar semana" style={iconBtnStyle}><Copy size={14} /></button>
                          {expanded ? <ChevronUp size={18} color="var(--text-dim)" /> : <ChevronDown size={18} color="var(--text-dim)" />}
                        </div>
                      </div>

                      {expanded && (
                        <div style={{ marginTop: 12 }}>
                          {weekDays.map((day) => {
                            const dayExList = getExercisesForDay(day.id);
                            return (
                              <div key={day.id} onClick={() => setSelectedDayId(day.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                                <div style={{ fontSize: 13 }}>{day.name || "Día"} <span style={{ color: "var(--text-dim)" }}>· {formatDateEs(day.date)}</span></div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5, color: "var(--text-dim)" }}>
                                  {dayExList.length} ejercicio{dayExList.length !== 1 ? "s" : ""}
                                  <button onClick={(e) => { e.stopPropagation(); removeDay(day.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 2 }}><Trash2 size={14} /></button>
                                  <ChevronRight size={14} />
                                </div>
                              </div>
                            );
                          })}
                          <div style={{ marginTop: 10 }}>
                            <button onClick={() => { setAddDayWeekId(week.id); setAddDayDate(weekDays.length ? addDaysToDate(weekDays[weekDays.length - 1].date, 1) : block.startDate); setAddDayName(""); }} style={dashedButtonStyle}>
                              <Plus size={15} /> Agregar día
                            </button>
                          </div>
                        </div>
                      )}
                    </Panel>
                  );
                })}

                <button onClick={() => addWeek(block.id)} style={dashedButtonStyle}><Plus size={16} /> Agregar semana</button>
              </>
            );
          })()}

          {/* -------- Vista de un día: ejercicios y series -------- */}
          {activeBlockId && selectedDayId && (() => {
            const day = days.find((d) => d.id === selectedDayId);
            if (!day) return null;
            const dayExList = getExercisesForDay(day.id);
            return (
              <>
                <Panel>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setSelectedDayId(null)} style={backBtnStyle}><ArrowLeft size={16} color="var(--text-dim)" /></button>
                    <input
                      value={day.name || ""}
                      onChange={(e) => renameDay(day.id, e.target.value)}
                      style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17 }}
                    />
                    <input
                      type="date"
                      value={day.date}
                      onChange={(e) => setDays((prev) => prev.map((d) => (d.id === day.id ? { ...d, date: e.target.value } : d)))}
                      style={{ ...inputStyle, width: 140, flexShrink: 0, padding: "6px 8px", fontSize: 12.5 }}
                    />
                    <button onClick={() => removeDay(day.id)} style={{ ...iconBtnStyle, flexShrink: 0, color: "var(--danger)" }}><Trash2 size={14} /></button>
                  </div>
                </Panel>

                {dayExList.map((ex, i) => {
                  const catalogEx = catalog.find((c) => c.id === ex.catalogExerciseId);
                  const exSets = getSetsForExercise(ex.id);
                  const record = getLastWeekRecord(ex.id);
                  const draft = setDrafts[ex.id] || { weight: "", unit: "kg", reps: "", rir: "" };
                  return (
                    <Panel key={ex.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <input
                            value={ex.variantName}
                            onChange={(e) => updateExerciseVariant(ex.id, e.target.value)}
                            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text)", fontWeight: 700, fontSize: 14.5, padding: 0 }}
                          />
                          {catalogEx && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{catalogEx.name} · {catalogEx.muscleGroup}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => moveExercise(day.id, ex.id, -1)} disabled={i === 0} style={{ ...iconBtnStyle, opacity: i === 0 ? 0.35 : 1 }}><ArrowUp size={13} /></button>
                          <button onClick={() => moveExercise(day.id, ex.id, 1)} disabled={i === dayExList.length - 1} style={{ ...iconBtnStyle, opacity: i === dayExList.length - 1 ? 0.35 : 1 }}><ArrowDown size={13} /></button>
                          <button onClick={() => removeExercise(ex.id)} style={{ ...iconBtnStyle, color: "var(--danger)" }}><Trash2 size={13} /></button>
                        </div>
                      </div>

                      {record && (
                        <div style={{ fontSize: 11, color: "var(--text-dim)", background: "var(--panel2)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", marginBottom: 10, lineHeight: 1.6 }}>
                          <span style={{ color: "var(--accent2)", fontWeight: 600 }}>Semana pasada: </span>
                          {record.map((s) => `${s.weight}${s.unit}×${s.reps} (RIR ${s.rir})`).join(" · ")}
                        </div>
                      )}

                      {exSets.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          {exSets.map((s, si) => (
                            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                              <span style={{ fontSize: 12, color: "var(--text-dim)", flexShrink: 0 }}>Serie {si + 1}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, justifyContent: "flex-end" }}>
                                <input type="number" value={s.weight} onChange={(e) => updateSet(s.id, "weight", e.target.value)} style={{ ...inputStyle, width: 52, padding: "4px 6px", fontSize: 12 }} />
                                <button onClick={() => updateSet(s.id, "unit", s.unit === "kg" ? "lb" : "kg")} style={{ ...iconBtnStyle, width: "auto", padding: "4px 6px", fontSize: 10.5 }}>{s.unit}</button>
                                <span style={{ color: "var(--text-dim)", fontSize: 12 }}>×</span>
                                <input type="number" value={s.reps} onChange={(e) => updateSet(s.id, "reps", e.target.value)} style={{ ...inputStyle, width: 42, padding: "4px 6px", fontSize: 12 }} />
                                <span style={{ color: "var(--text-dim)", fontSize: 10.5 }}>RIR</span>
                                <input type="number" value={s.rir} onChange={(e) => updateSet(s.id, "rir", e.target.value)} style={{ ...inputStyle, width: 36, padding: "4px 6px", fontSize: 12 }} />
                              </div>
                              <button onClick={() => removeSet(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4, flexShrink: 0 }}><Trash2 size={13} /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="number" placeholder="Peso" value={draft.weight} onChange={(e) => updateSetDraft(ex.id, "weight", e.target.value)} style={{ ...inputStyle, flex: 1, padding: "7px 8px", fontSize: 12.5 }} />
                        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden", flexShrink: 0 }}>
                          {["kg", "lb"].map((u) => (
                            <button key={u} onClick={() => updateSetDraft(ex.id, "unit", u)} style={{ padding: "7px 8px", fontSize: 11, border: "none", cursor: "pointer", background: draft.unit === u ? "var(--accent)" : "var(--panel2)", color: draft.unit === u ? "#07060B" : "var(--text-dim)" }}>{u}</button>
                          ))}
                        </div>
                        <input type="number" placeholder="Reps" value={draft.reps} onChange={(e) => updateSetDraft(ex.id, "reps", e.target.value)} style={{ ...inputStyle, width: 56, padding: "7px 8px", fontSize: 12.5, flexShrink: 0 }} />
                        <input type="number" placeholder="RIR" value={draft.rir} onChange={(e) => updateSetDraft(ex.id, "rir", e.target.value)} style={{ ...inputStyle, width: 52, padding: "7px 8px", fontSize: 12.5, flexShrink: 0 }} />
                        <button onClick={() => confirmAddSet(ex.id)} style={{ background: "var(--accent)", border: "none", borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <Plus size={16} color="#07060B" />
                        </button>
                      </div>
                    </Panel>
                  );
                })}

                <button onClick={() => { setExercisePickerDayId(day.id); setExerciseSearch(""); setShowCustomExerciseForm(false); }} style={dashedButtonStyle}>
                  <Plus size={16} /> Agregar ejercicio
                </button>
              </>
            );
          })()}
        </div>
        )}

        {/* -------------------- PANTALLA: PERFIL -------------------- */}
        {appView === "perfil" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Cuenta</div>
            <Field label="Nombre">
              <input style={selectStyle} value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} placeholder="Tu nombre" />
            </Field>
            <Field label="Correo">
              <input type="email" style={selectStyle} value={account.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} placeholder="tucorreo@ejemplo.com" />
            </Field>
            <Field label="Contraseña">
              <input type="password" style={selectStyle} value={account.password} onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))} placeholder="••••••••" />
            </Field>
          </Panel>

          <Panel>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Datos personales</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Sexo">
                <ToggleGroup options={[{ value: "M", label: "Hombre" }, { value: "F", label: "Mujer" }]} value={profile.sex} onChange={(v) => setProfile((p) => ({ ...p, sex: v }))} />
              </Field>
              <Field label="Edad (años)"><input type="number" style={inputStyle} value={profile.age} onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) }))} /></Field>
              <Field label="Estatura (cm)"><input type="number" style={inputStyle} value={profile.height} onChange={(e) => setProfile((p) => ({ ...p, height: Number(e.target.value) }))} /></Field>
              <Field label="Comidas al día">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setMealCount((c) => Math.max(1, c - 1))} style={iconBtnStyle}><Minus size={13} /></button>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{mealCount}</div>
                  <button onClick={() => setMealCount((c) => Math.min(8, c + 1))} style={iconBtnStyle}><Plus size={13} /></button>
                </div>
              </Field>
            </div>
          </Panel>

          <Panel>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 7 }}>
              <Scale size={15} color="var(--accent)" /> Seguimiento de peso corporal
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
              {latestWeightKg
                ? <>Tu peso actual (<span style={{ color: "var(--accent2)" }}>{round(latestWeightKg, 1)}kg</span>) alimenta tus cálculos de calorías en Nutrición.</>
                : "Registra tu peso para que tus cálculos de calorías en Nutrición sean precisos."}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
              <input type="number" placeholder="Ej. 78.4" value={weightDraft.weight} onChange={(e) => setWeightDraft((d) => ({ ...d, weight: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
              <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden", flexShrink: 0 }}>
                {["kg", "lb"].map((u) => (
                  <button key={u} onClick={() => setWeightDraft((d) => ({ ...d, unit: u }))} style={{ padding: "9px 10px", fontSize: 12, border: "none", cursor: "pointer", background: weightDraft.unit === u ? "var(--accent)" : "var(--panel2)", color: weightDraft.unit === u ? "#07060B" : "var(--text-dim)" }}>{u}</button>
                ))}
              </div>
              <button onClick={logTodayWeight} style={{ background: "var(--accent)", border: "none", borderRadius: 8, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Plus size={18} color="#07060B" />
              </button>
            </div>

            <WeightChart logs={weightLogs} />

            {weightLogs.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {[...weightLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((w) => (
                  <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 12.5 }}>
                    <span style={{ color: "var(--text-dim)" }}>{formatDateEs(w.date)}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text)" }}>{w.weight} {w.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Movimiento diario real</div>
            <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>Cada fuente de gasto se suma por separado para que veas de dónde sale cada caloría.</div>

            <Field label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><Footprints size={13} /> Pasos promedio al día — {steps.toLocaleString("es-MX")}</span>}>
              <input type="range" min="1000" max="20000" step="500" value={steps} onChange={(e) => setSteps(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
              <div style={{ fontSize: 11, color: "var(--accent2)", marginTop: 4 }}>≈ {round(stepsCal)} kcal/día caminando</div>
            </Field>
            <Field label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><Dumbbell size={13} /> Días de entrenamiento / semana — {gymDays}</span>}>
              <input type="range" min="0" max="7" step="1" value={gymDays} onChange={(e) => setGymDays(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
              <div style={{ fontSize: 11, color: "var(--accent2)", marginTop: 4 }}>≈ {round(trainingCal)} kcal/día promedio por entrenar</div>
            </Field>

            <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: "var(--text-dim)" }}><span>Metabolismo basal (BMR)</span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text)" }}>{round(bmr)} kcal</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: "var(--text-dim)" }}><span>+ Digestión de alimentos (TEF)</span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text)" }}>{round(tef)} kcal</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: "var(--text-dim)" }}><span>+ Pasos diarios</span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text)" }}>{round(stepsCal)} kcal</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: "var(--text-dim)" }}><span>+ Entrenamiento</span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text)" }}>{round(trainingCal)} kcal</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0 0", marginTop: 4, borderTop: "1px solid var(--border)", fontWeight: 700 }}><span>= Gasto total (TDEE)</span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}>{round(tdee)} kcal</span></div>
            </div>
          </Panel>

          <Panel>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Objetivo</div>
            <ToggleGroup
              options={GOAL_OPTIONS.map((o) => (o.value === "deficit" ? { ...o, sub: `-${deficitAmount} kcal` } : o.value === "volumen" ? { ...o, sub: `+${surplusAmount} kcal` } : o))}
              value={goal}
              onChange={setGoal}
            />

            {goal === "deficit" && (
              <Field label="Intensidad del déficit">
                <ToggleGroup options={DEFICIT_OPTIONS} value={deficitAmount} onChange={setDeficitAmount} />
                <TipBox>{DEFICIT_OPTIONS.find((o) => o.value === deficitAmount).advice}</TipBox>
              </Field>
            )}
            {goal === "volumen" && (
              <Field label="Intensidad del superávit">
                <ToggleGroup options={SURPLUS_OPTIONS} value={surplusAmount} onChange={setSurplusAmount} />
                <TipBox>{SURPLUS_OPTIONS.find((o) => o.value === surplusAmount).advice}</TipBox>
              </Field>
            )}

            <div style={{ marginTop: 16 }}>
              <Field label={`Proteína — ${proteinPerKg} g/kg de peso`}>
                <input type="range" min="1.2" max="3" step="0.1" value={proteinPerKg} onChange={(e) => setProteinPerKg(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--protein)" }} />
                <TipBox>{proteinGuidance(goal, gymDays)}</TipBox>
              </Field>
              <Field label={`Grasas — ${fatPercent}% de las calorías`}>
                <input type="range" min="15" max="40" step="1" value={fatPercent} onChange={(e) => setFatPercent(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--fat)" }} />
                <TipBox>{fatGuidance(goal)}</TipBox>
              </Field>
            </div>

            <div style={{ marginTop: 6, padding: 14, borderRadius: 10, background: "var(--panel2)", border: `1px solid ${GOAL_META[goal].color}44` }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Meta calórica diaria</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: GOAL_META[goal].color }}>{round(targetCalories)} kcal</div>
              <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12.5 }}>
                <span style={{ color: "var(--protein)" }}>P {round(targetProtein)}g</span>
                <span style={{ color: "var(--carbs)" }}>C {round(targetCarbs)}g</span>
                <span style={{ color: "var(--fat)" }}>G {round(targetFat)}g</span>
              </div>
            </div>
          </Panel>
        </div>
        )}
      </div>

      {/* -------------------- MODAL: AGREGAR ALIMENTO -------------------- */}
      {pickerMeal && (
        <ModalShell title={`Agregar a ${meals.find((m) => m.id === pickerMeal)?.name ?? ""}`} onClose={() => setPickerMeal(null)} wide>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0D0B14", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 12px", marginBottom: 12 }}>
            <Search size={15} color="var(--text-dim)" />
            <input value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} placeholder="Buscar alimento..." style={{ border: "none", background: "transparent", outline: "none", color: "var(--text)", fontSize: 13.5, width: "100%" }} autoFocus />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "40vh", overflowY: "auto", marginBottom: 14 }}>
            {filteredFoods.map((f) => {
              const grams = pickerGrams[f.id] ?? 100;
              const factor = grams / 100;
              return (
                <div key={f.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", background: "var(--panel2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <FoodIcon food={f} size={30} />
                      <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {f.name} {f.custom && <span style={{ fontSize: 9.5, color: "var(--accent2)", border: "1px solid var(--accent2)", borderRadius: 5, padding: "1px 5px", marginLeft: 6 }}>PROPIO</span>}
                      </div>
                    </div>
                    <input type="number" value={grams} onChange={(e) => setPickerGrams((prev) => ({ ...prev, [f.id]: Number(e.target.value) }))} style={{ ...inputStyle, width: 60, padding: "5px 8px", fontSize: 12.5, flexShrink: 0 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "var(--text-dim)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ color: "var(--text)" }}>{round(f.kcal * factor)} kcal</span>
                      <span style={{ color: "var(--protein)" }}>P {round(f.p * factor)}g</span>
                      <span style={{ color: "var(--carbs)" }}>C {round(f.c * factor)}g</span>
                      <span style={{ color: "var(--fat)" }}>G {round(f.f * factor)}g</span>
                    </div>
                    <button onClick={() => addFoodFromPicker(f)} style={{ background: "var(--accent)", border: "none", borderRadius: 7, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#07060B", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      <Plus size={13} /> Agregar
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredFoods.length === 0 && <div style={{ fontSize: 12.5, color: "var(--text-dim)", textAlign: "center", padding: "12px 0" }}>Sin resultados.</div>}
          </div>

          <button onClick={() => setShowCustomForm((s) => !s)} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "1px dashed var(--border)", background: "transparent", color: "var(--accent2)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {showCustomForm ? <ChevronUp size={15} /> : <ChevronDown size={15} />} Crear alimento personalizado
          </button>

          {showCustomForm && (
            <div style={{ marginTop: 12, padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "var(--panel2)" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: 68, height: 68, borderRadius: 12, border: "1px dashed var(--border)", background: "#0D0B14", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, overflow: "hidden", padding: 0 }}
                >
                  {customForm.image ? (
                    <img src={customForm.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Camera size={20} color="var(--text-dim)" />
                  )}
                </button>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", lineHeight: 1.5, alignSelf: "center" }}>
                  Toca para subir una foto del alimento (opcional). Ej. el bote de claras, la etiqueta del producto, etc.
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
              </div>

              <Field label="Nombre">
                <input style={selectStyle} value={customForm.name} onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Barrita de proteína marca X" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Tamaño de porción (g)"><input type="number" style={inputStyle} value={customForm.portion} onChange={(e) => setCustomForm((f) => ({ ...f, portion: e.target.value }))} /></Field>
                <Field label="Calorías (por porción)"><input type="number" style={inputStyle} value={customForm.kcal} onChange={(e) => setCustomForm((f) => ({ ...f, kcal: e.target.value }))} /></Field>
                <Field label="Proteína (g)"><input type="number" style={inputStyle} value={customForm.p} onChange={(e) => setCustomForm((f) => ({ ...f, p: e.target.value }))} /></Field>
                <Field label="Carbohidratos (g)"><input type="number" style={inputStyle} value={customForm.c} onChange={(e) => setCustomForm((f) => ({ ...f, c: e.target.value }))} /></Field>
                <Field label="Grasas (g)"><input type="number" style={inputStyle} value={customForm.f} onChange={(e) => setCustomForm((f) => ({ ...f, f: e.target.value }))} /></Field>
              </div>
              {customError && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{customError}</div>}
              <button onClick={addCustomFood} style={{ width: "100%", padding: "11px", borderRadius: 9, border: "none", background: "var(--accent2)", color: "#07060B", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={16} /> Guardar y mostrar en la lista
              </button>
            </div>
          )}
        </ModalShell>
      )}

      {/* -------------------- MODAL: GUARDAR PLANTILLA -------------------- */}
      {saveTemplateMealId && (
        <ModalShell title="Guardar como plantilla" onClose={() => setSaveTemplateMealId(null)}>
          <Field label="Nombre de la plantilla">
            <input style={selectStyle} value={templateNameDraft} onChange={(e) => setTemplateNameDraft(e.target.value)} placeholder='Ej. "Mi desayuno de siempre"' autoFocus />
          </Field>
          <button onClick={confirmSaveTemplate} style={primaryButtonStyle}><Plus size={16} /> Guardar plantilla</button>
        </ModalShell>
      )}

      {/* -------------------- MODAL: USAR PLANTILLA GUARDADA -------------------- */}
      {templatePickerMealId && (
        <ModalShell title="Comidas guardadas" onClose={() => setTemplatePickerMealId(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mealTemplates.map((t) => {
              const kcal = t.items.reduce((s, i) => s + i.kcal, 0);
              return (
                <div key={t.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", background: "var(--panel2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div>
                    <button onClick={() => deleteTemplate(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>{t.items.length} ingrediente{t.items.length !== 1 ? "s" : ""} · {round(kcal)} kcal</div>
                  <button
                    onClick={() => { applyTemplate(templatePickerMealId, t); setTemplatePickerMealId(null); }}
                    style={{ width: "100%", padding: "8px", borderRadius: 7, border: "none", background: "var(--accent2)", color: "#07060B", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
                  >
                    Usar esta comida
                  </button>
                </div>
              );
            })}
          </div>
        </ModalShell>
      )}

      {/* -------------------- MODAL: NUEVO BLOQUE -------------------- */}
      {showNewBlockModal && (
        <ModalShell title="Nuevo bloque" onClose={() => setShowNewBlockModal(false)}>
          <Field label="Nombre">
            <input style={selectStyle} value={newBlockForm.name} onChange={(e) => setNewBlockForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Mesociclo fuerza — jul/ago" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Inicio"><input type="date" style={inputStyle} value={newBlockForm.startDate} onChange={(e) => setNewBlockForm((f) => ({ ...f, startDate: e.target.value }))} /></Field>
            <Field label="Fin"><input type="date" style={inputStyle} value={newBlockForm.endDate} onChange={(e) => setNewBlockForm((f) => ({ ...f, endDate: e.target.value }))} /></Field>
          </div>
          <Field label="Objetivo actual">
            <ToggleGroup options={GOAL_OPTIONS} value={newBlockForm.goal} onChange={(g) => setNewBlockForm((f) => ({ ...f, goal: g }))} />
          </Field>
          <button onClick={createBlock} style={primaryButtonStyle}><Plus size={16} /> Crear bloque</button>
        </ModalShell>
      )}

      {/* -------------------- MODAL: AGREGAR DÍA -------------------- */}
      {addDayWeekId && (
        <ModalShell title="Agregar día" onClose={() => setAddDayWeekId(null)}>
          <Field label="Nombre">
            <input style={selectStyle} value={addDayName} onChange={(e) => setAddDayName(e.target.value)} placeholder='Ej. "Empuje", "Pierna"' />
          </Field>
          <Field label="Fecha">
            <input type="date" style={inputStyle} value={addDayDate} onChange={(e) => setAddDayDate(e.target.value)} />
          </Field>
          <button onClick={confirmAddDay} style={primaryButtonStyle}><Plus size={16} /> Agregar día</button>
        </ModalShell>
      )}

      {/* -------------------- MODAL: AGREGAR EJERCICIO -------------------- */}
      {exercisePickerDayId && (
        <ModalShell title="Agregar ejercicio" onClose={() => setExercisePickerDayId(null)} wide>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0D0B14", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 12px", marginBottom: 12 }}>
            <Search size={15} color="var(--text-dim)" />
            <input value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} placeholder="Buscar ejercicio..." style={{ border: "none", background: "transparent", outline: "none", color: "var(--text)", fontSize: 13.5, width: "100%" }} autoFocus />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "40vh", overflowY: "auto", marginBottom: 14 }}>
            {filteredCatalog.map((c) => (
              <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", background: "var(--panel2)" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>
                  {c.name} {c.isCustom && <span style={{ fontSize: 9.5, color: "var(--accent2)", border: "1px solid var(--accent2)", borderRadius: 5, padding: "1px 5px", marginLeft: 6 }}>PROPIO</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>{c.muscleGroup}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    value={variantDrafts[c.id] ?? c.name}
                    onChange={(e) => setVariantDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Nombre de la variante"
                    style={{ ...selectStyle, flex: 1, padding: "7px 9px", fontSize: 12.5 }}
                  />
                  <button onClick={() => addExerciseFromPicker(c)} style={{ background: "var(--accent)", border: "none", borderRadius: 7, padding: "0 12px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#07060B", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    <Plus size={13} /> Agregar
                  </button>
                </div>
              </div>
            ))}
            {filteredCatalog.length === 0 && <div style={{ fontSize: 12.5, color: "var(--text-dim)", textAlign: "center", padding: "12px 0" }}>Sin resultados.</div>}
          </div>

          <button onClick={() => setShowCustomExerciseForm((s) => !s)} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "1px dashed var(--border)", background: "transparent", color: "var(--accent2)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {showCustomExerciseForm ? <ChevronUp size={15} /> : <ChevronDown size={15} />} Crear ejercicio nuevo en el catálogo
          </button>

          {showCustomExerciseForm && (
            <div style={{ marginTop: 12, padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "var(--panel2)" }}>
              <Field label="Nombre general">
                <input style={selectStyle} value={customExerciseForm.name} onChange={(e) => setCustomExerciseForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Hack squat" />
              </Field>
              <Field label="Grupo muscular (opcional)">
                <input style={selectStyle} value={customExerciseForm.muscleGroup} onChange={(e) => setCustomExerciseForm((f) => ({ ...f, muscleGroup: e.target.value }))} placeholder="Ej. Pierna" />
              </Field>
              <button onClick={addCustomCatalogExercise} style={{ ...primaryButtonStyle, background: "var(--accent2)" }}>
                <Plus size={16} /> Guardar en el catálogo
              </button>
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}
