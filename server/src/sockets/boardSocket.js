// In-memory room state. Resets when the server restarts.
const rooms = {};

const broadcastRoomState = (io, roomId) => {
  const room = rooms[roomId];
  if (!room) return;

  // Map participants ensuring each has correct data - create a deep copy to prevent mutations
  const participants = Object.entries(room.participants).map(
    ([id, participant]) => {
      // Create a copy of participant data to prevent any mutations
      const participantCopy = {
        name: String(participant.name || ''),
        role: String(participant.role || ''),
        canDraw: Boolean(participant.canDraw !== undefined ? participant.canDraw : true),
      };
      
      // Ensure we're using the exact data from the participant object
      const participantData = {
        id: String(id), // Ensure ID is string
        name: participantCopy.name, // Use copied name
        role: participantCopy.role, // Use copied role
        canDraw: participantCopy.canDraw, // Use copied canDraw
        isOwner: room.owner === id,
      };
      
      return participantData;
    }
  );

  console.log(`Broadcasting room state for ${roomId}:`, participants.map(p => `${p.name} (${p.id}): canDraw=${p.canDraw}, owner=${p.isOwner}`));
  console.log(`Room participants in memory:`, Object.entries(room.participants).map(([id, p]) => `${p.name} (${id})`));
  io.to(roomId).emit("room-state", { roomId, owner: room.owner, participants });
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create-room", ({ roomId, name, role }) => {
      // Ensure name and role are strings
      const ownerName = String(name || '');
      const ownerRole = String(role || '');
      
      // Create room with owner data - this data should NEVER be overwritten
      rooms[roomId] = {
        owner: socket.id,
        participants: {
          [socket.id]: { 
            name: ownerName,  // Owner's name - immutable
            role: ownerRole,  // Owner's role - immutable
            canDraw: true     // Owner can always draw
          },
        },
      };

      socket.join(roomId);
      console.log(`Room ${roomId} created by ${socket.id} (${ownerName}, ${ownerRole})`);
      console.log(`Room participants after creation:`, Object.entries(rooms[roomId].participants).map(([id, p]) => `${p.name} (${id})`));
      broadcastRoomState(io, roomId);
    });

    socket.on("join-room", ({ roomId, name, role }) => {
      const room = rooms[roomId];
      if (!room) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      socket.join(roomId);
      
      // CRITICAL: Never allow overwriting owner's data
      // If this socket.id is the owner, preserve their original data completely
      if (room.owner === socket.id) {
        const ownerParticipant = room.participants[room.owner];
        if (ownerParticipant) {
          // Owner is already in room - NEVER update their data, just broadcast current state
          console.log(`Owner ${socket.id} (${ownerParticipant.name}) already in room ${roomId}, preserving original data`);
          broadcastRoomState(io, roomId);
          return;
        }
      }
      
      // Check if this socket.id already exists in the room (non-owner)
      const existingParticipant = room.participants[socket.id];
      
      if (existingParticipant) {
        // User already in room - DO NOT update ANYTHING, just preserve everything as-is
        // This prevents overwriting participant data when someone reconnects or joins again
        console.log(`User ${socket.id} already in room ${roomId}, preserving all data (name: ${existingParticipant.name}, role: ${existingParticipant.role}, canDraw: ${existingParticipant.canDraw})`);
        broadcastRoomState(io, roomId);
        return;
      }
      
      // New user joining - always start with canDraw: true
      // Use the exact name and role provided - don't try to match by name
      room.participants[socket.id] = { 
        name: String(name || ''),  // Ensure it's a string, never undefined
        role: String(role || ''),  // Ensure it's a string, never undefined
        canDraw: true  // Always true for new users
      };
      
      console.log(`New user ${socket.id} (${name}, ${role}) joined room ${roomId} with canDraw: true`);
      console.log(`Room ${roomId} participants before broadcast:`, Object.entries(room.participants).map(([id, p]) => `${p.name} (${id})`));
      broadcastRoomState(io, roomId);
    });

    socket.on("leave-room", (roomId) => {
      const room = rooms[roomId];
      if (!room) return;

      socket.leave(roomId);
      delete room.participants[socket.id];

      // If owner leaves, transfer ownership to next participant
      if (room.owner === socket.id) {
        const remaining = Object.keys(room.participants);
        room.owner = remaining[0] || null;
      }

      // Cleanup empty room
      if (!room.owner || Object.keys(room.participants).length === 0) {
        delete rooms[roomId];
        return;
      }

      broadcastRoomState(io, roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on("toggle-draw-permission", ({ roomId, targetId, canDraw }) => {
      const room = rooms[roomId];
      if (!room) {
        console.log("Toggle failed: room not found", roomId);
        return;
      }
      if (room.owner !== socket.id) {
        console.log("Toggle failed: not owner", { owner: room.owner, requester: socket.id });
        return;
      }
      if (!room.participants[targetId]) {
        console.log("Toggle failed: participant not found", { targetId, participants: Object.keys(room.participants) });
        return;
      }

      const oldValue = room.participants[targetId].canDraw;
      room.participants[targetId].canDraw = Boolean(canDraw); // Ensure boolean
      console.log(`Draw permission changed for ${targetId} (${room.participants[targetId].name}) in room ${roomId}: ${oldValue} -> ${room.participants[targetId].canDraw}`);
      broadcastRoomState(io, roomId);
    });

    socket.on("draw", ({ roomId, ...data }) => {
      const room = rooms[roomId];
      if (!room) return;

      const participant = room.participants[socket.id];
      if (!participant || !participant.canDraw) return;

      socket.to(roomId).emit("draw", data);
    });

    socket.on("stroke-end", ({ roomId, ...data }) => {
      const room = rooms[roomId];
      if (!room) return;

      const participant = room.participants[socket.id];
      if (!participant || !participant.canDraw) return;

      socket.to(roomId).emit("stroke-end", data);
    });

    socket.on("draw-shape", ({ roomId, ...data }) => {
      const room = rooms[roomId];
      if (!room) return;

      const participant = room.participants[socket.id];
      if (!participant || !participant.canDraw) return;

      socket.to(roomId).emit("draw-shape", data);
    });

    socket.on("clear-board", (roomId) => {
      const room = rooms[roomId];
      if (!room || room.owner !== socket.id) return;

      io.to(roomId).emit("clear-board");
      console.log(`Board cleared in room ${roomId}`);
    });

    socket.on("disconnecting", () => {
      // Remove user from any rooms they were part of
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        const room = rooms[roomId];
        if (!room) continue;
        delete room.participants[socket.id];

        if (room.owner === socket.id) {
          const remaining = Object.keys(room.participants);
          room.owner = remaining[0] || null;
        }

        if (!room.owner || Object.keys(room.participants).length === 0) {
          delete rooms[roomId];
        } else {
          broadcastRoomState(io, roomId);
        }
      }
    });
  });
};
