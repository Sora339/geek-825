"use client"
import { signOut as signOutFirebase } from "firebase/auth";

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase/client";

const LogOutButton = () => {

    const logOut = async () => {
        //firebaseからのログアウト
        await signOutFirebase(auth)

    }

    return (
        <Button onClick={logOut} className="w-full">ログアウト</Button>
    )
}

export default LogOutButton