import { useState } from "react";
import { UserDetailsForm } from "@/components/assessment/UserDetailsForm";
import { UserDetails } from "@/types/assessment";

export default function AssessmentTest() {
  const [data, setData] = useState<UserDetails>({
    name: "",
    email: "",
    age: "",
    gender: "",
  });

  const handleNext = () => {
    alert("Button clicked!");
    console.log("Form data:", data);
  };

  return (
    <div>
      <UserDetailsForm data={data} onChange={setData} />
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
