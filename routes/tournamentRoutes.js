const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeOwner, authorizeStudent } = require("../middleware/authorizationMiddleware");

router.use(authMiddleware);

// CRUD
router.post("/", authorizeOwner, tournamentController.createTournament);
router.get("/", tournamentController.getAllTournaments);
router.get("/:id", tournamentController.getTournamentById);
router.put("/:id", authorizeOwner, tournamentController.updateTournament);
router.delete("/:id", authorizeOwner, tournamentController.deleteTournament);

// Student actions
router.post("/:id/register", authorizeStudent, tournamentController.registerStudent);
router.get("/student/:studentId", authorizeStudent, tournamentController.getTournamentsByStudent);

// Matches
router.post("/:id/matches", authorizeOwner, tournamentController.addMatch);
router.put("/:id/matches/:matchId", authorizeOwner, tournamentController.updateMatch);

router.post("/:id/generate-bracket", tournamentController.generateBracket);
router.put("/:id/matches/:matchId/schedule", tournamentController.scheduleMatch);
router.put("/:id/matches/:matchId/result", tournamentController.updateResult);


module.exports = router;
