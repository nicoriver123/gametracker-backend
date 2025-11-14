import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  juegoId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  puntuacion: { type: Number, required: true, min: 1, max: 5 },
  textoResena: { type: String, required: true },
  horasJugadas: { type: Number, default: 0 },
  dificultad: { type: String, enum: ["Fácil", "Normal", "Difícil"], default: "Normal" },
  recomendaria: { type: Boolean, default: true },
  esPublica: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});
export default mongoose.model("Review", reviewSchema);
