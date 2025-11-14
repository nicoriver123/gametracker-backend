import Game from "../Models/Game.js";
import Review from "../Models/Review.js";
import UserGame from "../Models/UserGame.js";
import { uploadImage, deleteImage } from "../services/cloudinaryService.js";

// Obtener todos los juegos
export const getGames = async (req, res) => {
  try {
    const { esGlobal } = req.query;
    const filter = {};
    if (esGlobal === "true") filter.esGlobal = true;
    if (esGlobal === "false") filter.esGlobal = false;

    const games = await Game.find(filter).sort({ fechaCreacion: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un juego por ID
export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Juego no encontrado" });

    const reviews = await Review.find({ juegoId: game._id, esPublica: true })
      .populate("usuarioId", "nombre");
    res.json({ game, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo juego
export const createGame = async (req, res) => {
  try {
    const data = req.body;

    if (req.user) {
      data.usuarioId = req.user._id;
      data.esGlobal = data.esGlobal || false;
    }

    // 📤 Si hay archivo, subirlo a Cloudinary
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'gametracker/juegos');
      
      if (uploadResult.success) {
        data.imagenPortada = uploadResult.url;
        data.cloudinaryPublicId = uploadResult.publicId; // Guardar para futuras eliminaciones
      } else {
        return res.status(400).json({ 
          message: "Error al subir la imagen",
          error: uploadResult.error 
        });
      }
    }

    const game = new Game(data);
    await game.save();
    
    res.status(201).json({
      success: true,
      message: "Juego creado exitosamente",
      game
    });
  } catch (error) {
    console.error("Error al crear juego:", error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un juego
export const updateGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    // Verificar que el usuario es el propietario
    if (game.usuarioId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para editar este juego" 
      });
    }

    const data = req.body;

    // 📤 Si hay nueva imagen, subir y eliminar la antigua
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (game.cloudinaryPublicId) {
        await deleteImage(game.cloudinaryPublicId);
      }

      const uploadResult = await uploadImage(req.file.path, 'gametracker/juegos');
      
      if (uploadResult.success) {
        data.imagenPortada = uploadResult.url;
        data.cloudinaryPublicId = uploadResult.publicId;
      } else {
        return res.status(400).json({ 
          message: "Error al subir la imagen",
          error: uploadResult.error 
        });
      }
    }

    const updated = await Game.findByIdAndUpdate(req.params.id, data, { new: true });
    
    res.json({
      success: true,
      message: "Juego actualizado exitosamente",
      game: updated
    });
  } catch (error) {
    console.error("Error al actualizar juego:", error);
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un juego
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Juego no encontrado" });

    // Verificar que el juego pertenezca al usuario
    if (String(game.usuarioId) !== String(userId)) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este juego" });
    }

    // 🗑️ Eliminar imagen de Cloudinary
    if (game.cloudinaryPublicId) {
      await deleteImage(game.cloudinaryPublicId);
    }

    // Eliminar asociaciones en UserGame
    await UserGame.deleteMany({ juegoId: id });

    // Eliminar el juego
    await Game.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: "Juego personal y su asociación eliminados correctamente" 
    });
  } catch (error) {
    console.error("Error al eliminar juego personal:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener los juegos globales mejor valorados
export const getTopRated = async (req, res) => {
  try {
    const top = await Game.find({ esGlobal: true })
      .sort({ ratingPromedio: -1 })
      .limit(10);
    res.json(top);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


