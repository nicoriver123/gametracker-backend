
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Game from "../Models/Game.js";

dotenv.config();
connectDB();

const games = [
  // 🎯 ACCIÓN
  {
    titulo: "God of War Ragnarök",
    genero: "Accion",
    plataforma: "PS5",
    añoLanzamiento: 2022,
    desarrollador: "Santa Monica Studio",
    descripcion: "Kratos y Atreus enfrentan el destino de los dioses nórdicos.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762185008/gof_cn6jlm.jpg",
    esGlobal: true
  },
  {
    titulo: "Devil May Cry 5",
    genero: "Accion",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2019,
    desarrollador: "Capcom",
    descripcion: "Combina acción frenética y combate estilizado en una historia demoníaca.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762189177/Devil_May_Cry_5_dlaazu.jpg",
    esGlobal: true
  },
  {
    titulo: "Bayonetta 3",
    genero: "Accion",
    plataforma: "Nintendo Switch",
    añoLanzamiento: 2022,
    desarrollador: "PlatinumGames",
    descripcion: "La bruja Bayonetta regresa con un arsenal de movimientos espectaculares.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762189125/bayo_lurpbv.jpg",
    esGlobal: true
  },

  // 🗺️ AVENTURA
  {
    titulo: "Uncharted 4: El Desenlace del Ladrón",
    genero: "Aventura",
    plataforma: "PS5",
    añoLanzamiento: 2016,
    desarrollador: "Naughty Dog",
    descripcion: "Nathan Drake vive su última gran aventura de tesoros y misterios.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762189068/uncharted_4_a_thief_s_end-134903281-large_qvqtbr.jpg",
    esGlobal: true
  },
  {
    titulo: "The Legend of Zelda: Breath of the Wild",
    genero: "Aventura",
    plataforma: "Nintendo Switch",
    añoLanzamiento: 2017,
    desarrollador: "Nintendo",
    descripcion: "Explora el vasto mundo de Hyrule en libertad total.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762189003/The_Legend_of_Zelda_Breath_of_the_Wild_lyr2kv.jpg",
    esGlobal: true
  },
  {
    titulo: "Tomb Raider",
    genero: "Aventura",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2013,
    desarrollador: "Crystal Dynamics",
    descripcion: "Reinicio de la saga con una Lara Croft más humana y aventurera.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188959/tomb_njxyea.jpg",
    esGlobal: true
  },

  // ⚔️ ROL (RPG)
  {
    titulo: "The Witcher 3: Wild Hunt",
    genero: "RPG",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2015,
    desarrollador: "CD Projekt Red",
    descripcion: "Geralt de Rivia vive una épica historia de monstruos, guerra y decisiones morales.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188865/new_project_-_2023-04-05t141127.373_ag7kyo.jpg",
    esGlobal: true
  },
  {
    titulo: "Elden Ring",
    genero: "RPG",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2022,
    desarrollador: "FromSoftware",
    descripcion: "Un extenso mundo abierto lleno de enemigos desafiantes y secretos.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188817/elden_v8diql.jpg",
    esGlobal: true
  },
  {
    titulo: "Final Fantasy VII Remake",
    genero: "RPG",
    plataforma: "PS5",
    añoLanzamiento: 2020,
    desarrollador: "Square Enix",
    descripcion: "Revive la leyenda de Cloud Strife con un sistema de combate moderno.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188738/FFVIIRemake_phkfph.png",
    esGlobal: true
  },

  // 🧠 ESTRATEGIA
  {
    titulo: "Age of Empires IV",
    genero: "Estrategia",
    plataforma: "PC",
    añoLanzamiento: 2021,
    desarrollador: "Relic Entertainment",
    descripcion: "Revive la historia de grandes civilizaciones con estrategia en tiempo real.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188670/Age_of_Empires_IV_Cover_Art_mzqsfg.png",
    esGlobal: true
  },
  {
    titulo: "Civilization VI",
    genero: "Estrategia",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2016,
    desarrollador: "Firaxis Games",
    descripcion: "Construye un imperio que resista el paso del tiempo.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188611/images_rgkvcg.jpg",
    esGlobal: true
  },
  {
    titulo: "StarCraft II",
    genero: "Estrategia",
    plataforma: "PC",
    añoLanzamiento: 2010,
    desarrollador: "Blizzard Entertainment",
    descripcion: "Combina estrategia militar con batallas futuristas entre tres razas galácticas.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188530/starcraft-ii-flashpoint-1_jnk1fz.jpg",
    esGlobal: true
  },

  // ⚽ DEPORTES
  {
    titulo: "FIFA 23",
    genero: "Deportes",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2022,
    desarrollador: "EA Sports",
    descripcion: "El simulador de fútbol más realista con licencias oficiales.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188458/fifa-23-202210612192557_1_kolmjb.jpg",
    esGlobal: true
  },
  {
    titulo: "NBA 2K24",
    genero: "Deportes",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2023,
    desarrollador: "Visual Concepts",
    descripcion: "Experimenta el baloncesto con gráficos de nueva generación.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188406/nba_wkvvwf.jpg",
    esGlobal: true
  },
  {
    titulo: "Tony Hawk’s Pro Skater 1+2",
    genero: "Deportes",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2020,
    desarrollador: "Vicarious Visions",
    descripcion: "El clásico del skate regresa remasterizado con mejoras visuales.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188281/tony_rvkluo.jpg",
    esGlobal: true
  },

  // 🏎️ CARRERAS
  {
    titulo: "Forza Horizon 5",
    genero: "Carreras",
    plataforma: "PC/Xbox",
    añoLanzamiento: 2021,
    desarrollador: "Playground Games",
    descripcion: "Carreras de mundo abierto ambientadas en México.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188178/Forza_Horizon_5_cover_art_bstt9i.jpg",
    esGlobal: true
  },
  {
    titulo: "Gran Turismo 7",
    genero: "Carreras",
    plataforma: "PS5",
    añoLanzamiento: 2022,
    desarrollador: "Polyphony Digital",
    descripcion: "Simulación realista de conducción con cientos de autos y circuitos.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762188119/turismo_mhimf8.jpg",
    esGlobal: true
  },
  {
    titulo: "Need for Speed Heat",
    genero: "Carreras",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2019,
    desarrollador: "Ghost Games",
    descripcion: "Carreras callejeras llenas de adrenalina y personalización extrema.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762187965/need_lncm1h.jpg",
    esGlobal: true
  },

  // 🛠️ SIMULACIÓN
  {
    titulo: "The Sims 4",
    genero: "Simulacion",
    plataforma: "PC/PS/Xbox",
    añoLanzamiento: 2014,
    desarrollador: "Maxis",
    descripcion: "Crea y controla personas virtuales en un mundo abierto.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762187868/sim4_so1zsw.jpg",
    esGlobal: true
  },
  {
    titulo: "Microsoft Flight Simulator",
    genero: "Simulacion",
    plataforma: "PC/Xbox",
    añoLanzamiento: 2020,
    desarrollador: "Asobo Studio",
    descripcion: "Vuela por todo el mundo con simulación de física y clima realista.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762187736/fligth_imf5tx.jpg",
    esGlobal: true
  },
  {
    titulo: "Stardew Valley",
    genero: "Simulacion",
    plataforma: "PC/PS/Switch",
    añoLanzamiento: 2016,
    desarrollador: "ConcernedApe",
    descripcion: "Vive la vida en una granja y construye relaciones con los aldeanos.",
    imagenPortada: "https://res.cloudinary.com/dkjay6i5f/image/upload/v1762187408/Logo_of_Stardew_Valley_jx344f.png",
    esGlobal: true
  }
];

const seed = async () => {
  try {
    await Game.deleteMany({});
    await Game.insertMany(games);
    console.log("✅ Seed completado con 21 juegos globales");
    process.exit();
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  }
};

seed();
