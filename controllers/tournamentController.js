const Tournament = require("../models/tournament");

// ➕ Create Tournament
exports.createTournament = async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📋 Get all tournaments (with filters)
exports.
getAllTournaments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.sport) filter.sport = req.query.sport;

    const tournaments = await Tournament.find(filter).sort({ startDate: 1 });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get by ID
exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update
exports.updateTournament = async (req, res) => {
  try {
    const updated = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Tournament not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ Delete
exports.deleteTournament = async (req, res) => {
  try {
    const deleted = await Tournament.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Tournament not found" });
    res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📝 Register student with full details
exports.registerStudent = async (req, res) => {
  try {
    const {
      studentId,
      fullName,
      email,
      phone,
      dob,
      emergencyContactName,
      emergencyContactPhone,
      teamName,
      format
    } = req.body;

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    // Validate format
    if (!["solo", "duo", "team"].includes(format)) {
      return res.status(400).json({ message: "Invalid format" });
    }

    // Check if student is already registered
    const already = tournament.registrations.find(
      (r) => r.student === studentId
    );
    if (already)
      return res.status(400).json({ message: "Already registered" });

    // Check max participants
    if (
      tournament.maxParticipants &&
      tournament.registrations.length >= tournament.maxParticipants
    ) {
      return res.status(400).json({ message: "Tournament is full" });
    }

    // Check teamName if format requires it
    if ((format === "duo" || format === "team") && !teamName) {
      return res
        .status(400)
        .json({ message: "Team name is required for duo or team tournaments" });
    }

    // Push registration
    tournament.registrations.push({
      student: studentId,
      fullName,
      email,
      phone,
      dob,
      emergencyContactName,
      emergencyContactPhone,
      teamName: teamName || undefined,
      format,
    });

    await tournament.save();

    res.status(200).json({ message: "Registered successfully", tournament });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 👤 Get tournaments of a student
exports.getTournamentsByStudent = async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      "registrations.student": req.params.studentId,
    });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🏓 Add a match
exports.addMatch = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    tournament.matches.push(req.body);
    await tournament.save();

    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🏆 Update match result
exports.updateMatch = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    const match = tournament.matches.id(req.params.matchId);
    if (!match)
      return res.status(404).json({ message: "Match not found" });

    Object.assign(match, req.body);
    await tournament.save();

    res.status(200).json(tournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// POST /tournaments/:id/generate-bracket
exports.generateBracket = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    if (tournament.matches.length > 0)
      return res.status(400).json({ message: "Bracket already generated" });

    const players = tournament.registrations.map(r =>
      tournament.format === "solo" ? r.student : r.teamName
    );

    if (players.length < 2)
      return res.status(400).json({ message: "Not enough participants" });

    shuffle(players);

    let round = 1;
    let matchNumber = 1;
    let current = players;
    const matches = [];

    while (current.length > 1) {
      const next = [];
      for (let i = 0; i < current.length; i += 2) {
        const a = current[i];
        const b = current[i + 1];

        if (!b) {
          // bye
          next.push(a);
        } else {
          matches.push({
            round,
            matchNumber: matchNumber++,
            playerA: a,
            playerB: b,
          });
          next.push(null); // placeholder
        }
      }
      current = next;
      round++;
    }

    tournament.matches = matches;
    await tournament.save();

    res.json({ message: "Bracket generated", matches });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /tournaments/:id/matches/:matchId/schedule
exports.scheduleMatch = async (req, res) => {
  try {
    const { scheduledAt, court } = req.body;

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    const match = tournament.matches.id(req.params.matchId);
    if (!match)
      return res.status(404).json({ message: "Match not found" });

    match.scheduledAt = scheduledAt;
    match.court = court;

    await tournament.save();
    res.json({ message: "Match scheduled", match });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /tournaments/:id/matches/:matchId/result
exports.updateResult = async (req, res) => {
  try {
    const { scoreA, scoreB, winner } = req.body;

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    const match = tournament.matches.id(req.params.matchId);
    if (!match)
      return res.status(404).json({ message: "Match not found" });

    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.winner = winner;
    match.status = "completed";

    // 🔁 Advance to next round
    const nextRound = match.round + 1;
    const indexInRound =
      tournament.matches.filter(m => m.round === match.round)
        .findIndex(m => m._id.equals(match._id));

    const nextMatchIndex = Math.floor(indexInRound / 2);
    const nextMatch = tournament.matches.find(
      m => m.round === nextRound && m.matchNumber === nextMatchIndex + 1
    );

    if (nextMatch) {
      if (!nextMatch.playerA) nextMatch.playerA = winner;
      else nextMatch.playerB = winner;
    }

    await tournament.save();
    res.json({ message: "Result updated", tournament });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

