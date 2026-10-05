# Google Play listing — DeGuardia

Copy these into Play Console for **en-US** and **es-MX** (or `es`) store listings.

Privacy Policy URL: `https://alanmatias.com/guardias/privacy.html`  
Terms (optional): `https://alanmatias.com/guardias/terms.html`

Package name: `com.alanmatias.guardias`  
App name (device): DeGuardia

---

## English (en-US)

### App title (≤ 30 characters)

```
DeGuardia
```

### Short description (≤ 80 characters)

```
Track A-C and A-D medical guardia rotations. Offline calendar for residents.
```

### Full description

```
DeGuardia helps Mexican medical residents and doctors track on-call rotations without ads or accounts.

Set up A-C or A-D (and similar) guardia patterns, see your shifts on a calendar, and check free weekends at a glance. Everything stays on your device.

Features
• Create rotation periods with pattern, offset, dates, and optional vacation
• Month calendar with shift highlighting and legend filters
• Day details for past and upcoming shifts
• Homepage stats for upcoming shifts and free weekends
• English and Spanish — follows your device language or your Settings choice
• Offline-first — no account, no cloud sync in this version

Built for the Mexican guardia system so you can plan life around your schedule.
```

### Screenshot caption ideas

1. Set up your A-D rotation in minutes  
2. See shifts and free weekends on the calendar  
3. Check day details for past and future guardias  
4. Track upcoming shifts from the home screen  
5. Use the app in English or Spanish  

---

## Español (es-MX)

### Título de la app (≤ 30 caracteres)

```
DeGuardia
```

### Descripción corta (≤ 80 caracteres)

```
Organiza rotaciones de guardia A-C y A-D. Calendario sin conexión para residentes.
```

### Descripción completa

```
DeGuardia ayuda a residentes y médicos en México a llevar sus rotaciones de guardia sin anuncios ni cuentas.

Configura patrones A-C o A-D, ve tus turnos en el calendario y revisa de un vistazo los fines de semana libres. Todo se guarda en tu dispositivo.

Funciones
• Crea periodos de rotación con patrón, desfase, fechas y vacaciones opcionales
• Calendario mensual con turnos resaltados y filtros en la leyenda
• Detalle del día para guardias pasadas y próximas
• Resumen en inicio con turnos próximos y fines de semana libres
• Inglés y español — según el idioma del dispositivo o tu elección en Ajustes
• Sin conexión — sin cuenta ni sincronización en la nube en esta versión

Hecha para el sistema de guardias de México, para que organices tu vida alrededor de tu horario.
```

### Ideas de pies de captura

1. Configura tu rotación A-D en minutos  
2. Ve turnos y fines de semana libres en el calendario  
3. Revisa el detalle de guardias pasadas y futuras  
4. Consulta próximos turnos desde el inicio  
5. Usa la app en inglés o español  

---

## Graphics checklist (upload in Play Console — not in this repo)

| Asset | Spec |
| --- | --- |
| High-res icon | 512 × 512 PNG (export/downscale from `assets/icon.png`) |
| Feature graphic | 1024 × 500 PNG or JPEG |
| Phone screenshots | At least 2; 16:9 or 9:16; JPEG/PNG |

---

## Data safety form (suggested answers)

Answer based on current app behavior (AsyncStorage on device; no backend; no analytics SDK).

| Question | Suggested answer |
| --- | --- |
| Does your app collect or share user data? | **No** data collected / shared with developers or third parties via the app (beyond what Google Play itself collects) |
| Is data encrypted in transit? | N/A if no collection; local-only |
| Can users request deletion? | Yes — clear app data or uninstall |
| Data types | If Play forces a category for on-device-only apps, prefer declaring **no collection**. Do not claim “App activity” or “Personal info” collection unless you add analytics/accounts later. |
| Approximate location / precise location | Not collected |
| Health / fitness | Not collected |
| Photos / files | Not collected |
| Device IDs | Not collected by the app |

**Locale note:** Reading device locale for default language is on-device UI behavior, not “data collection” sent off-device.

Revisit this form if you add accounts, analytics, crash reporting, or cloud sync.

---

## Content rating

Complete the IARC questionnaire in Play Console. Expect a low rating suitable for a utilities/productivity schedule app:

- No user-generated public content / social features  
- No violence, gambling, or mature themes  
- Not primarily for children  

Category suggestion: **Productivity** or **Medical** (utility for clinicians — Productivity is safer if Medical implies clinical claims).
