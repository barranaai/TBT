import { redirect } from "next/navigation";

// The Atelier design is now the primary homepage at "/".
// Keep this route as a permanent redirect so existing links still work.
export default function AtelierPage() {
  redirect("/");
}
