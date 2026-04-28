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

## Reconocimientos

- **[Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core)** por [Larkinabout](https://github.com/Larkinabout) — Framework base. [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).
- **[Sistema ABF](https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry)** por [AnimaBeyondDevelop](https://github.com/AnimaBeyondDevelop) — Data model de actores.

---

## Autor

**Dragug**

## Licencia

[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) + [Foundry VTT EULA](https://foundryvtt.com/article/license/).

**Anima Beyond Fantasy** es marca registrada de Anima Project Studio. No afiliado.
