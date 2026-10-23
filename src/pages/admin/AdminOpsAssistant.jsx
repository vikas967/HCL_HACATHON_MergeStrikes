import { useState } from 'react';
import { Bot } from 'lucide-react';
import ChatInterface from '../../components/ChatInterface.jsx';
import api from '../../services/api.js';

export default function AdminOpsAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function ask(text) {
    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await api.post('/admin/ai/operations-assistant', { question: text });
      setMessages([
        ...next,
        {
          role: 'assistant',
          render: (
            <div className="space-y-2">
              {res.data.fallback && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
                  Fallback mode — Gemini unavailable
                </div>
              )}
              <p className="whitespace-pre-wrap">{res.data.answer}</p>
              {res.data.metrics?.topRestockPriorities?.length > 0 && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-navy-500">View underlying metrics</summary>
                  <pre className="mt-2 bg-navy-900 text-navy-100 rounded-lg p-3 overflow-x-auto text-[11px]">
                    {JSON.stringify(res.data.metrics, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ),
        },
      ]);
    } catch (e) {
      setMessages([...next, { role: 'system', text: e.response?.data?.error || 'Ops assistant unavailable.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
          <Bot className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy-900">Operations AI Assistant</h1>
          <p className="text-xs text-navy-500">Grounded in live inventory, batches, and forecasts.</p>
        </div>
      </div>
      <ChatInterface
        messages={messages}
        onSend={ask}
        loading={loading}
        placeholder='e.g. "Which products should we restock first?"'
        examples={[
          'Which products should we restock first?',
          'Which warehouses have the most low-stock items?',
          'Which batches are expiring soon?',
          'Suggest a promotion for slow-moving inventory',
        ]}
      />
    </div>
  );
}
