import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";


const PersonalForm = ({ personalInfo, setPersonalInfo }) => {
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          value={personalInfo.fullName}
          onChange={(v) => setPersonalInfo({...personalInfo, fullName: v})}
          placeholder="John Doe"
        />

        <InputField
          label="Job Title"
          value={personalInfo.jobTitle}
          onChange={(v) => setPersonalInfo({...personalInfo, jobTitle: v})}
          placeholder="Senior Software Engineer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Email"
          type="email"
          value={personalInfo.email}
          onChange={(v) => setPersonalInfo({...personalInfo, email: v})}
          placeholder="john@example.com"
        />

        <InputField
          label="Phone"
          value={personalInfo.phone}
          onChange={(v) => setPersonalInfo({...personalInfo, phone: v})}
          placeholder="+1 234 567 890"
        />
      </div>

      <InputField
        label="Address"
        value={personalInfo.address}
        onChange={(v) => setPersonalInfo({...personalInfo, address: v})}
        placeholder="New York, NY"
      />

      <div className="grid grid-cols-3 gap-4">
        <InputField
          label="LinkedIn"
          value={personalInfo.linkedin}
          onChange={(v) => setPersonalInfo({...personalInfo, linkedin: v})}
          placeholder="linkedin.com/in/johndoe"
        />

        <InputField
          label="GitHub"
          value={personalInfo.github}
          onChange={(v) => setPersonalInfo({...personalInfo, github: v})}
          placeholder="github.com/johndoe"
        />

        <InputField
          label="Website"
          value={personalInfo.website}
          onChange={(v) => setPersonalInfo({...personalInfo, website: v})}
          placeholder="johndoe.com"
        />
      </div>

      <TextAreaField
        label="Professional Summary"
        value={personalInfo.summary}
        onChange={(v) => setPersonalInfo({...personalInfo, summary: v})}
        placeholder="Experienced software engineer with 5+ years of experience..."
        rows={4}
      />



    </div>
  );
};

export default PersonalForm;
