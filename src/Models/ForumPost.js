import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  contenido: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  categoria: {
    type: String,
    enum: ['General', 'Ayuda', 'Recomendaciones', 'Discusión', 'Noticias', 'Off-Topic'],
    default: 'General'
  },
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  tags: [{ 
    type: String,
    trim: true
  }],
  vistas: { 
    type: Number, 
    default: 0 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  fechaActualizacion: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice para búsquedas
forumPostSchema.index({ titulo: 'text', contenido: 'text' });
forumPostSchema.index({ categoria: 1 });
forumPostSchema.index({ fechaCreacion: -1 });

export default mongoose.model("ForumPost", forumPostSchema);