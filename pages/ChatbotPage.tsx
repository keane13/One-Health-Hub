import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import Header from '../components/Header';
import { LogoIcon, LoadingSpinner } from '../components/icons/UiIcons';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.6.0/build/pdf.worker.mjs`;

interface Document {
  name: string;
  content: string;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Halo! Saya Asisten AI One Health. Unggah dokumen di sebelah kiri untuk memberi saya basis pengetahuan, lalu ajukan pertanyaan tentang isinya.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
        try {
            let fileContent = '';
            const extension = file.name.split('.').pop()?.toLowerCase();
            
            if (extension === 'pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const textPromises = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    textPromises.push(pdf.getPage(i).then(page => page.getTextContent()));
                }
                const pages = await Promise.all(textPromises);
                fileContent = pages.map(page => page.items.map(s => (s as any).str).join(' ')).join('\n');

            } else if (extension === 'docx' || extension === 'doc') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                fileContent = result.value;
            } else { // txt, md, csv
                fileContent = await file.text();
            }
            
            setDocuments(prev => [...prev, { name: file.name, content: fileContent.trim() }]);
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            // Optionally, set an error state to show in the UI
        }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const removeDocument = (indexToRemove: number) => {
    setDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleAddLink = () => {
    if (linkInput.trim()) {
        try {
            new URL(linkInput); // Basic URL validation
            setLinks(prev => [...prev, linkInput.trim()]);
            setLinkInput('');
        } catch (_) {
            alert('Silakan masukkan URL yang valid.');
        }
    }
  };

  const handleRemoveLink = (indexToRemove: number) => {
    setLinks(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const docContext = documents.map(doc => `Nama File: ${doc.name}\n\n${doc.content}`).join('\n\n---\n\n');
      const linkContext = links.length > 0 ? `Tautan Referensi:\n${links.map(link => `- ${link}`).join('\n')}` : '';
      
      let fullContext = '';
      if (docContext) {
          fullContext += `Konten Dokumen:\n${docContext}`;
      }
      if (linkContext) {
          if (fullContext) fullContext += '\n\n---\n\n';
          fullContext += linkContext;
      }

      const botResponse = await getChatbotResponse(messages, input, fullContext);
      setMessages((prev) => [...prev, { role: 'model', text: botResponse }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', text: 'Maaf, terjadi kesalahan. Coba lagi nanti.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header showBackButton={true} />
      <div className="flex-1 flex overflow-hidden">
        {/* Knowledge Base Panel */}
        <aside className="w-1/3 max-w-sm bg-gray-800/50 p-4 border-r border-gray-700 overflow-y-auto flex flex-col">
          <h2 className="text-xl font-bold text-white mb-4">Basis Pengetahuan</h2>
          <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-green-500 bg-gray-700/50' : 'border-gray-600 hover:border-green-500'}`}>
            <input {...getInputProps()} />
            <p className="text-gray-400 text-sm">Seret & lepas file, atau klik untuk memilih (.txt, .md, .csv, .pdf, .docx)</p>
          </div>
          <div className="mt-4 space-y-2 flex-grow">
            {documents.length > 0 ? (
              documents.map((doc, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded text-sm animate-fade-in">
                  <span className="text-gray-200 truncate pr-2">{doc.name}</span>
                  <button onClick={() => removeDocument(index)} className="text-red-400 hover:text-red-300 font-bold">&times;</button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 pt-8">
                  <p>Tidak ada dokumen yang diunggah.</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-bold text-white mb-3">Tautan Referensi</h3>
              <div className="flex gap-2">
                  <input 
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                      placeholder="https://example.com"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <button 
                      onClick={handleAddLink}
                      className="bg-green-500 text-white rounded-md px-3 hover:bg-green-600 transition-colors text-sm font-semibold"
                  >
                      Tambah
                  </button>
              </div>
              <div className="mt-4 space-y-2">
                  {links.map((link, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded text-sm animate-fade-in">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate pr-2">{link}</a>
                          <button onClick={() => handleRemoveLink(index)} className="text-red-400 hover:text-red-300 font-bold">&times;</button>
                      </div>
                  ))}
              </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 my-4 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && <div className="p-2 rounded-full bg-green-500/20"><LogoIcon className="w-6 h-6 text-green-400"/></div>}
                  <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 my-4 animate-fade-in">
                    <div className="p-2 rounded-full bg-green-500/20"><LogoIcon className="w-6 h-6 text-green-400"/></div>
                    <div className="max-w-lg px-4 py-3 rounded-2xl bg-gray-800 text-gray-300 rounded-bl-none flex items-center">
                        <div className="dot-flashing"></div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>
          <footer className="bg-gray-900/50 border-t border-gray-700/50 p-4 md:p-6 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center bg-gray-800 rounded-lg p-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ketik pertanyaan Anda di sini..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-green-500 text-white rounded-md p-2 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <LoadingSpinner /> : 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  }
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <style>{`
        .dot-flashing {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }
        @keyframes dot-flashing {
          0% { background-color: #6b7280; }
          50%, 100% { background-color: #d1d5db; }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatbotPage;