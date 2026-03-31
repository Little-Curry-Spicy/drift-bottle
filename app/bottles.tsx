import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { DriftBottleScreen } from "../src/features/drift-bottle/screens/DriftBottleScreen";

export default function BottlesPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return <DriftBottleScreen />;
}
