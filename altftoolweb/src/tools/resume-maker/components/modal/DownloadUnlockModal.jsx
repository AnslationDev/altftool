const DownloadUnlockModal = ({
  onClose,
  onContinue,
}) => {

  return (

    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

      {/* MODAL */}

      <div
        className="
          w-full
          max-w-sm
          rounded-2xl
          border
          border-(--border)
          bg-(--card)
          shadow-2xl
          p-5
          sm:p-6
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >

        {/* ICON */}

        <div className="text-center">

          <div className="text-3xl mb-2">
            🎉
          </div>

          {/* TITLE */}

          <h2 className="text-xl font-bold text-(--foreground)">
            Your Resume is Ready!
          </h2>

          {/* SUBTEXT */}

          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Your resume is optimized and ready for download.
          </p>

        </div>


        {/* ACTION BUTTONS */}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          {/* CONTINUE DOWNLOAD */}

          <button
            onClick={onContinue}
            className="
              flex-1
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
              py-2.5
              text-sm
              font-medium
              transition-all
              shadow-sm
            "
          >
            Continue Download
          </button>


          {/* CANCEL BUTTON */}

          <button
            onClick={onClose}
            className="
              flex-1
              rounded-xl
              border
              border-(--border)
              bg-(--background)
              hover:bg-(--border)
              text-(--foreground)
              py-2.5
              text-sm
              font-medium
              transition-all
            "
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default DownloadUnlockModal;