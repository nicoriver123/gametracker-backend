import mongoose from "mongoose";

const forumCommentSchema = new mongoose.Schema({
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ForumPost", 
    required: true 
  },
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  contenido: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumComment",
    default: null
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  }],
  isEdited: {
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

forumCommentSchema.index({ postId: 1, fechaCreacion: 1 });

export default mongoose.model("ForumComment", forumCommentSchema);