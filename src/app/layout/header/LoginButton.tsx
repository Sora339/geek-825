import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { doc, setDoc } from "firebase/firestore";

const LoginButton: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Firestoreにユーザー情報を保存
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          name: user.displayName || "Anonymous",
          email: user.email || "No Email",
          photoURL: user.photoURL || "",
        });
        console.log("User data saved to Firestore:", user.uid);
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return <Button onClick={handleLogin}>ログイン</Button>;
};

export default LoginButton;
