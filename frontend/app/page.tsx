import { redirect } from "next/navigation";

// The only real screen is /chat. Landing on "/" bounces there.
export default function Home() {
  redirect("/chat");
}
