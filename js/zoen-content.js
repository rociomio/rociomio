/**
 * Zoen Calega x Rocio Mio - dossier de produccion audiovisual.
 * Textos editables aca; las imagenes salen de js/zoen-media.js (una carpeta por proyecto).
 */
window.ZOEN_CONTENT = {
  meta: {
    title: {
      es: "Zoen Calega × Rocio Mio | Produccion visual",
      en: "Zoen Calega × Rocio Mio | Visual production",
    },
  },
  nav: {
    volver: { es: "[ VOLVER AL ORIGEN ]", en: "[ BACK TO HOME ]" },
    collabs: { es: "[ COLABORACIONES ]", en: "[ COLLABORATIONS ]" },
  },
  hero: {
    kicker: { es: "STUDIO DOSSIER · 01", en: "STUDIO DOSSIER · 01" },
    marca: { es: "RM × ZC", en: "RM × ZC" },
    display: {
      es: "mucha\ntele",
      en: "mucha\ntele",
    },
    titulo: { es: "ROCIO MIO +", en: "ROCIO MIO +" },
    cruz: { es: "ZOEN CALEGA", en: "ZOEN CALEGA" },
    linea: {
      es: "instalaciones + experiencias visuales",
      en: "installations + visual experiences",
    },
    lead: {
      es: "Produccion para eventos e instalaciones visuales de tvs",
      en: "Production for events and visual TV installations",
    },
    // Imagen unica del portal - ruta dentro de collabs/zoen calega/ y proyecto al que linkea.
    imagen: "Decentraland/web/casa-futuro-buenos-aires.webp",
    imagenProyecto: "decentraland",
  },
  // Bloques de metadata - ficha tecnica tipo produccion.
  metaBlocks: [
    {
      label: { es: "Formato", en: "Format" },
      value: {
        es: "Instalaciones · eventos · live visual",
        en: "Installations · events · live visual",
      },
    },
    {
      label: { es: "Hardware", en: "Hardware" },
      value: {
        es: "CRT · visuales analogicas · camaras\nGenerativos · mapping · LED",
        en: "CRT · analog visuals · cameras\nGenerative · mapping · LED",
      },
    },
    {
      label: { es: "Alcance", en: "Scope" },
      value: {
        es: "Artistas, eventos y empresas\nConcepto · montaje · performance",
        en: "Artists, events and companies\nConcept · build · performance",
      },
    },
  ],
  indexLabel: { es: "INDICE DE OBRAS", en: "WORKS INDEX" },
  factsLabels: {
    rol: { es: "Rol", en: "Role" },
    ref: { es: "Ref", en: "Ref" },
  },
  galeria: {
    prev: { es: "Imagen anterior", en: "Previous image" },
    next: { es: "Imagen siguiente", en: "Next image" },
  },
  // Proyectos - carpeta = nombre exacto de la carpeta en collabs/zoen calega/.
  // ref: autoria en la ficha ("RM × ZC" por defecto, "ZC" si es solo de Zoen).
  // orden: nombres de archivo (sin extension) en el orden del carrusel; el resto va al final.
  projects: [
    {
      id: "decentraland",
      carpeta: "Decentraland",
      orden: [
        "decentraland instalation",
        "casa futuro buenos aires",
        "decentraland",
        "decentraland curacion de 64 artistas y exhibicion en metaberso",
        "decentraland metaverso",
        "decentraland instalacion digital",
      ],
      titulo: { es: "DECENTRALAND", en: "DECENTRALAND" },
      lugar: { es: "Casa Futuro · Buenos Aires", en: "Casa Futuro · Buenos Aires" },
      anio: "",
      rol: {
        es: "Curaduria · instalacion CRT · metaverso",
        en: "Curation · CRT installation · metaverse",
      },
      texto: {
        es: "Curaduria de 64 artistas y exhibicion en el metaverso de Decentraland, con su correlato fisico en Casa Futuro, Buenos Aires. Un muro de monitores CRT en el deck exterior y una galeria virtual en simultaneo: la misma muestra habitando dos espacios.",
        en: "Curation of 64 artists and an exhibition in the Decentraland metaverse, with its physical counterpart at Casa Futuro, Buenos Aires. A CRT monitor wall on the outdoor deck and a virtual gallery at the same time: one show inhabiting two spaces.",
      },
    },
    {
      id: "art-on-tezos",
      carpeta: "art on tezos",
      titulo: { es: "ART ON TEZOS", en: "ART ON TEZOS" },
      lugar: { es: "Buenos Aires", en: "Buenos Aires" },
      anio: "",
      rol: {
        es: "Instalacion CRT · visuales en vivo",
        en: "CRT installation · live visuals",
      },
      texto: {
        es: "Produccion visual para Art on Tezos Buenos Aires, junto a Tezos y Trilitech. Muro de monitores y visuales en vivo para un encuentro de arte digital y cultura onchain.",
        en: "Visual production for Art on Tezos Buenos Aires, together with Tezos and Trilitech. A monitor wall and live visuals for a gathering of digital art and onchain culture.",
      },
    },
    {
      id: "nitelite",
      carpeta: "nitelite",
      ref: "ZC",
      titulo: { es: "NITELITE", en: "NITELITE" },
      lugar: { es: "CC Konex · Buenos Aires", en: "CC Konex · Buenos Aires" },
      anio: "",
      rol: {
        es: "Instalacion · feria de arte XXL",
        en: "Installation · XXL art fair",
      },
      texto: {
        es: "Instalacion audiovisual para Nitelite Club en el Centro Cultural Konex, dentro de una feria de arte de gran escala. Pantallas, senal y luz como parte del recorrido nocturno.",
        en: "Audiovisual installation for Nitelite Club at Centro Cultural Konex, within a large-scale art fair. Screens, signal and light as part of the night route.",
      },
    },
    {
      id: "spiritual-speed",
      carpeta: "Spiritual speed",
      ref: "ZC",
      titulo: { es: "SPIRITUAL SPEED", en: "SPIRITUAL SPEED" },
      lugar: { es: "La Plata", en: "La Plata" },
      anio: "",
      rol: {
        es: "Muestra de arte · instalacion visual",
        en: "Art show · visual installation",
      },
      texto: {
        es: "Muestra de arte en la ciudad de La Plata, con produccion y curaduria de @mote.mt. Monitores y visuales integrados al espacio expositivo como una obra mas del recorrido.",
        en: "Art show in the city of La Plata, produced and curated by @mote.mt. Monitors and visuals built into the exhibition space as one more work along the route.",
      },
    },
    {
      id: "atrako",
      carpeta: "atrako la plata",
      ref: "ZC",
      titulo: { es: "ATRAKO", en: "ATRAKO" },
      lugar: { es: "Galpon de las Artes · La Plata", en: "Galpon de las Artes · La Plata" },
      anio: "",
      rol: {
        es: "Instalacion · live visual",
        en: "Installation · live visual",
      },
      texto: {
        es: "Intervencion visual para Atrako en el Galpon de las Artes de La Plata. Monitores, senal analogica y visuales en vivo acompanando la noche.",
        en: "Visual intervention for Atrako at Galpon de las Artes, La Plata. Monitors, analog signal and live visuals carrying the night.",
      },
    },
    {
      id: "estados-correlacionados",
      carpeta: "estados corelacionados",
      titulo: { es: "ESTADOS CORRELACIONADOS", en: "CORRELATED STATES" },
      lugar: { es: "Dunepark", en: "Dunepark" },
      anio: "",
      rol: {
        es: "Pieza audiovisual · video generativo",
        en: "Audiovisual piece · generative video",
      },
      texto: {
        es: "Pieza audiovisual presentada en Dunepark. Estados de imagen que se afectan entre si: senal, ruido y video como un sistema de correspondencias. Exhibicion de obras de una residencia producida por Rocio Mio en Bosquegracias, Patagonia argentina, que reunio 17 artistas brasileros mas 6 argentinos en colaboracion y convivencia durante febrero 2025.",
        en: "Audiovisual piece presented at Dunepark. Image states that affect one another: signal, noise and video as a system of correspondences. An exhibition of works from a residency produced by Rocio Mio at Bosquegracias, Argentine Patagonia, which brought together 17 Brazilian and 6 Argentine artists in collaboration and shared living during February 2025.",
      },
    },
    {
      id: "exhibiciones",
      carpeta: "exhibiciones",
      showLabels: true,
      titulo: { es: "EXHIBICIONES", en: "EXHIBITIONS" },
      lugar: { es: "Buenos Aires · La Pampa · NYC · Montreal", en: "Buenos Aires · La Pampa · NYC · Montreal" },
      anio: "",
      rol: {
        es: "Muestras · glitch analogico · proyecciones",
        en: "Shows · analog glitch · projections",
      },
      texto: {
        es: "Seleccion de exhibiciones y presentaciones: glitch analogico en vivo, la instalacion Vuelapelucas 3000 en La Pampa, Melodrumma en Teatro Casero, la pieza Ausencia y proyecciones en Times Square (NYC) y RGB MTL (Montreal).",
        en: "A selection of shows and presentations: live analog glitch, the Vuelapelucas 3000 installation in La Pampa, Melodrumma at Teatro Casero, the piece Ausencia and screenings at Times Square (NYC) and RGB MTL (Montreal).",
      },
    },
    {
      id: "montajes",
      carpeta: "montajes",
      titulo: { es: "MONTAJES", en: "BUILDS" },
      lugar: { es: "Backstage", en: "Backstage" },
      anio: "",
      rol: {
        es: "Armado tecnico · logistica · puesta",
        en: "Technical build · logistics · staging",
      },
      texto: {
        es: "Registro de armado: apilado de monitores, cableado, senal y puesta en espacio. La produccion como parte visible del trabajo, antes de que se encienda la primera pantalla.",
        en: "Build log: stacking monitors, cabling, signal and staging. Production as a visible part of the work, before the first screen turns on.",
      },
    },
  ],
  footer: {
    nota: {
      es: "Rocio (Arg) y Zoen (Peru) son artistas multimedia, en su union gestaron mas de 10 años de producciones audiovisuales para musicos, empresas y eventos. Estas instalaciones proyectan visuales en vivo, imagenes generativas y logos o publicidades segun el evento. Compartieron residencia artistica en Bosquegracias y poseen una gran conexion artistica al momento de montar una instalacion. Ofrecen edicion de contenidos especificos, direccion de arte y propuestas instalativas a medida del evento, destacando puntualidad, compromiso y una puesta inolvidable para todos los espectadores. El objetivo de estas instalaciones es ser inmersivas, creativas e inolvidables.",
      en: "Rocio (Arg) and Zoen (Peru) are multimedia artists who, together, have built more than 10 years of audiovisual productions for musicians, companies and events. These installations project live visuals, generative images and logos or ads depending on the event. They shared an art residency at Bosquegracias and have a strong artistic connection when building an installation. They offer custom content editing, art direction and installation proposals tailored to each event, standing out for punctuality, commitment and an unforgettable staging for every viewer. The goal of these installations is to be immersive, creative and unforgettable.",
    },
    // Creditos - nombre con link + rol (externo: abre en pestana nueva).
    creditos: [
      {
        nombre: "Rocio Mio",
        url: "https://rociomio.github.io/rociomio/",
        rol: {
          es: "Direccion de arte · visuales analogicas y generativas · audiovisual",
          en: "Art direction · analog and generative visuals · audiovisual",
        },
      },
      {
        nombre: "Zoen Calega",
        url: "https://www.instagram.com/zoen_calega/",
        externo: true,
        rol: {
          es: "Productor audiovisual · visuales analogicas, generativas y livecoding",
          en: "Audiovisual producer · analog and generative visuals, livecoding",
        },
      },
    ],
  },
};

window.PAGE_I18N_CONTENT = window.ZOEN_CONTENT;
