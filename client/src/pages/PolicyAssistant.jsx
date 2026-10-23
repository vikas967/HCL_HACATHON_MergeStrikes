import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import ChatInterface from '../components/ChatInterface.jsx';
import api from '../services/api.js';

export default function PolicyAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function ask(text) {
    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await api.post('/ai/policies/ask', { question: text });
      setMessages([
        ...next,
        {
          role: 'assistant',
          render: <PolicyAnswer answer={res.data.answer} sources={res.data.sources} fallback={res.data.fallback} />,
        },
      ]);
    } catch (e) {
      setMessages([...next, { role: 'system', text: e.response?.data?.error || 'Policy assistant unavailable.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
          <FileText className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy-900">Policy Assistant</h1>
          <p className="text-xs text-navy-500">
            Answers come from approved policy documents only, with source citations.
          </p>
        </div>
      </div>
      <ChatInterface
        messages={messages}
        onSend={ask}
        loading={loading}
        placeholder='e.g. "Can I return an opened laptop?"'
        examples={[
          'Can I return an opened laptop?',
          'What is the refund timeline for UPI payments?',
          'How long is the warranty on phones?',
          'Do you ship to tier-2 cities?',
          'What is not covered under warranty?',
        ]}
      />
    </div>
  );
}

function PolicyAnswer({ answer, sources, fallback }) {
  return (
    <div className="space-y-3">
      {fallback && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          AI generation is in fallback mode — showing the most relevant policy excerpts.
        </div>
      )}
      <p className="whitespace-pre-wrap">{answer}</p>
      {sources?.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-navy-100 pt-2">
          <div className="text-xs font-semibold text-navy-500 uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Sources
          </div>
          {sources.map((s) => (
            <div key={s.index} className="text-xs text-navy-700">
              <strong>[{s.index}]</strong> {s.title} — <em>{s.docType}</em>, v{s.version}
              {s.section && <> · section: {s.section}</>}
              {s.effectiveDate && <> · effective {new Date(s.effectiveDate).toLocaleDateString()}</>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
