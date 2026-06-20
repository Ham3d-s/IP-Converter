'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  validateIPv4,
  ipToBits,
  bitsToIP,
  generateRandomIPv4,
  generateRandomIPv6,
  calculateSubnetDetails,
  QuizQuestion,
  Flashcard,
} from '@/lib/ip-utils';
import { SoundFX } from '@/lib/audio';

export type NetworkMode = 'ipv4' | 'ipv6';

interface AIConfiguration {
  provider: string;
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  streak: number;
  date: string;
}

interface IPContextProps {
  // Navigation & General
  isMounted: boolean;
  mode: NetworkMode;
  setMode: (mode: NetworkMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Main IP Engine state
  ip: string;
  cidr: number;
  bits: number[];
  setIP: (ip: string) => void;
  setCIDR: (val: number) => void;
  handleIPInput: (val: string) => void;
  toggleBit: (index: number) => void;
  generateRandom: () => void;
  resetAll: () => void;

  // Subnetting analysis
  subnetDetails: any;

  // History and bookmarks
  history: string[];
  favorites: string[];
  sidebarTab: 'history' | 'favorites';
  setSidebarTab: (tab: 'history' | 'favorites') => void;
  toggleFavorite: () => void;
  deleteSidebarItem: (ip: string) => void;
  clearSidebarData: () => void;

  // Flashcards & cheat sheets
  fcTab: 'cards' | 'cheat';
  setFcTab: (tab: 'cards' | 'cheat') => void;
  currentFCardIdx: number;
  fcNext: () => void;
  fcPrev: () => void;
  customCheatSheetItems: Array<{ category: string; title: string; details: string }>;
  addCustomCheatSheetItems: (items: Array<{ category: string; title: string; details: string }>) => void;

  // Gamified Quizzes
  quizMode: 'classic' | 'arcade';
  setQuizMode: (mode: 'classic' | 'arcade') => void;
  score: number;
  streak: number;
  currentQuiz: QuizQuestion | null;
  timeLeft: number;
  arcadeActive: boolean;
  customAIQuestions: QuizQuestion[];
  addCustomAIQuestions: (questions: QuizQuestion[]) => void;
  startQuizChallenge: () => void;
  startArcadeGame: () => void;
  checkQuizAnswer: (selected: string) => boolean;
  submitArcadeScore: (playerName: string) => void;
  exitArcadeGame: () => void;
  clearLeaderboard: () => void;
  getLeaderboard: () => LeaderboardEntry[];

  // AI Configuration Settings
  aiConfig: AIConfiguration;
  saveAIConfig: (config: AIConfiguration) => void;
}

const defaultAIConfig: AIConfiguration = {
  provider: 'default_gemini',
  apiKey: '',
  baseUrl: '',
  modelName: 'gemini-3.5-flash',
};

const IPContext = createContext<IPContextProps | undefined>(undefined);

export function IPProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setModeState] = useState<NetworkMode>('ipv4');
  const [soundEnabled, setSoundEnabledState] = useState(true);

  // Main IP Engine State
  const [ip, setIPState] = useState('192.168.1.1');
  const [cidr, setCIDRState] = useState(24);
  const [bits, setBits] = useState<number[]>(new Array(32).fill(0));

  // Sidebar List
  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'history' | 'favorites'>('history');

  // Flashcard setup
  const [fcTab, setFcTab] = useState<'cards' | 'cheat'>('cards');
  const [currentFCardIdx, setCurrentFCardIdx] = useState(0);
  const [customCheatSheetItems, setCustomCheatSheetItems] = useState<
    Array<{ category: string; title: string; details: string }>
  >([]);

  // Quiz State
  const [quizMode, setQuizModeState] = useState<'classic' | 'arcade'>('classic');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [arcadeActive, setArcadeActive] = useState(false);
  const [customAIQuestions, setCustomAIQuestions] = useState<QuizQuestion[]>([]);

  // AI Connection configuration
  const [aiConfig, setAIConfig] = useState<AIConfiguration>(defaultAIConfig);

  // Timer reference for arcade
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load from LocalStorage once mounted
  useEffect(() => {
    setIsMounted(true);
    
    // Lazy sync configuration states
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('ip_history_v2');
      const savedFavorites = localStorage.getItem('ip_favorites_v2');
      const savedScore = localStorage.getItem('ip_quiz_score');
      const savedStreak = localStorage.getItem('ip_quiz_streak');
      const savedAIConfig = localStorage.getItem('ip_ai_settings_v2');
      const savedSound = localStorage.getItem('ip_sound_enabled');

      if (savedHistory) setHistory(JSON.parse(savedHistory));
      else setHistory(['192.168.1.1', '10.0.0.1', '172.16.0.100']);

      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedScore) setScore(parseInt(savedScore, 10));
      if (savedStreak) setStreak(parseInt(savedStreak, 10));
      if (savedSound) {
        const soundVal = JSON.parse(savedSound);
        setSoundEnabledState(soundVal);
        SoundFX.setEnabled(soundVal);
      }

      if (savedAIConfig) {
        setAIConfig(JSON.parse(savedAIConfig));
      }
    }
  }, []);

  // Sync bits and compute details on IP or CIDR changes
  useEffect(() => {
    if (mode === 'ipv4' && validateIPv4(ip)) {
      setBits(ipToBits(ip));
    }
  }, [ip, mode]);

  // Sync Audio Setting
  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    SoundFX.setEnabled(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ip_sound_enabled', JSON.stringify(val));
    }
  };

  const setMode = (m: NetworkMode) => {
    SoundFX.click();
    setModeState(m);
    if (m === 'ipv4') {
      setIPState(ip.includes('.') ? ip : '192.168.1.1');
    } else {
      setIPState(ip.includes(':') ? ip : '2001:db8::1');
    }
  };

  const setIP = (newIP: string) => {
    setIPState(newIP);
  };

  const setCIDR = (newCidr: number) => {
    setCIDRState(newCidr);
  };

  const handleIPInput = (val: string) => {
    const trimmed = val.trim();
    setIPState(trimmed);
    if (mode === 'ipv4' && validateIPv4(trimmed)) {
      addToHistory(trimmed);
    }
  };

  const toggleBit = (index: number) => {
    if (mode !== 'ipv4') return;
    SoundFX.bitToggle();
    const newBits = [...bits];
    newBits[index] = newBits[index] === 0 ? 1 : 0;
    setBits(newBits);

    // Compute back to IP string representation
    const newIP = bitsToIP(newBits);
    setIPState(newIP);
  };

  const generateRandom = () => {
    SoundFX.click();
    if (mode === 'ipv4') {
      const generated = generateRandomIPv4();
      setIPState(generated);
      addToHistory(generated);
    } else {
      const generated = generateRandomIPv6();
      setIPState(generated);
    }
  };

  const resetAll = () => {
    SoundFX.click();
    setIPState('192.168.1.1');
    setCIDRState(24);
    setModeState('ipv4');
  };

  // Subnet analysis details computed on the fly
  const subnetDetails = calculateSubnetDetails(ip, cidr);

  // History & Bookmarks functions
  const addToHistory = (value: string) => {
    setHistory((prev) => {
      if (prev.includes(value)) return prev;
      const updated = [value, ...prev].slice(0, 10);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ip_history_v2', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const toggleFavorite = () => {
    SoundFX.click();
    setFavorites((prev) => {
      let updated;
      if (prev.includes(ip)) {
        updated = prev.filter((item) => item !== ip);
      } else {
        updated = [...prev, ip];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ip_favorites_v2', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteSidebarItem = (targetIp: string) => {
    SoundFX.click();
    if (sidebarTab === 'history') {
      setHistory((prev) => {
        const u = prev.filter((i) => i !== targetIp);
        if (typeof window !== 'undefined') localStorage.setItem('ip_history_v2', JSON.stringify(u));
        return u;
      });
    } else {
      setFavorites((prev) => {
        const u = prev.filter((i) => i !== targetIp);
        if (typeof window !== 'undefined') localStorage.setItem('ip_favorites_v2', JSON.stringify(u));
        return u;
      });
    }
  };

  const clearSidebarData = () => {
    SoundFX.click();
    if (sidebarTab === 'history') {
      setHistory([]);
      if (typeof window !== 'undefined') localStorage.setItem('ip_history_v2', JSON.stringify([]));
    } else {
      setFavorites([]);
      if (typeof window !== 'undefined') localStorage.setItem('ip_favorites_v2', JSON.stringify([]));
    }
  };

  // Flashcards actions
  const fcNext = () => {
    SoundFX.click();
    setCurrentFCardIdx((prev) => (prev + 1) % 8);
  };

  const fcPrev = () => {
    SoundFX.click();
    setCurrentFCardIdx((prev) => (prev - 1 + 8) % 8);
  };

  const addCustomCheatSheetItems = (items: Array<{ category: string; title: string; details: string }>) => {
    setCustomCheatSheetItems((prev) => [...prev, ...items]);
  };

  // AI settings
  const saveAIConfig = (config: AIConfiguration) => {
    setAIConfig(config);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ip_ai_settings_v2', JSON.stringify(config));
    }
  };

  // ------------------------------------------
  // GAMIFIED QUIZZES CORE
  // ------------------------------------------

  const setQuizMode = (qd: 'classic' | 'arcade') => {
    SoundFX.click();
    setQuizModeState(qd);
    setArcadeActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (qd === 'classic') {
      startQuizChallenge();
    }
  };

  const addCustomAIQuestions = (questions: QuizQuestion[]) => {
    setCustomAIQuestions((prev) => [...prev, ...questions]);
  };

  // Generate a random question on-demand
  const startQuizChallenge = () => {
    const quizTypes = ['dec_to_bin', 'bin_to_dec', 'cidr_mask', 'ip_class'];
    if (customAIQuestions.length > 0) {
      quizTypes.push('custom_ai');
    }

    const chosenType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
    let question = '';
    let correctAnswer = '';
    let options: string[] = [];
    let hint = '';

    if (chosenType === 'custom_ai') {
      const q = customAIQuestions[Math.floor(Math.random() * customAIQuestions.length)];
      question = q.question;
      correctAnswer = q.correctAnswer;
      options = [...q.options];
      hint = q.hint;
    } else if (chosenType === 'dec_to_bin') {
      const val = Math.floor(Math.random() * 256);
      question = `بخش تبدیل: عدد ده‌دهی ${val} معادل کدام گزینه در فرمت باینری (مبنای ۲) است؟`;
      correctAnswer = val.toString(2).padStart(8, '0');
      hint = `برای به دست آوردن جواب، می‌توانید از قدرت‌های ۲ استفاده کنید: مجموع وزن‌هایی که روشن (1) هستند باید برابر با عدد ${val} باشد.`;
      options = [
        correctAnswer,
        Math.floor(Math.random() * 256).toString(2).padStart(8, '0'),
        Math.floor(Math.random() * 256).toString(2).padStart(8, '0'),
        Math.floor(Math.random() * 256).toString(2).padStart(8, '0'),
      ];
    } else if (chosenType === 'bin_to_dec') {
      const val = Math.floor(Math.random() * 256);
      const binStr = val.toString(2).padStart(8, '0');
      question = `بخش تبدیل: عدد باینری ${binStr} معادل کدام عدد ده‌دهی (مبنای ۱۰) است؟`;
      correctAnswer = val.toString();
      hint = `به ارزش بیت‌های روشن دقت کنید. از راست به چپ: ۱، ۲، ۴، ۸، ۱۶، ۳۲، ۶۴، ۱۲۸. آنها را با هم جمع کنید.`;
      options = [
        correctAnswer,
        Math.floor(Math.random() * 256).toString(),
        Math.floor(Math.random() * 256).toString(),
        Math.floor(Math.random() * 256).toString(),
      ];
    } else if (chosenType === 'cidr_mask') {
      const cidrs = [8, 16, 24, 25, 26, 30];
      const c = cidrs[Math.floor(Math.random() * cidrs.length)];
      question = `بخش سابنتینگ: سابنت ماسک استاندارد برای پیش‌وند کوتاه /${c} کدام گزینه است؟`;
      hint = `پیش‌وند /${c} یعنی تعداد ${c} بیت اول سابنت ماسک روشن (1) هستند و مابقی بیت‌ها خاموش (0) هستند. مثلاً /24 یعنی سه بخش اول کاملاً روشن (255.255.255.0) هستند.`;
      
      const maskNum = cidr === 0 ? 0 : (~0 << (32 - c)) >>> 0;
      correctAnswer = [
        (maskNum >>> 24) & 255,
        (maskNum >>> 16) & 255,
        (maskNum >>> 8) & 255,
        maskNum & 255,
      ].join('.');
      
      options = [
        correctAnswer,
        '255.255.255.192',
        '255.255.240.0',
        '255.255.255.240',
      ];
    } else {
      const val = Math.floor(Math.random() * 223) + 1;
      question = `بخش مفاهیم: اگر اولین اکتت (بخش اول) یک آدرس آی‌پی برابر با ${val} باشد، این آی‌پی در کدام کلاس شبکه قرار دارد؟`;
      hint = `کلاس A بین ۱ تا ۱۲۶ است. کلاس B بین ۱۲۸ تا ۱۹۱ است. کلاس C بین ۱۹۲ تا ۲۲۳ است. مقدار اکتت اول شما در کادر سوال برابر با ${val} است.`;
      
      if (val <= 126) correctAnswer = 'کلاس A';
      else if (val <= 191) correctAnswer = 'کلاس B';
      else correctAnswer = 'کلاس C';

      options = ['کلاس A', 'کلاس B', 'کلاس C', 'کلاس D'];
    }

    // Eliminate duplicates, shuffle, and fill to 4 options
    options = Array.from(new Set(options));
    while (options.length < 4) {
      options.push('مورد فرعی ' + Math.random().toString(36).substring(4, 8));
    }
    options.sort(() => Math.random() - 0.5);

    setCurrentQuiz({
      id: Math.random().toString(36).substring(2, 9),
      type: chosenType as any,
      question,
      options,
      correctAnswer,
      hint,
    });
  };

  // Arcade control
  const startArcadeGame = () => {
    SoundFX.click();
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setArcadeActive(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setArcadeActive(false);
          SoundFX.quizFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Call state helper to generate a question
    setTimeout(() => {
      startQuizChallenge();
    }, 10);
  };

  const checkQuizAnswer = (selected: string): boolean => {
    if (!currentQuiz) return false;
    const isCorrect = selected === currentQuiz.correctAnswer;

    if (isCorrect) {
      SoundFX.quizSuccess();
      const scoreAdd = 20;
      setScore((s) => {
        const next = s + scoreAdd;
        if (typeof window !== 'undefined') localStorage.setItem('ip_quiz_score', next.toString());
        return next;
      });
      setStreak((st) => {
        const next = st + 1;
        if (typeof window !== 'undefined') localStorage.setItem('ip_quiz_streak', next.toString());
        return next;
      });
      if (quizMode === 'arcade') {
        setTimeLeft((prev) => prev + 5); // Time bonus
      }
    } else {
      SoundFX.quizFail();
      setStreak(0);
      if (typeof window !== 'undefined') localStorage.setItem('ip_quiz_streak', '0');
      if (quizMode === 'arcade') {
        setTimeLeft((prev) => Math.max(0, prev - 8)); // Time penalty
      }
    }

    // Load next question with delay
    setTimeout(() => {
      startQuizChallenge();
    }, 1200);

    return isCorrect;
  };

  const submitArcadeScore = (playerName: string) => {
    SoundFX.click();
    const finalName = playerName.trim() || 'ناشناس';
    const savedLeaderboard = localStorage.getItem('ip_arcade_leaderboard');
    const leaderboard: LeaderboardEntry[] = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
    
    leaderboard.push({
      name: finalName,
      score,
      streak,
      date: new Date().toLocaleDateString('fa-IR'),
    });

    localStorage.setItem('ip_arcade_leaderboard', JSON.stringify(leaderboard));
  };

  const exitArcadeGame = () => {
    SoundFX.click();
    setArcadeActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setQuizModeState('classic');
    startQuizChallenge();
  };

  const clearLeaderboard = () => {
    SoundFX.click();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ip_arcade_leaderboard');
    }
  };

  const getLeaderboard = (): LeaderboardEntry[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('ip_arcade_leaderboard');
    if (!saved) return [];
    const parsed: LeaderboardEntry[] = JSON.parse(saved);
    return parsed.sort((a, b) => b.score - a.score);
  };

  return (
    <IPContext.Provider
      value={{
        isMounted,
        mode,
        setMode,
        soundEnabled,
        setSoundEnabled,
        ip,
        cidr,
        bits,
        setIP,
        setCIDR,
        handleIPInput,
        toggleBit,
        generateRandom,
        resetAll,
        subnetDetails,
        history,
        favorites,
        sidebarTab,
        setSidebarTab,
        toggleFavorite,
        deleteSidebarItem,
        clearSidebarData,
        fcTab,
        setFcTab,
        currentFCardIdx,
        fcNext,
        fcPrev,
        customCheatSheetItems,
        addCustomCheatSheetItems,
        quizMode,
        setQuizMode,
        score,
        streak,
        currentQuiz,
        timeLeft,
        arcadeActive,
        customAIQuestions,
        addCustomAIQuestions,
        startQuizChallenge,
        startArcadeGame,
        checkQuizAnswer,
        submitArcadeScore,
        exitArcadeGame,
        clearLeaderboard,
        getLeaderboard,
        aiConfig,
        saveAIConfig,
      }}
    >
      {children}
    </IPContext.Provider>
  );
}

export function useIP() {
  const context = useContext(IPContext);
  if (context === undefined) {
    throw new Error('useIP must be used within an IPProvider');
  }
  return context;
}
