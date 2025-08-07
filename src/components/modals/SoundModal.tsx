import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";

export default function SoundModal({ onAccept }: { onAccept: () => void }) {
  const [show, setShow] = useState(true);

  const handleClick = () => {
    setShow(false);
    useGameStore.getState().setBgmState(true); // Set BGM state to true
    onAccept(); // aktifkan sound di sini
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm text-center shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-black">
          🔊 Enable Sound?
        </h2>
        <p className="text-gray-700 mb-6">
          Tap the button below to enable game sounds.
        </p>
        <button
          onClick={handleClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Enable Sound
        </button>
      </div>
    </div>
  );
}
