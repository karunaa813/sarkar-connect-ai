import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  Scale,
  Shield,
  Info,
  Download,
  ExternalLink,
  MessageSquare,
  Send,
  Bot,
  User,
  X,
  ChevronRight,
  Gavel,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ClipboardList,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import bnsData from '../lib/bns_data.json';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    sections?: any[];
    verified?: boolean;
    voiceUrl?: string;
  };
}

interface Act {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Criminal' | 'Civil' | 'Digital';
  year: string;
  manual?: {
    chapters: {
      title: string;
      sections: {
        number: string;
        title: string;
        content: string;
      }[];
    }[];
  };
}

const acts: Act[] = [
  {
    id: 'bns-2023',
    title: 'Bharatiya Nyaya Sanhita, 2023',
    description: 'The primary penal code of India, replacing the Indian Penal Code (IPC). Defines offences and punishments.',
    icon: <Scale className="w-6 h-6" />,
    category: 'Criminal',
    year: '2023',
    manual: {
      chapters: [
        {
          title: "Chapter I: Preliminary",
          sections: [
            { number: "1", title: "Short title, commencement and application", content: "This Act may be called the Bharatiya Nyaya Sanhita, 2023. It shall come into force on such date as the Central Government may appoint." },
            { number: "2", title: "Definitions", content: "In this Sanhita, unless the context otherwise requires, terms like 'act', 'animal', 'child', 'Court', 'death', 'dishonestly', 'gender', 'good faith', 'Government', 'Judge', 'life', 'local law', 'man', 'month', 'movable property', 'number', 'oath', 'offence', 'person', 'public', 'public servant', 'reason to believe', 'special law', 'valuable security', 'vessel', 'voluntarily', 'will', 'woman', 'wrongful gain', 'wrongful loss' are defined." }
          ]
        },
        {
          title: "Chapter VI: Of Offences Affecting the Human Body",
          sections: [
            { number: "101", title: "Murder", content: "Except in the cases hereinafter excepted, culpable homicide is murder, if the act by which the death is caused is done with the intention of causing death..." },
            { number: "103", title: "Punishment for Murder", content: "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. (2) Mob Lynching: When a group of five or more persons acting in concert commits murder on grounds of race, caste, community, etc., each member shall be punished with death or imprisonment for life." }
          ]
        }
      ]
    }
  },
  {
    id: 'rti-2005',
    title: 'Right to Information Act, 2005',
    description: 'Empowers citizens to request information from public authorities, making the government accountable.',
    icon: <Book className="w-6 h-6" />,
    category: 'Civil',
    year: '2005',
    manual: {
      chapters: [
        {
          title: "Chapter II: Right to Information",
          sections: [
            { number: "3", title: "Right to Information", content: "Subject to the provisions of this Act, all citizens shall have the right to information." },
            { number: "4", title: "Obligations of Public Authorities", content: "Every public authority shall maintain all its records duly catalogued and indexed and ensure that all records that are appropriate to be computerised are, within a reasonable time and subject to availability of resources, computerised and connected through a network all over the country so that access to such records is facilitated." }
          ]
        }
      ]
    }
  },
  {
    id: 'it-2000',
    title: 'Information Technology Act, 2000',
    description: 'The primary law in India dealing with cybercrime and electronic commerce.',
    icon: <Shield className="w-6 h-6" />,
    category: 'Digital',
    year: '2000',
    manual: {
      chapters: [
        {
          title: "Chapter XI: Offences",
          sections: [
            { number: "66", title: "Computer Related Offences", content: "If any person, dishonestly or fraudulently, does any act referred to in section 43, he shall be punishable with imprisonment for a term which may extend to three years or with fine which may extend to five lakh rupees or with both." },
            { number: "66E", title: "Punishment for Violation of Privacy", content: "Whoever, intentionally or knowingly captures, publishes or transmits the image of a private area of any person without his or her consent, under circumstances violating the privacy of that person, shall be punished with imprisonment which may extend to three years or with fine not exceeding two lakh rupees, or with both." }
          ]
        }
      ]
    }
  }
];

const LegalLibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Criminal' | 'Civil' | 'Digital'>('All');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I am your **Multilingual BNS 2023 Legal Assistant**. I can speak in Hindi, Marathi, English, and more. How can I assist you in your preferred language?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [selectedAct, setSelectedAct] = useState<Act | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const speakText = async (text: string, messageId: string) => {
    if (isPlaying === messageId) {
      audioRef.current?.pause();
      setIsPlaying(null);
      return;
    }

    setIsPlaying(messageId);
    try {
      const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.replace(/\*\*/g, ''),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(null);
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsPlaying(null);
    }
  };

  const filteredActs = acts.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      const query = userMessage.content.toLowerCase();
      const matchedSections = (bnsData as any[]).filter(section => {
        const secNum = String(section.Section || "");
        const secName = (section["Section _name"] || section["Section_name"] || "").toLowerCase();
        const desc = (section.Description || "").toLowerCase();

        const sectionMatch = query.match(/section\s*(\d+)/i);
        if (sectionMatch && sectionMatch[1] === secNum) return true;

        return secName.includes(query) || (query.length > 5 && desc.includes(query));
      }).slice(0, 3);

      const contextText = matchedSections.length > 0
        ? matchedSections.map(s => `[VERIFIED LEGAL DATA: Section ${s.Section} - ${s["Section _name"] || s["Section_name"]}\nText: ${s.Description}]`).join("\n\n")
        : "No direct section match found in BNS 2023 dataset. Using general BNS principles.";

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://sarkar-connect.ai',
          'X-Title': 'Sarkar Connect AI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a Multilingual Pro-bono Legal AI Assistant specialized in Bharatiya Nyaya Sanhita (BNS) 2023.
              
              STRICT RULES:
              1. RESPOND IN THE LANGUAGE USED BY THE USER (Hindi, Marathi, English, Tamil, etc.).
              2. If the user asks in Hindi, translate the BNS data into Hindi accurately.
              3. Use the provided [VERIFIED LEGAL DATA] for citations.
              
              STYLE:
              - Use **bold** for section numbers.
              - Clear points.
              - Highlight punishments.
              - End with: "This is for informational purposes and not formal legal advice."
              - Be empathetic and professional.
              
              CONTEXT DATA:
              ${contextText}`
            },
            { role: 'user', content: query }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok || !data.choices || data.choices.length === 0) {
        throw new Error(data.error?.message || 'Failed to connect to Legal Database');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.choices[0].message.content,
        timestamp: new Date(),
        metadata: {
          sections: matchedSections,
          verified: matchedSections.length > 0
        }
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I apologize, but I encountered an error: ${error.message || 'Connecting to the legal database'}. Please try again soon.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <audio ref={audioRef} className="hidden" />

      <div className="max-w-7xl mx-auto p-6 pt-32 pb-32 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
              Legal Library
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Access the complete digital manuals for Indian Laws and consult our AI-powered legal assistant.
            </p>
          </div>
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95 text-white"
          >
            <Bot className="w-5 h-5" />
            Legal AI Assistant
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search laws or sections (e.g. 'Murder', 'RTI Procedure')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'Criminal', 'Civil', 'Digital'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === category
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Acts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActs.map((act) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="group bg-gray-900/40 border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 hover:bg-gray-900/60 transition-all shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {act.icon}
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                  {act.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-700">
                      {act.category}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">EST. {act.year}</span>
                  </div>
                  <h3 className="text-xl font-bold mt-1 group-hover:text-blue-400 transition-colors">
                    {act.title}
                  </h3>
                </div>
              </div>

              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                {act.description}
              </p>

              <div className="flex items-center gap-3 pt-6 border-t border-gray-800/50 mt-auto">
                <button
                  onClick={() => setSelectedAct(act)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all font-medium text-sm border border-gray-700"
                >
                  <Book className="w-4 h-4" />
                  Digital Manual
                </button>
                <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 group/btn">
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl flex gap-4 max-w-4xl mx-auto shadow-2xl backdrop-blur-sm">
          <Info className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-300">New Legal Framework Notice</h4>
            <p className="text-sm text-blue-200/70 leading-relaxed">
              The Indian legal system has transitioned to **Bharatiya Nyaya Sanhita (BNS)**, **Bharatiya Nagarik Suraksha Sanhita (BNSS)**, and **Bharatiya Sakshya Adhiniyam (BSA)** as of July 2024. Our AI Assistant is trained on the latest BNS 2023 gazette dataset.
            </p>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {isAIChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 pb-0 md:pb-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsAIChatOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="bg-gray-950 w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-t-3xl md:rounded-3xl border-t md:border border-gray-800 shadow-2xl relative flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">Pro-bono Legal Assistant</h3>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase rounded border border-indigo-500/20">
                        <Languages className="w-2.5 h-2.5" />
                        Multilingual
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Multilingual Voice Support • BNS 2023 GAZETTE</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIChatOpen(false)}
                  className="p-2 hover:bg-gray-800/50 rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shrink-0 ${msg.type === 'user' ? 'bg-indigo-600' : 'bg-blue-600'
                        }`}>
                        {msg.type === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                      </div>
                      <div className={`space-y-2 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl shadow-xl relative group ${msg.type === 'user'
                            ? 'bg-indigo-600/20 border border-indigo-500/30 text-white rounded-tr-none'
                            : 'bg-gray-900 border border-gray-800 text-gray-100 rounded-tl-none'
                          }`}>
                          {msg.type === 'bot' && (
                            <button
                              onClick={() => speakText(msg.content, msg.id)}
                              className={`absolute -right-12 top-0 p-2.5 rounded-xl transition-all border shadow-lg ${isPlaying === msg.id
                                  ? 'bg-blue-600 border-blue-500 text-white animate-pulse'
                                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-blue-400'
                                }`}
                            >
                              {isPlaying === msg.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                          )}

                          <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                            {msg.content.split('\n').map((line, i) => {
                              const parts = line.split(/(\*\*.*?\*\*)/g);
                              return (
                                <p key={i} className="mb-2 last:mb-0">
                                  {parts.map((part, j) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={j} className="text-blue-400 font-bold">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                  })}
                                </p>
                              );
                            })}
                          </div>

                          {msg.metadata?.sections && msg.metadata.sections.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-800/50">
                              {msg.metadata.sections.map((s: any, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400">
                                  <Gavel className="w-3 h-3" />
                                  SEC {s.Section}
                                </div>
                              ))}
                              {msg.metadata.verified && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-[10px] font-bold text-green-400">
                                  <Shield className="w-3 h-3" />
                                  VERIFIED
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-600 uppercase tracking-tighter">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%] items-end">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl rounded-tl-none animate-pulse">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-6 py-2 flex gap-2 overflow-x-auto border-t border-gray-800/30 bg-black/20 no-scrollbar">
                {[
                  "धारा 101 क्या है? (Hindi)",
                  "Murder laws in Marathi",
                  "What is Mob Lynching?",
                  "Explain BNS Section 113",
                  "Cyber Stallking laws"
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setUserInput(s)}
                    className="px-3 py-1.5 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-full text-xs text-gray-400 hover:text-blue-400 transition-all whitespace-nowrap active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-black/40 backdrop-blur-xl border-t border-gray-800">
                <div className="flex gap-3 items-center bg-gray-900/80 border border-gray-800 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-inner">
                  <button className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-500 hover:text-blue-400">
                    <Languages className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask in Hindi, English, Marathi or any language..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-[15px] py-2"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!userInput.trim() || isTyping}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-800 rounded-xl transition-all text-white shadow-lg active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Scale className="w-3 h-3" />
                    Multilingual Legal Awareness
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Volume2 className="w-3 h-3" />
                    AI Voice Enabled
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Digital Manual View Modal */}
      <AnimatePresence>
        {selectedAct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60"
          >
            <div
              className="absolute inset-0"
              onClick={() => setSelectedAct(null)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-gray-950 w-full max-w-5xl h-[85vh] rounded-3xl border border-gray-800 shadow-2xl relative flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                    {selectedAct.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedAct.title}</h3>
                    <p className="text-sm text-gray-400">Digital Reference Manual • {selectedAct.year}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAct(null)}
                  className="p-2 hover:bg-gray-800 rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-thin scrollbar-thumb-gray-800">
                {selectedAct.manual?.chapters.map((chapter, cIdx) => (
                  <div key={cIdx} className="space-y-6">
                    <h4 className="text-xl font-bold text-blue-400 border-b border-blue-500/20 pb-2 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      {chapter.title}
                    </h4>
                    <div className="grid gap-6">
                      {chapter.sections.map((section, sIdx) => (
                        <div key={sIdx} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700 transition-all group">
                          <div className="flex items-start justify-between mb-4">
                            <h5 className="text-lg font-bold text-gray-100 flex items-center gap-3">
                              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-mono border border-blue-500/20">
                                {section.number}
                              </span>
                              {section.title}
                            </h5>
                            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-800 rounded-lg transition-all text-gray-500">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-400 leading-relaxed pl-13">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegalLibraryPage;
