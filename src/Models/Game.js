import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  genero: { type: String, required: true },
  plataforma: { type: String, required: true },
  añoLanzamiento: { type: Number },
  desarrollador: { type: String },
  imagenPortada: { type: String },
  cloudinaryPublicId: { type: String, default: null },
  descripcion: { type: String },
  esGlobal: { type: Boolean, default: false },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  ratingPromedio: { type: Number, default: 0 },
  fechaCreacion: { type: Date, default: Date.now }
});

export default mongoose.model("Game", gameSchema);
