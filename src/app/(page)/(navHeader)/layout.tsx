import Footer from "@/app/layout/footer/footer";
import Header from "@/app/layout/header/header";

interface PageProps {
  children: React.ReactNode;
}

export default function Page({ children }: PageProps) {
  return (
    <main>
      <Header />
      {children}
      <Footer />
    </main>
  );
}

