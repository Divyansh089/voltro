import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AppProviders } from "@/providers/AppProviders";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "../../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isStaffRoute = router.pathname.startsWith("/staff");

  return (
    <AppProviders>
      <div className="min-h-screen pt-4">
        {!isStaffRoute && <Navbar />}
        <Component {...pageProps} />
        {!isStaffRoute && <Footer />}
      </div>
    </AppProviders>
  );
}
