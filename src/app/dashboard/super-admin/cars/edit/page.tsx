"use client";
// src/app/dashboard/super-admin/cars/edit/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import { Ic } from "@/src/components/ui/Icons";
import { CARS } from "@/src/lib/data/cars";

// ─── Fleet data (mirrors fleet page) ─────────────────────────────────────────
const FLEET_EXTRA: Record<number, {
  plate: string; year: number; mileage: number;
  status: string; rentalRate: number; salePrice: number; location: string;
}> = {
  1:  { plate:"GR-4421-22", year:2022, mileage:34200, status:"Available",  rentalRate:85,  salePrice:24900, location:"Liberation Rd, Accra"        },
  2:  { plate:"GT-2819-23", year:2023, mileage:51800, status:"Rented",     rentalRate:65,  salePrice:18500, location:"East Legon"                   },
  3:  { plate:"GN-0032-23", year:2023, mileage:29400, status:"Rented",     rentalRate:95,  salePrice:27000, location:"Spintex Road"                 },
  4:  { plate:"GS-7731-24", year:2024, mileage:11300, status:"Available",  rentalRate:72,  salePrice:21500, location:"Oxford Street, Osu"           },
  5:  { plate:"GE-9912-23", year:2023, mileage:42600, status:"Rented",     rentalRate:145, salePrice:52000, location:"Airport Bypass"               },
  6:  { plate:"GR-2341-22", year:2022, mileage:67900, status:"In Service", rentalRate:75,  salePrice:22800, location:"Community 11 Workshop, Tema"  },
  7:  { plate:"GW-1122-24", year:2024, mileage:8900,  status:"Available",  rentalRate:195, salePrice:68000, location:"Cantonments Rd"               },
  8:  { plate:"GT-5512-23", year:2023, mileage:23100, status:"Available",  rentalRate:62,  salePrice:19900, location:"Achimota"                     },
  9:  { plate:"GW-9908-22", year:2022, mileage:55700, status:"Rented",     rentalRate:98,  salePrice:29500, location:"Adjiringanor Rd, East Legon"  },
  10: { plate:"GR-5521-22", year:2022, mileage:38400, status:"Rented",     rentalRate:125, salePrice:38000, location:"Ring Rd Central"              },
  11: { plate:"GN-8821-22", year:2022, mileage:72100, status:"In Service", rentalRate:148, salePrice:44000, location:"East Legon Workshop"          },
  12: { plate:"GE-4490-23", year:2023, mileage:15600, status:"Available",  rentalRate:235, salePrice:72000, location:"High Street, Accra"           },
};

const FUEL_OPT   = ["Petrol","Diesel","Hybrid","Electric"];
const TRANS_OPT  = ["Automatic","Manual"];
const STATUS_OPT = ["Available","Rented","In Service","Retired"];
const CAT_OPT    = ["Sedan","SUV","Hatchback","Crossover","Pickup","Van","Luxury"];
const ALL_FEAT   = ["Apple CarPlay","Android Auto","LED Headlights","Dual-Zone Climate","Parking Sensors","Reverse Camera","Cruise Control","Keyless Entry","Sunroof","Heated Seats","Leather Interior","Blind Spot Monitor","Lane Assist","360° Camera"];

// ─── Build form initial values from CARS + FLEET_EXTRA ────────────────────────
function buildInitial(id: number) {
  const car   = CARS.find(c => c.id === id);
  const fleet = id ? FLEET_EXTRA[id] : undefined;

  if (!car) {
    return {
      make:"", model:"", year:"", plate:"", color:"",
      fuel:"Petrol", transmission:"Automatic", seats:"5",
      engine:"", power:"", mileage:"0",
      status:"Available", category:"Sedan",
      dailyRate:"", salePrice:"",
      location:"", image:"", description:"",
    };
  }

  const nameParts  = car.name.split(" ");
  const make       = nameParts[0];
  const model      = nameParts.slice(1).join(" ");
  const powerMatch = car.spec.match(/(\d+)\s*hp/i);
  const engine     = car.spec.split("(")[0].trim();
  const power      = powerMatch ? `${powerMatch[1]} hp` : "";

  return {
    make,
    model,
    year:         String(fleet?.year ?? new Date().getFullYear()),
    plate:        fleet?.plate ?? "",
    color:        "",
    fuel:         car.fuel,
    transmission: car.transmission,
    seats:        String(car.seats),
    engine,
    power,
    mileage:      String(fleet?.mileage ?? 0),
    status:       fleet?.status ?? "Available",
    category:     car.type,
    dailyRate:    String(fleet?.rentalRate ?? ""),
    salePrice:    String(fleet?.salePrice ?? ""),
    location:     fleet?.location ?? "",
    image:        car.image,
    description:  `This ${fleet?.year ?? ""} ${car.name} in excellent condition. ${car.spec}.`,
  };
}

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({ label, required, t, children }: { label:string; required?:boolean; t:any; children:React.ReactNode }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>
        {label}{required && <span style={{ color:"#EF4444", marginLeft:3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function TInput({ value, onChange, placeholder, t, icon }: { value:string; onChange:(v:string)=>void; placeholder?:string; t:any; icon?:(c:string)=>React.ReactNode }) {
  return (
    <div style={{ position:"relative" }}>
      {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.4 }}>{icon(t.textMuted)}</span>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:icon?"10px 14px 10px 34px":"10px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}
        onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}
      />
    </div>
  );
}

function SInput({ value, onChange, options, t }: { value:string; onChange:(v:string)=>void; options:string[]; t:any }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", cursor:"pointer", boxSizing:"border-box", appearance:"none" }}
      onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}
    >
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  );
}

