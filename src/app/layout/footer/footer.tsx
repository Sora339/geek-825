import { Kaisei_Decol } from "next/font/google";

const Kaisei = Kaisei_Decol({
  weight: "400",
  subsets: ["latin"],
});

const Footer = () => {
  return (
    <div className={Kaisei.className}>
      <div className="bg-[#252525] h-[80px]">
        <footer className="flex size-full items-center justify-center">
          <p className="text-sm text-white">
            ©2024 created by マクレイ図書館職員
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
