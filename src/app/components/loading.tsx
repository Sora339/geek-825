import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Loading = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDelite, setIsDlite] = useState(false);

  useEffect(() => {
     setTimeout(() => {
        setIsLoaded(true);
      }, 1500); 
  });

  useEffect(() => {
     setTimeout(() => {
        setIsDlite(true);
      }, 2000); 
  });

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 text-white text-2xl z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoaded ? 0 : 1 }}
      transition={{ duration: 1 }} 
      style={{ display: isDelite ? "none" : "grid" }} 
    >
      <div className="flex items-center justify-center h-screen">
      <img className="mr-4" src="/image/stack-of-books.png" alt="" />
      <p>Now Loading...</p>
      </div>  
    </motion.div>
  );
};

export default Loading;
