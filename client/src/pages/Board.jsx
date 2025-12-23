import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import Whiteboard from "../components/Whiteboard";

const generateRoomId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export default function Board() {
  const navigate = useNavigate();

  const initialName =
    sessionStorage.getItem("userName") || localStorage.getItem("name") || "";
  const initialRole =
    sessionStorage.getItem("userRole") || localStorage.getItem("role") || "";

  const userNameRef = useRef(initialName);
  const userRoleRef = useRef(initialRole);

  const [userName, setUserName] = useState(userNameRef.current);
  const [userRole, setUserRole] = useState(userRoleRef.current);

  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState("");
  const [myId, setMyId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const me = useMemo(() => {
    if (!myId) return null;
    return participants.find((p) => p.id === myId);
  }, [participants, myId]);

  const canDraw = useMemo(() => {
    if (!joined) return false;
    if (isOwner) return true;
    if (me) return me.canDraw !== false;
    return false;
  }, [joined, isOwner, me]);

  useEffect(() => {
    const storedName =
      sessionStorage.getItem("userName") || localStorage.getItem("name");
    const storedRole =
      sessionStorage.getItem("userRole") || localStorage.getItem("role");

    if (!localStorage.getItem("token") || !storedName || !storedRole) {
      navigate("/");
      return;
    }

    userNameRef.current = storedName;
    userRoleRef.current = storedRole;
    setUserName(storedName);
    setUserRole(storedRole);

    sessionStorage.setItem("userName", storedName);
    sessionStorage.setItem("userRole", storedRole);

    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      setMyId(socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("room-state", ({ roomId, owner, participants }) => {
      setRoomId(roomId);
      setParticipants(participants);
      setIsOwner(owner === socket.id);
      setJoined(true);
      setIsCreating(false);
      sessionStorage.setItem("currentRoomId", roomId);
    });

    socket.on("room-error", ({ message }) => {
      setError(message);
      sessionStorage.removeItem("currentRoomId");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room-state");
      socket.off("room-error");
    };
  }, [navigate]);

  const createRoom = () => {
    const id = generateRoomId();
    setRoomId(id);
    setIsCreating(true);
    socket.emit("create-room", {
      roomId: id,
      name: userNameRef.current,
      role: userRoleRef.current,
    });
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    socket.emit("join-room", {
      roomId: roomId.trim(),
      name: userNameRef.current,
      role: userRoleRef.current,
    });
  };

  const leaveRoom = () => {
    socket.emit("leave-room", roomId);
    setJoined(false);
    setRoomId("");
    setParticipants([]);
    setIsOwner(false);
    sessionStorage.removeItem("currentRoomId");
  };

  const clearBoard = () => {
    if (isOwner && window.confirm("Clear board?")) {
      socket.emit("clear-board", roomId);
    }
  };

  const logout = () => {
    socket.emit("leave-room", roomId);
    localStorage.clear();
    sessionStorage.clear();
    socket.disconnect();
    navigate("/");
  };

  const togglePermission = (targetId, canDraw) => {
    socket.emit("toggle-draw-permission", {
      roomId,
      targetId,
      canDraw,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Whiteboard
            </h1>
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 font-bold text-sm">
              {userRole === "teacher" ? "👨‍🏫 Teacher" : "👨‍🎓 Student"}
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"
                }`}
              />
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-medium text-gray-700">
              Welcome, {userName}
            </span>
            <button
              onClick={logout}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!joined ? (
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] space-y-10">
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
              Create or Join a Room
            </h2>

            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 px-6 py-4 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <button
                onClick={createRoom}
                className="py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition"
              >
                Create Room
              </button>

              <div className="space-y-4">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="ROOM ID"
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={joinRoom}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition"
                >
                  Join Room
                </button>
              </div>
            </div>

            {isCreating && (
              <p className="text-center text-gray-600 animate-pulse">
                Creating room…
              </p>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Participants */}
            <aside className="lg:col-span-1 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="font-bold text-gray-900">
                Participants ({participants.length})
              </h3>

              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center px-4 py-3 rounded-xl bg-white border shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.role}</p>
                  </div>

                  {isOwner && p.id !== myId && (
                    <button
                      onClick={() =>
                        togglePermission(p.id, !p.canDraw)
                      }
                      className={`px-3 py-2 rounded-xl text-sm font-medium ${
                        p.canDraw
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.canDraw ? "Disable" : "Enable"}
                    </button>
                  )}
                </div>
              ))}
            </aside>

            {/* Board */}
            <section className="lg:col-span-3 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.18)]">
              <div className="flex justify-between mb-4">
                <span className="font-bold text-indigo-600">
                  Room ID: {roomId}
                </span>
                <div className="flex gap-3">
                  {isOwner && (
                    <button
                      onClick={clearBoard}
                      className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={leaveRoom}
                    className="px-4 py-2 rounded-xl bg-gray-200 font-semibold"
                  >
                    Leave
                  </button>
                </div>
              </div>

              <Whiteboard
                roomId={roomId}
                name={userName}
                canDraw={canDraw}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
