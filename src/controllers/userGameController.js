
import UserGame from "../Models/UserGame.js";

export const addToLibrary = async (req, res) => {
  try {
    const usuarioId = req.user._id;
    const { juegoId } = req.body;

    // evitar duplicados
    const exists = await UserGame.findOne({ usuarioId, juegoId });
    if (exists) return res.status(400).json({ message: "Juego ya en tu biblioteca" });

    const ug = await UserGame.create({ usuarioId, juegoId });
    res.status(201).json(ug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLibrary = async (req, res) => {
  try {
    const usuarioId = req.user._id;
    const items = await UserGame.find({ usuarioId }).populate("juegoId");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserGame = async (req, res) => {
  try {
    const updated = await UserGame.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeFromLibrary = async (req, res) => {
  try {
    await UserGame.findByIdAndDelete(req.params.id);
    res.json({ message: "Eliminado de tu biblioteca" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
