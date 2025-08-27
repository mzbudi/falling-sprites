import { useState } from "react";

export default function ScoreSubmitSuccessModal({
  onAccept,
}: {
  onAccept: (param: boolean) => void;
}) {
  const [show, setShow] = useState(true);

  const handleClick = () => {
    setShow(false);
    onAccept(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        className="rounded-3xl p-8 max-w-md text-center shadow-2xl border-4"
        style={{
          backgroundColor: "#fff",
          fontFamily: '"Anton", sans-serif',
          borderColor: "#56FCCA",
        }}
      >
        <h2 className="text-3xl font-bold italic text-black mb-4 tracking-widest">
          🎮 Score Submited!
        </h2>
        <ul className="text-gray-800 text-left text-lg italic font-medium space-y-3 mb-6">
          <li>• Your score has been submitted successfully.</li>
        </ul>
        <button
          onClick={() => handleClick()}
          className="text-black italic text-xl font-bold px-6 py-3 rounded-xl transition duration-200"
          style={{
            backgroundColor: "#56FCCA",
          }}
        >
          GOT IT ✅
        </button>
      </div>
    </div>
  );
}
