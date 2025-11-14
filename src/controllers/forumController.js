import ForumPost from "../Models/ForumPost.js";
import ForumComment from "../Models/ForumComment.js";

// ============================================
// POSTS DEL FORO
// ============================================

// Obtener todos los posts (público)
export const getAllPosts = async (req, res) => {
  try {
    const { categoria, busqueda, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (categoria) filter.categoria = categoria;
    if (busqueda) {
      filter.$or = [
        { titulo: { $regex: busqueda, $options: 'i' } },
        { contenido: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const posts = await ForumPost.find(filter)
      .populate('usuarioId', 'username avatar')
      .sort({ isPinned: -1, fechaCreacion: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Contar comentarios por post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await ForumComment.countDocuments({ postId: post._id });
        return {
          ...post.toObject(),
          commentCount
        };
      })
    );

    const total = await ForumPost.countDocuments(filter);

    res.json({
      success: true,
      posts: postsWithComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error al obtener posts:", error);
    res.status(500).json({ message: "Error al obtener posts" });
  }
};

// Obtener un post específico (público)
export const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('usuarioId', 'username avatar fechaRegistro');

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    // Incrementar vistas
    post.vistas += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error("Error al obtener post:", error);
    res.status(500).json({ message: "Error al obtener post" });
  }
};

// Crear post (protegido)
export const createPost = async (req, res) => {
  try {
    const { titulo, contenido, categoria, tags } = req.body;

    if (!titulo || !contenido) {
      return res.status(400).json({ 
        message: "Título y contenido son requeridos" 
      });
    }

    const post = await ForumPost.create({
      titulo,
      contenido,
      categoria: categoria || 'General',
      tags: tags || [],
      usuarioId: req.user._id
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('usuarioId', 'username avatar');

    res.status(201).json({
      success: true,
      message: "Post creado exitosamente",
      post: populatedPost
    });
  } catch (error) {
    console.error("Error al crear post:", error);
    res.status(500).json({ message: "Error al crear post" });
  }
};

// Actualizar post (protegido - solo autor)
export const updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    // Verificar que el usuario es el autor
    if (post.usuarioId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para editar este post" 
      });
    }

    const { titulo, contenido, categoria, tags } = req.body;

    post.titulo = titulo || post.titulo;
    post.contenido = contenido || post.contenido;
    post.categoria = categoria || post.categoria;
    post.tags = tags || post.tags;
    post.fechaActualizacion = Date.now();

    await post.save();

    res.json({
      success: true,
      message: "Post actualizado exitosamente",
      post
    });
  } catch (error) {
    console.error("Error al actualizar post:", error);
    res.status(500).json({ message: "Error al actualizar post" });
  }
};

// Eliminar post (protegido - solo autor)
export const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    if (post.usuarioId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para eliminar este post" 
      });
    }

    // Eliminar comentarios asociados
    await ForumComment.deleteMany({ postId: post._id });

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Post eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar post:", error);
    res.status(500).json({ message: "Error al eliminar post" });
  }
};

// Like/Unlike post (protegido)
export const toggleLikePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    const userIndex = post.likes.indexOf(req.user._id);

    if (userIndex > -1) {
      // Ya tiene like, removerlo
      post.likes.splice(userIndex, 1);
    } else {
      // Agregar like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes.length,
      hasLiked: userIndex === -1
    });
  } catch (error) {
    console.error("Error al dar like:", error);
    res.status(500).json({ message: "Error al dar like" });
  }
};

// ============================================
// COMENTARIOS
// ============================================

// Obtener comentarios de un post (público)
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await ForumComment.find({ postId, parentCommentId: null })
      .populate('usuarioId', 'username avatar')
      .sort({ fechaCreacion: 1 });

    // Obtener respuestas para cada comentario
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await ForumComment.find({ parentCommentId: comment._id })
          .populate('usuarioId', 'username avatar')
          .sort({ fechaCreacion: 1 });
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.json({
      success: true,
      comments: commentsWithReplies
    });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ message: "Error al obtener comentarios" });
  }
};

// Crear comentario (protegido)
export const createComment = async (req, res) => {
  try {
    const { postId, contenido, parentCommentId } = req.body;

    if (!contenido) {
      return res.status(400).json({ message: "El contenido es requerido" });
    }

    // Verificar que el post existe
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    if (post.isClosed) {
      return res.status(403).json({ 
        message: "Este post está cerrado para comentarios" 
      });
    }

    const comment = await ForumComment.create({
      postId,
      usuarioId: req.user._id,
      contenido,
      parentCommentId: parentCommentId || null
    });

    const populatedComment = await ForumComment.findById(comment._id)
      .populate('usuarioId', 'username avatar');

    res.status(201).json({
      success: true,
      message: "Comentario creado exitosamente",
      comment: populatedComment
    });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ message: "Error al crear comentario" });
  }
};

// Actualizar comentario (protegido - solo autor)
export const updateComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (comment.usuarioId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para editar este comentario" 
      });
    }

    const { contenido } = req.body;

    comment.contenido = contenido;
    comment.isEdited = true;
    comment.fechaActualizacion = Date.now();

    await comment.save();

    res.json({
      success: true,
      message: "Comentario actualizado exitosamente",
      comment
    });
  } catch (error) {
    console.error("Error al actualizar comentario:", error);
    res.status(500).json({ message: "Error al actualizar comentario" });
  }
};

// Eliminar comentario (protegido - solo autor)
export const deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (comment.usuarioId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para eliminar este comentario" 
      });
    }

    // Eliminar respuestas si las hay
    await ForumComment.deleteMany({ parentCommentId: comment._id });

    await ForumComment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Comentario eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({ message: "Error al eliminar comentario" });
  }
};

// Like/Unlike comentario (protegido)
export const toggleLikeComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    const userIndex = comment.likes.indexOf(req.user._id);

    if (userIndex > -1) {
      comment.likes.splice(userIndex, 1);
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.json({
      success: true,
      likes: comment.likes.length,
      hasLiked: userIndex === -1
    });
  } catch (error) {
    console.error("Error al dar like:", error);
    res.status(500).json({ message: "Error al dar like" });
  }
};