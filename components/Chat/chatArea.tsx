import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import Map from './Map/map';
import MapModal from './Map/mapModal';

interface ChatMessage {
  message: string;
  sender: string;
  direction: 'incoming' | 'outgoing';
  mapData: MapData | null;
}

interface MapData {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: { location: { lat: number; lng: number } }[];
  geofenceCenter: { lat: number; lng: number };
  geofenceRadius: number;
}

export default function BousaiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSpeechRecognitionAvailable, setIsSpeechRecognitionAvailable] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [mapModalData, setMapModalData] = useState<MapData | null>(null);
  const synth = useRef<SpeechSynthesis | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    synth.current = window.speechSynthesis;

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.lang = 'ja-JP';
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          setTranscript(transcript);
        }
      };
      setIsSpeechRecognitionAvailable(true);
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      handleSend(transcript);
      setTranscript('');
    }
  }, [transcript]);

  const handleSend = async (message: string) => {
    const newMessage: ChatMessage = {
      message,
      sender: 'user',
      direction: 'outgoing',
      mapData: null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    // APIルートを通じてVertex AIにリクエスト
    await processMessageToVertexAI([...messages, newMessage]);
  };

  async function processMessageToVertexAI(chatMessages: ChatMessage[]) {
    try {
      const formattedMessages = chatMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message,
      }));

      const response = await axios.post('/api/predict', {
        instances: [
          {
            //content: formattedMessages.map((msg) => msg.content).join('\n'),
          },
        ],
      });

      const vertexAIResponse = response.data.predictions[0].content;
      setIsTyping(false);
 //     displayStreamedText(vertexAIResponse);
    } catch (error) {
      console.error('Error calling Vertex AI API:', error);
      setIsTyping(false);
    }
  }

  const displayStreamedText = (text: string, mapData: MapData | null = null) => {
    let currentText = '';
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        const chunk = text.slice(currentIndex, currentIndex + 1);
        currentText += chunk;
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          lastMessage.message = currentText;
          return [...prev.slice(0, -1), lastMessage];
        });
        currentIndex++;
      } else {
        clearInterval(interval);
        if (mapData) {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            lastMessage.mapData = mapData;
            return [...prev.slice(0, -1), lastMessage];
          });
        }
      }
    }, 50); // 50ミリ秒ごとに1文字ずつ表示
  };

  const toggleListening = () => {
    if (isSpeechRecognitionAvailable && recognition.current) {
      if (listening) {
        recognition.current.stop()
        setListening(false)
      } else {
        recognition.current.start()
        setListening(true)
      }
    }
  }

  return (
    <>
      {/* メッセージ表示部分 */}
      <div className="flex-1 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
        <AnimatePresence>
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`message ${
                message.direction === 'incoming' ? 'text-left' : 'text-right'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.direction === 'incoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
                style={{
                  maxWidth: '60%', // メッセージの横幅を60%に制限
                  wordBreak: 'break-word', // 長い単語を折り返す
                  whiteSpace: 'normal', // 通常のテキスト表示
                  overflowWrap: 'break-word', // テキストが枠を超えたときに折り返す
                  margin: '15px', // メッセージ間にマージンを追加
                }}
              >
                {message.message}
                {message.mapData && (
                  <div className="mt-2">
                    <Map
                      origin={message.mapData.origin}
                      destination={message.mapData.destination}
                      waypoints={message.mapData.waypoints}
                      geofenceCenter={message.mapData.geofenceCenter}
                      geofenceRadius={message.mapData.geofenceRadius}
                      small={true}
                      onClick={() => setMapModalData(message.mapData)}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
  
      {/* チャットボットの入力中インジケータ */}
      {isTyping && (
        <div className="flex items-center text-blue-400 mb-2">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>チャットボットが高度な分析を行っています...</span>
        </div>
      )}
  
      {/* 入力と音声認識ボタン */}
      <div className="relative">
        <input
          type="text"
          placeholder="質問を入力してください..."
          className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
        {isSpeechRecognitionAvailable && (
          <button
            onClick={toggleListening}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
              listening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            } transition-colors duration-300`}
            aria-label={listening ? '音声入力停止' : '音声入力開始'}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </div>
  
      {/* 音声認識中の状態表示 */}
      {listening && (
        <div className="mt-2 text-sm text-blue-300">音声を認識中: {transcript}</div>
      )}
  
      {/* ブラウザが音声認識に対応していない場合 */}
      {!isSpeechRecognitionAvailable && (
        <div className="mt-2 text-sm text-gray-400 text-center">
          お使いのブラウザは高度な音声認識をサポートしていません。テキスト入力をご利用ください。
        </div>
      )}
  
      {/* 地図モーダルの表示 */}
      {mapModalData && (
        <MapModal
          isOpen={mapModalData}
          onClose={() => setMapModalData(null)}
          origin={mapModalData.origin}
          destination={mapModalData.destination}
          waypoints={mapModalData.waypoints}
          geofenceCenter={mapModalData.geofenceCenter}
          geofenceRadius={mapModalData.geofenceRadius}
        />
      )}
    </>
  );
}