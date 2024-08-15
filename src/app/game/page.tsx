'use client'
import React, { useEffect, useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_API_KEY;

const WordSortingGame: React.FC = () => {
  const [words, setWords] = useState<string[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);
  const [swapCount, setSwapCount] =useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [score, setScore] = useState<number>(1000); // 初期スコアを1000点とする
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        if (!API_KEY) {
          throw new Error('API_KEY is not defined. Please set REACT_APP_GOOGLE_API_KEY in your .env file.');
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = '24個のランダムな英単語をコンマ区切りで生成してください。辞書順にしないでください。頭文字を大文字にしてください。ピリオドは不要です。英単語のみを回答してください。';
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const generatedWords = await response.text();
        console.log(generatedWords)
        const wordArray = generatedWords.split(',').map(word => word.trim());
        setWords(wordArray);
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };

    fetchWords();
  }, []); // 依存関係の配列を空にして、最初のマウント時のみ実行されるようにする

  // 逆順数を計算する関数
  const calculateInversionCount = (arr: string[]) => {
    let invCount = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) {
          invCount++;
        }
      }
    }
    return invCount;
  };

  useEffect(() => {
    if (words.length > 0) {
      const shuffledWords = [...words].sort(() => 0.5 - Math.random());
      setWords(shuffledWords);
      setStartTime(Date.now());

      // 初期配置の逆順数に応じてペナルティを設定
      const inversionCount = calculateInversionCount(shuffledWords);
      let shufflePenalty = 0;
      if (inversionCount < 10) {
        shufflePenalty = 200; // シャッフルが少ない場合のペナルティ
      } else if (inversionCount < 20) {
        shufflePenalty = 100; // シャッフルがやや少ない場合のペナルティ
      }
      setScore((prevScore) => prevScore - shufflePenalty);
    }
  }, [words.length]); // words の長さが変わったときにのみ実行

  const selectBlock = (index: number) => {
    if (gameEnded) return; // ゲーム終了後は操作不可

    if (selectedBlockIndex === null) {
      setSelectedBlockIndex(index);
    } else {
      const calculatedDistance = Math.abs(selectedBlockIndex - index);
      setDistance(calculatedDistance);

      swapBlocks(selectedBlockIndex, index, calculatedDistance);
      setSelectedBlockIndex(null);
    }
  };

  const swapBlocks = (index1: number, index2: number, calculatedDistance: number) => {
    const newWords = [...words];
    [newWords[index1], newWords[index2]] = [newWords[index2], newWords[index1]];
    setWords(newWords);

    // 距離に基づくペナルティを計算
    let penalty = 0;
    if (calculatedDistance >= 3 && calculatedDistance <= 5) {
        penalty = 5;
    } else if (calculatedDistance >= 6 && calculatedDistance <= 10) {
        penalty = 10;
    } else if (calculatedDistance >= 11) {
        penalty = 20;
    }
    setScore((prevScore) => prevScore - penalty); // スコアからペナルティを引く

    setSwapCount((prevCount) => prevCount + 1); // Swap count をインクリメント
    checkWinCondition(newWords);
  };

  const checkWinCondition = (currentWords: string[]) => {
    const sortedWords = [...currentWords].sort((a, b) => a.localeCompare(b));

    if (JSON.stringify(currentWords) === JSON.stringify(sortedWords)) {
      const endTime = Date.now();
      const totalTime = ((endTime - startTime!) / 1000).toFixed(2);
      setTimeTaken(Number(totalTime));

      // 時間ボーナスの計算
      let timeBonus = 0;
      if (Number(totalTime) <= 60) {
        timeBonus = 500;
      } else if (Number(totalTime) <= 120) {
        timeBonus = 300;
      } else if (Number(totalTime) <= 180) {
        timeBonus = 100;
      }
      setScore((prevScore) => prevScore + timeBonus);

      setGameEnded(true);
    }
  };

  return (
    <div className="h-[100vh] flex flex-col items-center p-5 bg-[url('../../public/image/bg_1.webp')] bg-cover bg-[rgba(255,255,255,0.25)] bg-blend-lighten">
      <h1 className="text-3xl font-bold mb-5">Word Sorting Game</h1>
      <div id="game-container" className="flex flex-wrap justify-center w-[650px]">
        {words.map((word, index) => (
          <div
            key={index}
            className={`w-[60px] py-2 ${selectedBlockIndex === index ? 'bg-gray-400' : 'bg-gray-200'} border-2 border-black m-2 flex items-center justify-center cursor-pointer vertical-rl`}
            style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
            data-index={index}
            onClick={() => selectBlock(index)}
          >
            {word}
          </div>
        ))}
      </div>
      {distance !== null && (
        <div id="distance" className="mt-2 text-lg">
          Distance between swapped blocks: {distance}
        </div>
      )}
      {timeTaken !== null && (
        <div id="time" className="mt-2 text-lg">
          Time taken: {timeTaken} seconds
        </div>
      )}
      <div id="swapCount" className="mt-2 text-lg">
        Swap Count: {swapCount}
      </div>
      <div id="score" className="mt-2 text-lg">
        Score: {score}
      </div>
      <div id="message" className="mt-5 text-lg">
        {gameEnded ? 'Congratulations! You\'ve sorted the words!' : ''}
      </div>
    </div>
  );
};

export default WordSortingGame;
