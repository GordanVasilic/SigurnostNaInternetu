"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { QuestionCard } from "@/components/QuestionCard";
import { Leaderboard } from "@/components/Leaderboard";
import { AVATARS, AvatarOption } from "@/data/avatars";
import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  DEFAULT_ROOM_CODE,
  subscribeToQuizState,
  joinPlayer,
  submitAnswer,
  createInitialState,
} from "@/lib/quizSync";
import { QuizState, Player } from "@/types/quiz";
import { Shield, Sparkles, Users, Lock, ArrowRight, Hourglass, Check, X } from "lucide-react";
import { playStartFanfare } from "@/lib/sounds";

export default function StudentHomePage() {
  const [quizState, setQuizState] = useState<QuizState>(createInitialState());
  const [player, setPlayer] = useState<Player | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(AVATARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  // 1. Subscribe to quiz room state
  useEffect(() => {
    const unsubscribe = subscribeToQuizState(DEFAULT_ROOM_CODE, (state) => {
      setQuizState(state);
    });
    return () => unsubscribe();
  }, []);

  // 2. Restore saved player from localStorage if it belongs to active session
  useEffect(() => {
    const savedPlayer = localStorage.getItem("sergej_quiz_player");
    if (!savedPlayer) return;

    try {
      const parsed: Player = JSON.parse(savedPlayer);

      // Only evaluate resetId when we have received real server state
      if (quizState.updatedAt && quizState.resetId && parsed.resetId) {
        if (quizState.resetId > parsed.resetId) {
          localStorage.removeItem("sergej_quiz_player");
          setPlayer(null);
          return;
        }
      }

      // If quiz finished and is now back in lobby, discard old profile so user re-joins
      const hasFinishedGame = Boolean(parsed.answers && Object.keys(parsed.answers).length > 0);
      if (quizState.status === "lobby" && hasFinishedGame) {
        localStorage.removeItem("sergej_quiz_player");
        setPlayer(null);
        return;
      }

      setPlayer(parsed);
      setName(parsed.name);
      const matchedAvatar = AVATARS.find((a) => a.emoji === parsed.avatar);
      if (matchedAvatar) setSelectedAvatar(matchedAvatar);
    } catch {
      localStorage.removeItem("sergej_quiz_player");
      setPlayer(null);
    }
  }, [quizState.resetId, quizState.status, quizState.updatedAt]);

  // 3. Auto-logout on reset: ONLY when admin resets the quiz (resetId changes or quiz finished -> lobby)
  useEffect(() => {
    if (!player) return;
    if (!quizState.updatedAt) return;

    const currentResetId = quizState.resetId || 1;
    const playerResetId = player.resetId || 1;

    // A) Admin reset the quiz (resetId incremented on server after player joined)
    const isResetByAdmin = currentResetId > playerResetId;

    // B) Player played a finished game and status is back in lobby (admin reset quiz)
    const hasFinishedGame = Boolean(player.answers && Object.keys(player.answers).length > 0);
    const isResetFromFinished = quizState.status === "lobby" && hasFinishedGame;

    if (isResetByAdmin || isResetFromFinished) {
      setPlayer(null);
      setIsEditingProfile(false);
      localStorage.removeItem("sergej_quiz_player");
    }
  }, [quizState.resetId, quizState.status, quizState.updatedAt, player]);

  // 4. Keep local player score/state updated with server state
  useEffect(() => {
    if (player && quizState.players && quizState.players[player.id]) {
      const serverPlayer = quizState.players[player.id];
      setPlayer((prev) => (prev ? { ...prev, ...serverPlayer } : serverPlayer));
    }
  }, [quizState.players, player?.id]);

  // 5. Self-healing heartbeat: re-register player in lobby if missing from server (e.g. server restart)
  useEffect(() => {
    if (
      player &&
      quizState.status === "lobby" &&
      quizState.updatedAt &&
      quizState.players &&
      !quizState.players[player.id] &&
      (!player.answers || Object.keys(player.answers).length === 0)
    ) {
      const currentResetId = quizState.resetId || 1;
      const playerResetId = player.resetId || 1;
      if (playerResetId >= currentResetId) {
        joinPlayer(DEFAULT_ROOM_CODE, player).catch(console.warn);
      }
    }
  }, [quizState.players, quizState.status, quizState.updatedAt, quizState.resetId, player]);

  // 6. Handle countdown animation
  useEffect(() => {
    if (quizState.status === "countdown" && quizState.countdownStartTime) {
      playStartFanfare();
      const interval = setInterval(() => {
        const elapsed = Date.now() - (quizState.countdownStartTime || 0);
        const remaining = Math.max(0, 3 - Math.floor(elapsed / 1000));
        setCountdownNum(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    } else {
      setCountdownNum(null);
    }
  }, [quizState.status, quizState.countdownStartTime]);

  // Join or Update Profile handler (preserves player ID to prevent duplicates!)
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const existingId = player?.id;
    const playerId = existingId || ("p_" + Math.random().toString(36).substring(2, 9));
    const currentSessionResetId = quizState.resetId || 1;

    const profileData: Player = {
      ...(player || {}),
      id: playerId,
      name: name.trim(),
      avatar: selectedAvatar.emoji,
      score: player?.score || 0,
      totalTimeMs: player?.totalTimeMs || 0,
      joinedAt: player?.joinedAt || Date.now(),
      resetId: currentSessionResetId,
      answers: player?.answers || {},
    };

    try {
      const serverState = await joinPlayer(DEFAULT_ROOM_CODE, profileData);
      if (serverState?.resetId) {
        profileData.resetId = serverState.resetId;
      }
      localStorage.setItem("sergej_quiz_player", JSON.stringify(profileData));
      setPlayer(profileData);
      if (serverState) {
        setQuizState(serverState);
      }
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Greška pri prijavi / izmjeni:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditProfile = () => {
    if (player) {
      setName(player.name);
      const matched = AVATARS.find((a) => a.emoji === player.avatar);
      if (matched) setSelectedAvatar(matched);
    }
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    if (player) {
      setName(player.name);
      const matched = AVATARS.find((a) => a.emoji === player.avatar);
      if (matched) setSelectedAvatar(matched);
    }
    setIsEditingProfile(false);
  };

  // Submit question answer
  const handleAnswerQuestion = async (selectedIndex: number, timeTakenMs: number) => {
    if (!player) return;
    try {
      await submitAnswer(
        DEFAULT_ROOM_CODE,
        player.id,
        quizState.currentQuestionIndex,
        selectedIndex,
        timeTakenMs
      );
    } catch (err) {
      console.error("Greška pri slanju odgovora:", err);
    }
  };

  // Determine current question player answer status
  const currentAnswer = player?.answers?.[quizState.currentQuestionIndex];
  const hasAnsweredCurrent = Boolean(currentAnswer);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* ================= STATE 1: JOIN FORM OR EDIT PROFILE ================= */}
        {((!player && quizState.status !== "finished") || (player && isEditingProfile && quizState.status === "lobby")) && (
          <div className="w-full max-w-md mx-auto my-auto py-2 sm:py-6">
            {/* Header / Hero */}
            <div className="text-center mb-5 sm:mb-7">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-800/50 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2.5 sm:mb-3">
                <Shield className="w-4 h-4" />
                {player ? "Uredi profil" : "Sajber Bezbjednost • Edukativni Kviz"}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {player ? "Izmijeni profil" : "Sigurnost na Internetu"}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 font-medium">
                {player
                  ? "Izmijeni ime ili avatar prije nego što kviz počne"
                  : "Interaktivni izazov znanja • Pripremi se i testiraj svoje vještine!"}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleSubmitProfile} className="flex flex-col gap-5">
                {/* Avatar Picker */}
                <AvatarPicker
                  selectedAvatarId={selectedAvatar.id}
                  onSelectAvatar={(av) => setSelectedAvatar(av)}
                />

                {/* Name Input */}
                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Tvoje ime ili nadimak:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="npr. Marko, Ana P., Nikola..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg sm:text-xl font-bold"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xl sm:text-2xl shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <span>
                      {isSubmitting
                        ? "Snimanje..."
                        : player
                        ? "Sačuvaj izmjene"
                        : "Pridruži se kvizu"}
                    </span>
                    {player ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <ArrowRight className="w-6 h-6 stroke-[3]" />
                    )}
                  </button>

                  {player && (
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-base transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      <span>Odustani</span>
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-sm text-slate-300 font-medium">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>14 pitanja • 20 sekundi po pitanju</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATE 2: WAITING IN LOBBY ================= */}
        {player && !isEditingProfile && quizState.status === "lobby" && (
          <div className="w-full max-w-lg mx-auto text-center py-8 px-4">
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl ring-4 ring-cyan-400/40 animate-pulse">
                {player.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-2 rounded-full shadow">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Dobrodošao/la, <span className="text-cyan-400">{player.name}</span>!
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-2 font-medium max-w-sm mx-auto">
              Uspješno si prijavljen/a. Čekamo Sergeja da označi početak kviza sa projektora!
            </p>

            {/* Waiting indicator */}
            <div className="my-6 inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-slate-800/90 border border-slate-700 text-cyan-300 font-bold text-base sm:text-lg animate-pulse shadow-lg">
              <Hourglass className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Čekamo početak kviza...</span>
            </div>

            {/* Change Avatar / Name Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleStartEditProfile}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border border-slate-700 text-sm sm:text-base font-bold transition-all active:scale-95 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Promijeni ime ili avatar</span>
              </button>
            </div>

            {/* Classmates connected */}
            <div className="mt-4 p-5 bg-slate-900/80 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Prijavljeni drugari ({Object.keys(quizState.players || {}).length})</span>
                </div>
                <span className="text-emerald-400">Spremni za igru</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-1">
                {Object.values(quizState.players || {}).map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      p.id === player.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 ring-2 ring-cyan-400/30 font-black"
                        : "bg-slate-800 text-slate-200 border border-slate-700/60"
                    }`}
                  >
                    <span className="text-base">{p.avatar}</span>
                    <span className="truncate max-w-[120px]">
                      {p.name}
                      {p.id === player.id ? " (Ti)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STATE 3: 3..2..1 COUNTDOWN ================= */}
        {quizState.status === "countdown" && (
          <div className="flex flex-col items-center justify-center text-center py-16 animate-in zoom-in-75 duration-300">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">
              Kviz počinje za
            </span>
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-7xl font-black text-white shadow-2xl ring-8 ring-cyan-400/30 animate-bounce">
              {countdownNum ?? 3}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-6">Spremite se! 🚀</h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium mt-2">20 sekundi po pitanju • Srećno svima!</p>
          </div>
        )}

        {/* ================= STATE 4: LIVE QUESTION ================= */}
        {quizState.status === "question" && (
          <QuestionCard
            key={quizState.currentQuestionIndex}
            question={QUIZ_QUESTIONS[quizState.currentQuestionIndex]}
            questionIndex={quizState.currentQuestionIndex}
            totalQuestions={QUIZ_QUESTIONS.length}
            questionStartTime={quizState.questionStartTime}
            durationSeconds={quizState.durationSeconds || 20}
            hasAnswered={hasAnsweredCurrent}
            selectedOptionIndex={currentAnswer?.selectedIndex}
            isCorrect={currentAnswer?.isCorrect}
            onSelectOption={handleAnswerQuestion}
          />
        )}

        {/* ================= STATE 5: FINISHED / LEADERBOARD ================= */}
        {quizState.status === "finished" && (
          <Leaderboard players={quizState.players || {}} />
        )}
      </main>
    </div>
  );
}
