import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";

const LoginButton: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Firestoreにユーザー情報を保存 (mergeオプションを使用)
        await setDoc(
          doc(db, "users", user.uid),
          {
            id: user.uid,
            name: user.displayName || "Anonymous",
            email: user.email || "No Email",
            photoURL: user.photoURL || "",
          },
          { merge: true } // 既存データを維持しつつ新しいデータを追加
        );
        console.log("User data saved to Firestore:", user.uid);
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return (
    <button onClick={handleLogin}>
      <Image
        src="image/login.svg"
        alt="google"
        width={200}
        height={40}
        className="rounded-full"
      ></Image>
    </button>
  );
};

export default LoginButton;
