"use client";

import MainComponent from "../components/Main";
import Description from "../components/Description";

export default function ProfilePictureMaker() {
  return (
    <div>
      <header className="text-center mb-12">
        <h2 className="heading">Profile Picture Maker</h2>

        <p className="text-center description">
          Create stunning profile pictures easily with custom styles
        </p>
      </header>
      <MainComponent />
      <Description />
    </div>
  );
}
