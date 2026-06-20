'use client';

import React, { useState, useEffect } from 'react';
import { useIP } from '@/context/IPContext';
import { Maximize2, Minimize2, HelpCircle, Trophy, Sparkles, AlertCircle, Play, X, Flame, RefreshCw, ArrowLeft } from 'lucide-react';
import { SoundFX } from '@/lib/audio';
import { Modal } from '@/components/Modal';

export default function QuizHub() {
  const {
    quizMode,
    setQuizMode,
    score,
    streak,
    currentQuiz,
    timeLeft,
    arcadeActive,
    addCustomAIQuestions,
    startQuizChallenge,
    startArcadeGame,
    checkQuizAnswer,
    submitArcadeScore,
    exitArcadeGame,
    clearLeaderboard,
    getLeaderboard,
    ip,
    cidr,
    aiConfig,
  } = useIP();

  const [isMaximized, setIsMaximized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Selection feedback state
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isOptCorrect, setIsOptCorrect] = useState<boolean | null>(null);

  const handleToggleMaximize = () => {
    SoundFX.click();
    setIsMaximized(!isMaximized);
  };

  // Safe auto generate on load if null
  useEffect(() => {
    if (!currentQuiz && !arcadeActive) {
      startQuizChallenge();
    }
  }, [currentQuiz, arcadeActive, startQuizChallenge]);

  // Request Gemini API to generate custom scenario quiz cards specific to the IP address
  const handleAIGenerateQuiz = async () => {
    SoundFX.click();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': aiConfig.provider,
          'x-ai-api-key': aiConfig.apiKey,
          'x-ai-base-url': aiConfig.baseUrl,
          'x-ai-model-name': aiConfig.modelName,
        },
        body: JSON.stringify({
          action: 'generateQuiz',
          payload: {
            ip,
            cidr,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Connection failed');
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        // Enforce strong GUIDs
        const structured = data.questions.map((q: any) => ({
          ...q,
          id: Math.random().toString(36).substring(2, 9),
          type: 'custom_ai',
        }));
        
        addCustomAIQuestions(structured);
        SoundFX.quizSuccess();
        alert('۵ سوال تستی پیشرفته و آدرس-محور با موفقیت تولید و با مخزن چالش‌ها ادغام شد!');
        
        // Push-load immediately
        startQuizChallenge();
      }
    } catch (e) {
      alert('خطا در بارگذاری سوالات هوش مصنوعی.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionClick = (opt: string) => {
    if (isAnswered) return; // Prevent double trigger
    setSelectedOpt(opt);
    setIsAnswered(true);

    const isCorrect = checkQuizAnswer(opt);
    setIsOptCorrect(isCorrect);

    // Reset selection after delay to load next question
    setTimeout(() => {
      setSelectedOpt(null);
      setIsAnswered(false);
      setIsOptCorrect(null);
    }, 1200);
  };

  const nameSubmission = () => {
    if (!playerName.trim()) return;
    submitArcadeScore(playerName);
    setPlayerName('');
    setShowLeaderboard(true);
  };

  const leadEntries = getLeaderboard();

  return (
    <>
      <div
        className={`${
          isMaximized
            ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-10 flex flex-col justify-start items-center shadow-2xl'
            : 'relative glass-panel p-6 rounded-3xl border border-indigo-500/20 shadow-xl bg-gradient-to-br from-indigo-950/20 via-slate-950 to-slate-950'
        }`}
        dir="rtl"
        id="panel-quiz"
      >
        <div className={isMaximized ? 'w-full max-w-4xl space-y-6 mt-10' : 'space-y-4'}>
          {/* Header parameters */}
          <div className="flex flex-col gap-3.5 pb-3 border-b border-slate-900 select-none lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <h3 className="font-extrabold flex items-center gap-2 text-indigo-300 text-xs sm:text-sm">
                <Trophy className="w-4 h-4 text-amber-450 animate-bounce" />
                <span>مدرسه بازی‌سازی شبکه</span>
              </h3>
              
              {/* Mobile-only action buttons to save space */}
              <div className="flex lg:hidden items-center gap-1.5">
                <button
                  onClick={handleToggleMaximize}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  id="quiz-max-btn-mobile"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { SoundFX.click(); setShowHelp(true); }}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="آموزش روش بازی"
                  id="quiz-help-btn-mobile"
                >
                  <HelpCircle className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 flex-wrap sm:flex-nowrap">
              {/* AI question generation button */}
              <button
                onClick={handleAIGenerateQuiz}
                disabled={isGenerating}
                className="flex-grow sm:flex-grow-0 px-2.5 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                title="تولید آزمون‌های اختصاصی و جدید با هوش مصنوعی"
                id="ai-quiz-gen"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>{isGenerating ? 'در حال طراحی تِست...' : 'تولید با AI'}</span>
              </button>

              {/* Status Scoreboard indicator */}
              <div className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-900 text-[10px] font-black shrink-0">
                <span className="text-amber-400">امتیاز: {score}</span>
                <span className="text-slate-700">|</span>
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-red-500" />
                  <span>{streak}🔥</span>
                </span>
              </div>

              {/* Desktop-only action buttons */}
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={handleToggleMaximize}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  id="quiz-max-btn"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => { SoundFX.click(); setShowHelp(true); }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="آموزش روش بازی"
                  id="quiz-help-btn"
                >
                  <HelpCircle className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mode Switch row */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 text-[10px] font-bold select-none">
            <button
              onClick={() => setQuizMode('classic')}
              className={`flex-grow py-1.5 rounded-lg font-bold transition-all ${
                quizMode === 'classic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              id="mode-classic-trigger"
            >
              آموزش سنتی
            </button>
            <button
              onClick={() => setQuizMode('arcade')}
              className={`flex-grow py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                quizMode === 'arcade' ? 'bg-indigo-600 text-white animate-pulse' : 'text-slate-400 hover:text-white'
              }`}
              id="mode-arcade-trigger"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>چالش زمان‌دار آرکید</span>
            </button>
          </div>

          {/* Main Card render context based on current status */}
          <div className="bg-slate-950/40 p-4 border border-slate-900/60 rounded-2xl" id="quiz-interaction-body">
            {quizMode === 'arcade' && !arcadeActive && !showLeaderboard && (
              // Arcade starter layout
              <div className="text-center py-6 space-y-4 select-none" id="arcade-unstarted-view">
                <Flame className="w-12 h-12 text-amber-500 fill-current mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white">آماده شروع بازی سرعتی هستید؟</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed text-center px-4 max-w-sm mx-auto">
                    ۶۰ ثانیه زمان پایه، تِست‌های تصادفی باینری و سابنتینگ! هر پاسخ صحیح ۵ ثانیه پاداش و پاسخ اشتباه ۸ ثانیه زمان می‌کاهد.
                  </p>
                </div>
                
                <div className="flex justify-center gap-2">
                  <button
                    onClick={startArcadeGame}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                    id="arcade-start-btn"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>شروع چالش آرکید</span>
                  </button>

                  <button
                    onClick={() => { SoundFX.click(); setShowLeaderboard(true); }}
                    className="px-4 py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold"
                    id="arcade-lead-view-btn"
                  >
                    <span>رده‌بندی</span>
                  </button>
                </div>
              </div>
            )}

            {showLeaderboard && (
              // Highscore Leaderboard rendering
              <div className="space-y-4" id="arcade-leaderboard-view">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 select-none">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>جدول ۵ قهرمان برتر سابنت</span>
                  </span>
                  
                  <button
                    onClick={() => { clearLeaderboard(); }}
                    className="text-[9px] text-rose-400 hover:underline font-bold"
                    id="clear-leaderboard-btn"
                  >
                    پاک کردن رکوردها
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {leadEntries.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-4 select-none">هیچ رکوردی ثبت نشده است.</p>
                  ) : (
                    leadEntries.slice(0, 5).map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[10px] bg-slate-950 border border-slate-900 p-2.5 rounded-xl font-sans"
                        id={`lead-row-${idx}`}
                      >
                        <span className="font-bold flex items-center gap-1.5 select-none">
                          <span className="text-amber-400 font-sans">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}</span>
                          <span className="text-slate-205">{entry.name}</span>
                        </span>
                        <span className="font-mono text-indigo-400 font-bold">{entry.score} امتیاز</span>
                        <span className="text-slate-500 font-mono">{entry.streak}🔥</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-900 select-none">
                  <button
                    onClick={() => { setShowLeaderboard(false); startArcadeGame(); }}
                    className="flex-grow py-2 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-600 hover:to-violet-750 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                    id="arcade-lead-replay"
                  >
                    <span>چالش جدید</span>
                  </button>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="flex-grow py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 border border-slate-800"
                    id="arcade-lead-back"
                  >
                    <span>بازگشت</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quizzes Core Interactive form */}
            {((quizMode === 'classic') || (quizMode === 'arcade' && arcadeActive)) && !showLeaderboard && currentQuiz && (
              <div className="space-y-4" id="quiz-question-box">
                {/* Time Indicator if arcade mode is active */}
                {quizMode === 'arcade' && (
                  <div className="flex justify-between items-center bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-xs font-bold select-none" id="arcade-timer-bar">
                    <span className="text-slate-400 flex items-center gap-1">زمان باقی‌مانده:</span>
                    <span className={`font-mono font-black ${timeLeft <= 15 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                      {timeLeft} ثانیه
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 select-none">سطح چالش سابنتینگ</span>
                  <p className="text-xs md:text-sm text-slate-200 font-bold leading-relaxed">{currentQuiz.question}</p>
                </div>

                {/* Answers grid */}
                <div className="grid grid-cols-1 gap-2 font-mono">
                  {currentQuiz.options.map((option, idx) => {
                    const isSelected = selectedOpt === option;
                    const isCorrect = option === currentQuiz.correctAnswer;
                    
                    let btnStyle = 'bg-slate-950 border-slate-900 text-slate-350 hover:border-indigo-500 hover:bg-slate-900/60';
                    
                    if (isAnswered) {
                      if (isSelected) {
                        btnStyle = isOptCorrect
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                          : 'border-rose-500 bg-rose-500/15 text-rose-400 animate-shake';
                      } else if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-400';
                      } else {
                        btnStyle = 'bg-slate-950 border-slate-900 text-slate-600 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={isAnswered}
                        className={`w-full text-right p-3 rounded-xl border text-xs font-sans font-bold transition-all flex items-center ${btnStyle}`}
                        id={`quiz-option-${idx}`}
                      >
                        <span className="inline-block w-5 h-5 rounded-full bg-slate-900 text-slate-400 text-center leading-tight text-[11px] ml-2 font-sans select-none pt-0.5">
                          {idx + 1}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer and Hints elements */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-900 select-none">
                  {currentQuiz.hint && (
                    <button
                      onClick={() => { SoundFX.click(); setShowHint(true); }}
                      className="text-[10px] text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                      id="get-hint-btn"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>راهنمایی می‌خوام</span>
                    </button>
                  )}
                  
                  {quizMode === 'classic' ? (
                    <button
                      onClick={startQuizChallenge}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-bold flex items-center gap-0.5"
                      id="skip-quiz-btn"
                    >
                      <span>رد کردن سوال</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={exitArcadeGame}
                      className="text-[10px] text-rose-450 hover:underline font-bold"
                      id="exit-arcade-btn"
                    >
                      انصراف و خروج
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Arcade Game Finished Form */}
            {quizMode === 'arcade' && !arcadeActive && timeLeft === 0 && !showLeaderboard && (
              <div className="space-y-4 text-center" id="arcade-finished-panel">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl font-black text-sm select-none">
                  🚨 چالش به پایان رسید! (زمان تمام شد)
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-900">
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-slate-500 select-none">امتیاز نهایی</div>
                    <div className="text-2xl font-black text-indigo-400 font-mono">{score}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-slate-500 select-none">توالی داغ</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{streak}🔥</div>
                  </div>
                </div>

                {/* Score submission */}
                <div className="space-y-2 text-right">
                  <label className="text-[10px] text-slate-400 block font-bold select-none">ثبت رکورد در تالار قهرمانان:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="flex-grow bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 text-center font-bold font-sans"
                      placeholder="نام خود را بنویسید..."
                      id="player-name-input"
                    />
                    <button
                      onClick={nameSubmission}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shrink-0"
                      id="submit-score-btn"
                    >
                      ثبت رکورد
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-900 select-none">
                  <button
                    onClick={startArcadeGame}
                    className="flex-grow py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                    id="replay-arcade-direct"
                  >
                    <span>بازی مجدد</span>
                  </button>
                  <button
                    onClick={exitArcadeGame}
                    className="flex-grow py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-150 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 border border-slate-800"
                    id="arcade-exit-finished"
                  >
                    <span>انصراف</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main explanation help dialog */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="مدرسه بازی‌سازی شبکه"
        icon="help_outline"
      >
        <div className="space-y-4 font-sans text-xs">
          <p><strong>🤔 این چیه؟</strong> مرکز تمرین، کوییز و مسابقات چهارگزینه‌ای شبکه.</p>
          <p><strong>🛠️ چیکار میکنه؟</strong> مفاهیم سابنتینگ، تبدیل‌های باینری و کلاس‌ها را به صورت بازی و رقابت درمی‌آورد و با پاسخ درست امتیاز شما را بارگذاری می‌کند.</p>
          <p><strong>💡 یعنی چی؟ (به زبان خیلی ساده):</strong> یک معلم خصوصی پرانرژی است! هر بار سوالی درباره تبدیل اعداد یا ماسک‌ها از شما می‌پرسد. با هر پاسخ درست، توالی یا Streak شما بالا رفته و با افکت‌های صوتی هیجان‌انگیز صوتی تشویق می‌شوید.</p>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <strong>🌟 یک مثال ساده:</strong> اگر از شما بپرسد سابنت پیش‌وند «/24» چیست و گزینه <code className="text-emerald-400 font-bold font-mono">255.255.255.0</code> را بزنید، ۲۰ امتیاز به حساب شما واریز خواهد شد!
          </div>
        </div>
      </Modal>

      {/* Hints dialog detail */}
      {currentQuiz && showHint && (
        <Modal
          isOpen={showHint}
          onClose={() => setShowHint(false)}
          title="💡 راهنمای طلایی تِست"
          icon="help_outline"
        >
          <p className="text-xs leading-relaxed text-slate-300 font-medium text-justify" id="hint-prose">
            {currentQuiz.hint}
          </p>
        </Modal>
      )}
    </>
  );
}
