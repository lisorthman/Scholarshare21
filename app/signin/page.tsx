import { Suspense } from "react";
import SigninClientSection from "./SigninClientSection";

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninClientSection />
    </Suspense>
  );
}