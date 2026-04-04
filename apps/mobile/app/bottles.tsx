import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { DriftBottleScreen } from "../src/drift-bottle";

export default function BottlesPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return <DriftBottleScreen />;
}
