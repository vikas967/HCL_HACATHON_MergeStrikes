import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

export default function ChatInterface({ onSend, loading, messages = [], placeholder = 'Ask anything…', examples = [] }) {
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  function submit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  }

  return (
    <div className="card flex flex-col h-[70vh] min-h-[500px] max-h-[800px]">
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-navy-500">
            <Sparkles className="w-10 h-10 mx-auto text-accent-400 mb-2" />
            <p className="font-medium text-navy-700">Start a conversation</p>
            {examples.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => onSend(ex)}
                    className="btn-outline text-xs text-left"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === 'user'
                  ? 'bg-navy-800 text-white'
                  : m.role === 'system'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-navy-900'
              }`}
            >
              {m.render ? m.render : <div className="whitespace-pre-wrap">{m.text}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-navy-700 rounded-2xl px-4 py-3 text-sm inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>
      <form onSubmit={submit} className="border-t border-navy-100 p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="input"
          disabled={loading}
        />
        <button className="btn-primary" disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}
