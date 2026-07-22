# Token Action HUD — ABF

![Foundry v14](https://img.shields.io/badge/Foundry-v14-informational)
![System animabf](https://img.shields.io/badge/System-ABF-blueviolet)

HUD reposicionable de acciones rápidas para tokens del sistema **ABF (Anima Beyond Fantasy)** en Foundry VTT.

> **Requiere [Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core).** No funciona de forma independiente.

---

## Características

- Tiradas directas desde el HUD sin abrir la ficha.
- Clic derecho en un ítem para abrir su ficha.
- HUD reposicionable con menús expandibles.
- Personalización de grupos y acciones.
- Diálogo de modificador en todas las tiradas.
- Integración nativa con los diálogos del sistema ABF.

### Pestañas

| Pestaña | Contenido |
|---|---|
| **Combate** | Ataque/Parada/Esquiva (solo desarrolladas, esquiva como fallback), Armas (diálogo de ataque nativo), Armaduras |
| **Místico** | PM Ofn./Def., Conjuros agrupados por Vía con grados (B/I/Av/A) + selector de grado + info en chat, Invocación (solo desarrolladas) |
| **Psíquico** | PP Ofn./Def., Poderes Psíquicos ordenados por nivel (diálogo nativo) |
| **Dominio** | Habilidades de Ki, Técnicas (muestra descripción y costes Ki en chat), Artes Marciales |
| **Secundarias** | Solo las desarrolladas: Atléticas, Vigor, Percepción, Intelectuales, Sociales, Subterfugio, Creativas |
| **Atributos** | Características (con diálogo de modificador), Resistencias (RF/RE/RV/RM/RP), Iniciativa |
| **Utilidad** | Finalizar Turno, Visibilidad, Combate |

### Flujo de Conjuros

1. Clic en el conjuro → Selector de grado (Base/Intermedio/Avanzado/Arcano)
2. Se muestra en el chat: nombre, grado, zeon, vía y descripción
3. Se abre el diálogo de ataque mágico del sistema
4. Resultado del combate en el chat

### Flujo de Armas

- Clic en arma → Abre `AttackConfigurationDialog` del sistema (con o sin targets)
- Fallback: tirada simple con diálogo de modificador

### Filtros Inteligentes

- **Conjuros**: solo muestra grados que el personaje puede lanzar (requisito de INT)
- **Secundarias**: solo las desarrolladas (valor > 0)
- **Combate**: solo ataque/parada/esquiva desarrolladas (esquiva siempre como fallback)
- **Místico/Psíquico**: solo si el personaje tiene puntos invertidos
- **Invocación**: solo las desarrolladas (parcial: ej. solo Controlar)

---

## Instalación

### Requisitos

1. **[Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core)**
2. **[Sistema ABF](https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry)**

### Manifest URL

```
https://github.com/tisken/token-action-hub-animabf/releases/latest/download/module.json
```

### Manual

1. Descarga la última release.
2. Extrae en `Data/modules/token-action-hud-animabf/`.
3. Activa ambos módulos en Foundry.

---

## Desarrollo

```bash
npm install
npm run build   # producción
npm run dev     # watch
```

### Estructura

```
scripts/
├── action-handler.js   # Construye acciones desde el actor ABF
├── constants.js        # Grupos y constantes
├── defaults.js         # Layout por defecto
├── init.js             # Punto de entrada
├── roll-handler.js     # Ejecuta acciones (rolls, diálogos)
├── settings.js         # Configuración del módulo
├── system-manager.js   # Conecta con la API del core
└── utils.js            # Utilidades
```

---

## Notas de desarrollo (contexto para retomar)

### Versión actual: 2.4.3

### Workflow de release

```bash
# 1. Build
npm run build

# 2. Bump version en module.json (manualmente o con sed)
sed -i 's/"version": "X.X.X"/"version": "X.X.Y"/' module.json

# 3. Commit y push
git add -A && git commit -m "mensaje" && git push origin main

# 4. Crear zip con carpeta wrapper (nombre FIJO: token-action-hud-animabf.zip)
cd /tmp
mkdir token-action-hud-animabf
cp -r /tokenhub/scripts /tokenhub/styles /tokenhub/languages /tokenhub/module.json token-action-hud-animabf/
zip -r token-action-hud-animabf.zip token-action-hud-animabf/
rm -rf token-action-hud-animabf
cd /tokenhub

# 5. Crear release con zip + module.json como assets separados (AMBOS son obligatorios)
/tmp/gh_2.63.2_linux_amd64/bin/gh release create vX.X.Y \
  /tmp/token-action-hud-animabf.zip \
  /tokenhub/module.json \
  --title "vX.X.Y" --notes "descripción"
```

> CRÍTICO: el zip debe llamarse exactamente `token-action-hud-animabf.zip` (sin versión) porque
> `module.json` apunta a `releases/latest/download/token-action-hud-animabf.zip`.
> El `module.json` debe subirse también como asset independiente para que Foundry detecte
> la nueva versión al hacer Update desde el gestor de módulos.

### Herramientas

- SSH key: `/root/.ssh/id_ed25519`
- gh CLI: `/tmp/gh_2.63.2_linux_amd64/bin/gh` (autenticado como `tisken`)
- Sistema ABF clonado en: `/tmp/AnimaBeyondFoundry` (para consultar data models)
- Repo: `https://github.com/tisken/token-action-hub-animabf`

### Arquitectura clave

- TAH Core hook pattern: `Hooks.once('tokenActionHudCoreApiReady')` para definir clases
- Tab `nestId` DEBE ser igual a `id` en defaults.js o el tab se crea como `type: 'custom'` y los subgrupos no aparecen
- Subgrupos dentro de un tab NO pueden tener el mismo `id` que el tab padre (colisión)
- Grupos dinámicos: `addGroup(groupData, parentGroupData)` con `type: 'system-derived'` — bypasan el caché del core
- Imports del sistema ABF: usar rutas absolutas `/systems/animabf/...` (no relativas)
- El módulo NO carga sus propios archivos i18n — usar `game.i18n.localize('anima.ui.*')` del sistema ABF

### Tab Efectos

- Carga del compendio `animabf.effects` (54 items, 8 carpetas)
- Agrupado por carpeta del compendio usando `pack.folders` + `item.folder?.id`
- `encodedValue`: `effect|{actorItemId}|{packUuid}` — actorItemId vacío si no está en el actor
- Clic = importa del compendio y activa (active:true, AE habilitado)
- Segundo clic = elimina item y AE del actor
- El split del payload usa `payload.slice(1).join('|')` para preservar los `|` del UUID

### Bugs conocidos / resueltos

- `system.active` es booleano directo, NO `system.active.value`
- `linkedAE` buscar por `ae.origin === item.uuid` (exacto), no `includes(id)`
- Pack `animabf.effects` tiene `size:0` hasta llamar `getDocuments()` (lazy loading)
- Foundry no actualiza el módulo si el zip tiene nombre versionado o falta `module.json` como asset

---

## Reconocimientos

- **[Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core)** por [Larkinabout](https://github.com/Larkinabout) — Framework base. [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).
- **[Sistema ABF](https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry)** por [AnimaBeyondDevelop](https://github.com/AnimaBeyondDevelop) — Data model de actores.

---

## Autor

**Dragug**

## Licencia

[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) + [Foundry VTT EULA](https://foundryvtt.com/article/license/).

**Anima Beyond Fantasy** es marca registrada de Anima Project Studio. No afiliado.
