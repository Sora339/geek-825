import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next"

import StartBtn from "@/app/components/myPage/BtnGroup";
import Profile from "@/app/components/myPage/profile/profile";
import UserOverview from "@/app/components/myPage/userOverview";
import Footer from "@/app/layout/footer/footer";
import Header from "@/app/layout/header/header";
import { authOptions } from "@/lib/next-auth/options";

const myPage = async () => {

  const session = await getServerSession(authOptions)

  //ログインしていないときはログインページに戻る
//   if (!session) {
//     redirect("/auth/login")
//   }

  return (
    <div>
      <Header />
      <div className="mx-auto min-h-[calc(100vh-80px-80px)] w-4/5">
          <div className="flex flex-col justify-between lg:flex-row">
            <div className="hidden w-3/12 lg:block lg:pl-[100px]"></div>
            <div className="mx-auto mt-20 size-max lg:fixed lg:w-3/12 lg:pl-[100px]">
              <div className="hidden lg:block">
                <StartBtn />
              </div>
            </div>
            <div className="mt-20 xl:mr-[100px]">
            </div>
          </div>

        <div className="block lg:hidden">
          <StartBtn />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default myPage