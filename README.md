# Token Action HUD — Anima Beyond Fantasy

![Foundry v14](https://img.shields.io/badge/Foundry-v14-informational)
![System animabf](https://img.shields.io/badge/System-Anima%20Beyond%20Fantasy-blueviolet)

Token Action HUD es un HUD reposicionable de acciones para un token seleccionado, compatible con el sistema **Anima Beyond Fantasy** para Foundry VTT.

> **Este módulo es un complemento de sistema (system module) para [Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core) de Larkinabout.** No funciona de forma independiente.

---

## Características

- Realiza tiradas directamente desde el HUD sin abrir la ficha de personaje.
- Haz clic derecho en un ítem para abrir su ficha.
- Mueve el HUD y elige expandir los menús hacia arriba o abajo.
- Desbloquea el HUD para personalizar los grupos y acciones.

### Pestañas del HUD

| Pestaña | Contenido |
|---|---|
| **Combate** | Ataque / Parada / Esquiva, Armas (con ataque/daño), Armaduras |
| **Místico** | Conjuros con grados (Base, Intermedio, Avanzado, Arcano) + coste de Zeon, Invocación (Invocar/Desterrar/Atar/Controlar) |
| **Psíquico** | Poderes Psíquicos |
| **Dominio** | Habilidades de Ki, Técnicas, Artes Marciales |
| **Secundarias** | Atléticas, Vigor, Percepción, Intelectuales, Sociales, Subterfugio, Creativas |
| **Atributos** | Características primarias, Resistencias (Física/Enfermedad/Veneno/Mágica/Psíquica), Iniciativa |
| **Utilidad** | Fin de turno, Visibilidad del token, Combate |

### Configuración del módulo

- **Mostrar Detalles de Armas** — Muestra valores de ataque/daño junto al nombre del arma.
- **Mostrar Grados de Conjuros** — Muestra cada grado de conjuro como una acción separada con su coste de Zeon.

---

## Instalación

### Módulos requeridos

1. **[Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core)** — El módulo base del HUD.
2. **[Anima Beyond Fantasy System](https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry)** — El sistema de juego.

### Instalación manual

1. Descarga la última release de este repositorio.
2. Extrae el contenido en `Data/modules/token-action-hud-animabf/`.
3. En Foundry VTT, ve a **Configuración > Módulos** y activa tanto **Token Action HUD Core** como **Token Action HUD Anima Beyond Fantasy**.

### Instalación por Manifest URL

1. En Foundry VTT, ve a **Configuración > Módulos > Instalar Módulo**.
2. Pega la URL del manifest: `https://raw.githubusercontent.com/tisken/token-action-hub-animabf/main/module.json`
3. Haz clic en **Instalar**.

---

## Desarrollo

### Requisitos

- Node.js 18+
- npm

### Build

```bash
npm install
npm run build
```

### Desarrollo con watch

```bash
npm run dev
```

### Estructura del proyecto

```
token-action-hud-animabf/
├── languages/          # Traducciones (EN, ES)
├── scripts/
│   ├── action-handler.js   # Construye las acciones del HUD desde el actor
│   ├── constants.js        # Grupos, tipos de acción, habilidades
│   ├── defaults.js         # Layout por defecto del HUD
│   ├── init.js             # Punto de entrada del módulo
│   ├── roll-handler.js     # Ejecuta acciones al hacer clic
│   ├── settings.js         # Configuración del módulo
│   ├── system-manager.js   # Conecta con la API del core
│   └── utils.js            # Utilidades
├── module.json             # Manifiesto de Foundry VTT
├── package.json
└── rollup.config.js
```

---

## Integración con el sistema

El módulo intenta usar los callbacks nativos del sistema Anima Beyond Fantasy para:

- **Ataques con arma** — Usa `createWeaponAttack` para abrir el diálogo de ataque del sistema.
- **Lanzar conjuros** — Usa `castSpellGrade` para lanzar conjuros con el flujo nativo (gestión de Zeon, proyección mágica, etc.).
- **Poderes psíquicos** — Usa `castPsychicPower` para tirar potencial psíquico y resolver efectos.

Si los callbacks nativos no están disponibles (por cambios en el sistema), se usa un **fallback** con tiradas genéricas.

---

## Reconocimientos y Atribución

Este módulo está basado en la arquitectura y patrones de los siguientes proyectos:

- **[Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core)** por [Larkinabout](https://github.com/Larkinabout) — El framework base que hace posible este HUD. Licenciado bajo [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).
- **[Anima Beyond Fantasy System](https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry)** por [AnimaBeyondDevelop](https://github.com/AnimaBeyondDevelop) — El sistema de Foundry VTT para Anima Beyond Fantasy del cual se lee el data model de los actores.

Gracias a la comunidad de Foundry VTT y a los Community Helpers del Discord por su apoyo continuo.

---

## Licencia

Este módulo para Foundry VTT está licenciado bajo [Creative Commons Attribution 4.0 International License (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/).

Este trabajo también está licenciado bajo la [Foundry Virtual Tabletop EULA — Limited License Agreement for module development](https://foundryvtt.com/article/license/).

**Anima Beyond Fantasy** es una marca registrada de Anima Project Studio. Este módulo no está afiliado ni respaldado por Anima Project Studio.
