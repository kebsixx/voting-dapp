import React from "react";

export default function CandidateList({
  candidates,
  onVote,
  hasVoted,
  canVote,
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        🗳️ Candidates
      </h2>
      {candidates.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center shadow-xl">
          <p className="text-gray-400 text-lg">
            No candidates yet. Admin can add candidates.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {candidates.map((candidate, idx) => (
            <div
              key={candidate.id}
              className="group bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      #{idx + 1}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {candidate.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Total Votes:</span>
                    <span className="text-2xl font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {candidate.voteCount.toString()}
                    </span>
                  </div>
                </div>
                <button
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  onClick={() => onVote(candidate.id)}
                  disabled={!canVote || hasVoted}>
                  {hasVoted ? "✓ Voted" : "Vote Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
