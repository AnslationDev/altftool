export default function HowItWorks() {
  return (
    <div className="mt-16">

      <div className="text-center mb-10">
        <h2 className="subheading mb-2">
          How Our AI Face Analysis Works
        </h2>

        <p className="description max-w-xl mx-auto">
          Our AI analyzes facial features using advanced computer vision and deep learning
          models to estimate age, detect gender, recognize emotions, identify face shape,
          and provide additional insights from your uploaded image.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <Card
          title="Upload Image"
          text="Upload a photo from your device or capture one instantly using your camera."
        />

        <Card
          title="Face Detection"
          text="Our AI automatically detects one or multiple faces present in the image."
        />

        <Card
          title="Facial Landmark Analysis"
          text="The system analyzes key facial landmarks such as eyes, nose, jawline, and mouth."
        />

        <Card
          title="Age & Gender Prediction"
          text="Deep learning models estimate the person's age range and detect gender with confidence scores."
        />

        <Card
          title="Emotion & Face Shape Detection"
          text="AI identifies the dominant facial emotion and determines the overall face shape."
        />

        <Card
          title="Advanced Insights"
          text="Additional insights like celebrity look-alike matching and face quality scoring are generated instantly."
        />

      </div>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="bg-(--card) rounded-xl p-6 shadow hover:-translate-y-1 transition">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-(--muted-foreground) text-sm">{text}</p>
    </div>
  );
}