import React, { useEffect, useRef } from 'react';

interface BattleLogProps {
  battleLog: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ battleLog }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [battleLog]);

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 h-64 flex flex-col">
      <h2 className="text-lg font-bold text-white mb-3">Battle Log</h2>
      <div 
        ref={scrollRef}
        className="bg-gray-900 rounded-lg p-3 flex-1 overflow-y-auto max-h-48"
      >
        {battleLog.length === 0 ? (
          <div className="text-gray-400 text-center mt-8">
            No battle activity yet...
          </div>
        ) : (
          <div className="space-y-1">
            {battleLog.map((message, index) => (
              <div key={index} className="text-sm text-gray-300">
                {message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
