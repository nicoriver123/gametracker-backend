
import mongoose from "mongoose";

const userGameSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  juegoId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  horasJugadas: { type: Number, default: 0 },
  estado: { type: String, enum: ["Pendiente", "En progreso", "Completado"], default: "Pendiente" },
  calificacionPersonal: { type: Number, min: 0, max: 5 },
  fechaAgregado: { type: Date, default: Date.now }
});

export default mongoose.model("UserGame", userGameSchema);