// ─── Inner page (needs useSearchParams inside Suspense) ───────────────────────
function EditCarPageContent() {
  const router              = useRouter();
  const { dark, setDark, t } = useTheme();
  const searchParams        = useSearchParams();
  const carId               = Number(searchParams.get("id") ?? 0);

  const [form, setForm]     = useState(() => buildInitial(carId));
  const [features, setFeatures] = useState<string[]>(["Apple CarPlay","Android Auto","LED Headlights","Dual-Zone Climate","Parking Sensors","Reverse Camera","Cruise Control","Keyless Entry"]);
  const [customFeatures, setCustomFeatures] = useState<{header:string;description:string}[]>([]);
  const [tab, setTab]       = useState<"details"|"pricing"|"features"|"media">("details");
  const [saved, setSaved]   = useState(false);

  const set = (k:string, v:string) => setForm(p=>({...p,[k]:v}));
  const toggleFeature = (f:string) => setFeatures(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => router.back(), 1200);
  };

  const statusColor = (s:string) =>
    s==="Available"?"#10B981": s==="Rented"?t.accent: s==="In Service"?"#F59E0B":"#EF4444";

  const hasImage = !!form.image;

  return (
    <AppShell active="Fleet Cars" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="Edit Vehicle"
        subtitle={form.make && form.model ? `${form.make} ${form.model}${form.plate ? " · " + form.plate : ""}` : "New Vehicle"}
        breadcrumb={["dashboard", "super-admin", "Fleet", "Edit Vehicle"]}
        dark={dark} setDark={setDark} t={t}
        actions={
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={()=>router.push("/dashboard/super-admin/cars")}
              style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saved}
              style={{ padding:"7px 16px", borderRadius:8, border:"none", background:saved?"#10B981":t.accent, color:saved?"#fff":t.accentFg, fontSize:12, fontWeight:700, cursor:saved?"default":"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6, transition:"background 0.3s" }}>
              <span style={{ display:"flex" }}>{Ic.Check(saved?"#fff":t.accentFg)}</span> {saved?"Changes Saved":"Save Changes"}
            </button>
          </div>
        }
      />

      <div style={{ flex:1, overflowY:"auto", background:t.bg }}>
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"24px 24px 48px", display:"grid", gridTemplateColumns:"1fr 296px", gap:20, alignItems:"start" }}>

          {/* ══════════ LEFT ══════════ */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* tab strip */}
            <div style={{ display:"flex", background:t.cardBg, borderRadius:10, border:`1px solid ${t.border}`, padding:4, gap:0 }}>
              {(["details","pricing","features","media"] as const).map(tb=>(
                <button key={tb} onClick={()=>setTab(tb)} style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", background:tab===tb?t.accent:"transparent", color:tab===tb?t.accentFg:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize", transition:"all 0.15s" }}>
                  {tb}
                </button>
              ))}
            </div>

            {/* ── DETAILS ── */}
            {tab==="details" && (
              <>
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Vehicle Identity</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <Field label="Make" required t={t}><TInput value={form.make} onChange={v=>set("make",v)} placeholder="Toyota" t={t} icon={Ic.Vehicles}/></Field>
                    <Field label="Model" required t={t}><TInput value={form.model} onChange={v=>set("model",v)} placeholder="Camry" t={t}/></Field>
                    <Field label="Year" required t={t}><TInput value={form.year} onChange={v=>set("year",v)} placeholder="2023" t={t} icon={Ic.History}/></Field>
                    <Field label="License Plate" required t={t}><TInput value={form.plate} onChange={v=>set("plate",v)} placeholder="GR-0000-00" t={t} icon={Ic.License}/></Field>
                    <Field label="Color" t={t}><TInput value={form.color} onChange={v=>set("color",v)} placeholder="Pearl White" t={t} icon={Ic.Notes}/></Field>
                    <Field label="Category" required t={t}><SInput value={form.category} onChange={v=>set("category",v)} options={CAT_OPT} t={t}/></Field>
                  </div>
                </div>

                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Technical Specs</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <Field label="Fuel Type" required t={t}><SInput value={form.fuel} onChange={v=>set("fuel",v)} options={FUEL_OPT} t={t}/></Field>
                    <Field label="Transmission" required t={t}><SInput value={form.transmission} onChange={v=>set("transmission",v)} options={TRANS_OPT} t={t}/></Field>
                    <Field label="Seats" t={t}><TInput value={form.seats} onChange={v=>set("seats",v)} placeholder="5" t={t} icon={Ic.Profile}/></Field>
                    <Field label="Engine" t={t}><TInput value={form.engine} onChange={v=>set("engine",v)} placeholder="2.5L Hybrid" t={t} icon={Ic.Tracking}/></Field>
                    <Field label="Power" t={t}><TInput value={form.power} onChange={v=>set("power",v)} placeholder="203 hp" t={t} icon={Ic.Sales}/></Field>
                    <Field label="Mileage (km)" t={t}><TInput value={form.mileage} onChange={v=>set("mileage",v)} placeholder="0" t={t} icon={Ic.Walk}/></Field>
                  </div>
                </div>

                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Status & Location</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <Field label="Status" required t={t}><SInput value={form.status} onChange={v=>set("status",v)} options={STATUS_OPT} t={t}/></Field>
                    <Field label="Location" t={t}><TInput value={form.location} onChange={v=>set("location",v)} placeholder="Accra Central" t={t} icon={Ic.Pin}/></Field>
                  </div>
                </div>

                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:14 }}>Description</div>
                  <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={4}
                    style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", resize:"vertical", boxSizing:"border-box", transition:"border-color 0.15s" }}
                    onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}
                  />
                </div>
              </>
            )}

            {/* ── PRICING ── */}
            {tab==="pricing" && (
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Pricing</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
                  <Field label="Daily Rental Rate ($)" required t={t}><TInput value={form.dailyRate} onChange={v=>set("dailyRate",v)} placeholder="0.00" t={t} icon={Ic.Payment}/></Field>
                  <Field label="Sale Price ($)" t={t}><TInput value={form.salePrice} onChange={v=>set("salePrice",v)} placeholder="0.00" t={t} icon={Ic.Buy}/></Field>
                </div>
                <div style={{ padding:"16px 18px", background:t.bg, borderRadius:12, border:`1px solid ${t.border}` }}>
                  <div style={{ fontSize:12, fontWeight:700, color:t.textPri, marginBottom:12 }}>Calculated Rates</div>
                  {[
                    { label:"Daily",   value:`$${parseFloat(form.dailyRate||"0").toFixed(2)}`            },
                    { label:"Weekly",  value:`$${(parseFloat(form.dailyRate||"0")*7).toFixed(2)}`        },
                    { label:"Monthly", value:`$${(parseFloat(form.dailyRate||"0")*30).toFixed(2)}`       },
                    { label:"For Sale",value:`$${parseFloat(form.salePrice||"0").toLocaleString()}`      },
                  ].map((r,i,arr)=>(
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<arr.length-1?`1px solid ${t.divider}`:"none" }}>
                      <span style={{ fontSize:12, color:t.textMuted }}>{r.label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:t.textPri }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FEATURES ── */}
            {tab==="features" && (
              <>
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Standard Features</div>
                    <span style={{ fontSize:11, color:t.textMuted }}>{features.length} of {ALL_FEAT.length} selected</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {ALL_FEAT.map(f=>{
                      const on=features.includes(f);
                      return (
                        <div key={f} onClick={()=>toggleFeature(f)}
                          style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:10, border:`1.5px solid ${on?t.accent:t.border}`, background:on?t.accent+"14":t.bg, cursor:"pointer", transition:"all 0.15s" }}
                          onMouseEnter={e=>{ if(!on)(e.currentTarget as HTMLDivElement).style.borderColor=t.accent; }}
                          onMouseLeave={e=>{ if(!on)(e.currentTarget as HTMLDivElement).style.borderColor=t.border; }}
                        >
                          <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${on?t.accent:t.border}`, background:on?t.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                            {on&&<span style={{ display:"flex" }}>{Ic.Check(t.accentFg)}</span>}
                          </div>
                          <span style={{ fontSize:13, color:on?t.textPri:t.textSec, fontWeight:on?600:400 }}>{f}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Custom Features</div>
                      <div style={{ fontSize:11, color:t.textMuted, marginTop:3 }}>Add extra features with a title and description</div>
                    </div>
                    <span style={{ fontSize:11, color:t.textMuted }}>{customFeatures.length} added</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {customFeatures.map((cf, i) => (
                      <div key={i} style={{ padding:"14px 16px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.bg, position:"relative" }}>
                        <button onClick={() => setCustomFeatures(p => p.filter((_, idx) => idx !== i))} style={{ position:"absolute", top:10, right:10, width:24, height:24, borderRadius:"50%", border:`1px solid ${t.border}`, background:t.cardBg, color:t.textMuted, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, fontFamily:"'DM Sans',sans-serif" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#EF4444"; (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textMuted; }}
                        >×</button>
                        <div style={{ marginBottom:10 }}>
                          <label style={{ display:"block", fontSize:10, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Feature Title</label>
                          <input value={cf.header} onChange={e => setCustomFeatures(p => p.map((f, idx) => idx === i ? { ...f, header: e.target.value } : f))} placeholder="e.g. Premium Sound System" style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }} />
                        </div>
                        <div>
                          <label style={{ display:"block", fontSize:10, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Description</label>
                          <textarea value={cf.description} onChange={e => setCustomFeatures(p => p.map((f, idx) => idx === i ? { ...f, description: e.target.value } : f))} placeholder="Brief description of the feature…" rows={2} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textPri, fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif", resize:"vertical", boxSizing:"border-box" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setCustomFeatures(p => [...p, { header:"", description:"" }])} style={{ marginTop:14, width:"100%", padding:"10px 0", borderRadius:9, border:`2px dashed ${t.border}`, background:"transparent", color:t.accent, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = t.accent)}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = t.border)}
                  >+ Add Custom Feature</button>
                </div>
              </>
            )}

            {/* ── MEDIA ── */}
            {tab==="media" && (
              <>
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:14 }}>Vehicle Image</div>

                  {/* Current image preview */}
                  <div style={{ position:"relative", height:220, borderRadius:12, overflow:"hidden", border:`1px solid ${t.border}`, background:dark?"#111122":"#f4f4f8", marginBottom:16 }}>
                    {hasImage ? (
                      <Image
                        src={form.image}
                        alt={`${form.make} ${form.model}`}
                        fill
                        sizes="700px"
                        style={{ objectFit:"cover" }}
                      />
                    ) : (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={t.textMuted} strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" stroke={t.textMuted} strokeWidth="1.5"/><path d="M21 15l-5-5L5 21" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize:12, color:t.textMuted }}>No image</span>
                      </div>
                    )}
                    {hasImage && (
                      <span style={{ position:"absolute", top:10, left:10, fontSize:9, fontWeight:700, background:"rgba(0,0,0,0.55)", borderRadius:6, padding:"3px 9px", color:"#fff", backdropFilter:"blur(4px)" }}>Current image</span>
                    )}
                  </div>

                  {/* Upload zone */}
                  <div style={{ border:`2px dashed ${t.border}`, borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:"pointer", background:t.bg, transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}
                  >
                    <div style={{ width:40, height:40, borderRadius:10, background:t.accent+"15", border:`1px solid ${t.accent}25`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                      <span style={{ display:"flex" }}>{Ic.Notes(t.accent)}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:t.textPri, marginBottom:4 }}>Upload new image</div>
                    <div style={{ fontSize:11, color:t.textMuted }}>PNG, JPG, WebP · Max 5MB</div>
                  </div>
                </div>

                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
                  <Field label="Image URL / Path" t={t}>
                    <TInput value={form.image} onChange={v=>set("image",v)} placeholder="https://… or /images/cars/your-car.png" t={t} icon={Ic.Notes}/>
                  </Field>
                  <div style={{ fontSize:11, color:t.textMuted, marginTop:8 }}>
                    Paste a URL or enter a path relative to <code style={{ background:t.bg, padding:"2px 6px", borderRadius:5, border:`1px solid ${t.border}`, fontSize:11 }}>/public</code>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ══════════ RIGHT: live preview ══════════ */}
          <div style={{ position:"sticky", top:24, display:"flex", flexDirection:"column", gap:14 }}>

            {/* preview card */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
              <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
                Live Preview
              </div>
              <div style={{ position:"relative", height:160, background:dark?"#111122":"#f4f4f8" }}>
                {hasImage ? (
                  <Image
                    src={form.image}
                    alt={`${form.make} ${form.model}`}
                    fill
                    sizes="300px"
                    style={{ objectFit:"cover" }}
                  />
                ) : (
                  <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={t.textMuted} strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" stroke={t.textMuted} strokeWidth="1.5"/><path d="M21 15l-5-5L5 21" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
                {hasImage && (
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }}/>
                )}
                <span style={{ position:"absolute", top:8, left:8, fontSize:9, fontWeight:700, color:statusColor(form.status), background:statusColor(form.status)+"20", border:`1px solid ${statusColor(form.status)}35`, borderRadius:20, padding:"3px 9px" }}>{form.status}</span>
                <span style={{ position:"absolute", top:8, right:8, fontSize:9, fontWeight:600, color:dark?"rgba(255,255,255,0.8)":t.textMuted, background:dark?"rgba(0,0,0,0.45)":t.cardBg, border:`1px solid ${t.border}`, borderRadius:20, padding:"3px 9px" }}>{form.fuel}</span>
                {hasImage && form.make && (
                  <div style={{ position:"absolute", bottom:10, left:12 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{form.make} {form.model}</div>
                  </div>
                )}
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontSize:14, fontWeight:800, color:t.textPri, marginBottom:2 }}>{form.make || "—"} {form.model}</div>
                <div style={{ fontSize:11, color:t.textMuted, marginBottom:12 }}>{form.year}{form.plate ? " · " + form.plate : ""}{form.color ? " · " + form.color : ""}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:`1px solid ${t.divider}` }}>
                  <div>
                    <span style={{ fontSize:16, fontWeight:800, color:t.textPri }}>{form.dailyRate ? `$${form.dailyRate}` : "—"}</span>
                    {form.dailyRate && <span style={{ fontSize:10, color:t.textMuted }}>/day</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:statusColor(form.status) }}/>
                    <span style={{ fontSize:11, color:t.textSec }}>{form.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* summary */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"16px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Summary</div>
              {[
                { label:"Category",     value:form.category || "—",         icon:(c:string)=>Ic.Notes(c)     },
                { label:"Transmission", value:form.transmission || "—",      icon:(c:string)=>Ic.Settings(c)  },
                { label:"Seats",        value:form.seats || "—",            icon:(c:string)=>Ic.Profile(c)   },
                { label:"Mileage",      value:form.mileage ? `${Number(form.mileage).toLocaleString()} km` : "—", icon:(c:string)=>Ic.Walk(c) },
                { label:"Location",     value:form.location || "—",         icon:(c:string)=>Ic.Pin(c)       },
                { label:"Features",     value:`${features.length + customFeatures.length} total`, icon:(_:string)=>Ic.Check() },
              ].map((row,i,arr)=>(
                <div key={row.label} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:i<arr.length-1?`1px solid ${t.divider}`:"none" }}>
                  <span style={{ display:"flex", opacity:0.4 }}>{row.icon(t.textMuted)}</span>
                  <span style={{ fontSize:11, color:t.textMuted, flex:1 }}>{row.label}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:t.textPri }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* danger zone */}
            <div style={{ background:t.cardBg, borderRadius:14, border:"1px solid rgba(239,68,68,0.2)", padding:"16px" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#EF4444", marginBottom:10 }}>Danger Zone</div>
              <button
                onClick={()=>{ if(confirm("Delete this vehicle? This cannot be undone.")) router.push("/dashboard/super-admin/cars"); }}
                style={{ width:"100%", padding:"9px 0", borderRadius:9, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.06)", color:"#EF4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"background 0.15s" }}
                onMouseEnter={e=>((e.currentTarget as HTMLButtonElement).style.background="rgba(239,68,68,0.12)")}
                onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.background="rgba(239,68,68,0.06)")}
              >
                {Ic.Logout("#EF4444")} Delete Vehicle
              </button>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Suspense wrapper required for useSearchParams ────────────────────────────
export default function EditCarPage() {
  return (
    <Suspense>
      <EditCarPageContent />
    </Suspense>
  );
}
