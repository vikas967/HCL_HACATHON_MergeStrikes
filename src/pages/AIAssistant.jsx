import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Star, ShoppingBag } from 'lucide-react';
import api from '../services/api.js';
import ChatInterface from '../components/ChatInterface.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function AIAssistant() {
  const [params] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  async function ask(text) {
    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await api.post('/ai/shopping-assistant', { query: text });
      const { intent, matches, clarifyingQuestion, geminiAvailable } = res.data;
      if (clarifyingQuestion) {
        setMessages([...next, { role: 'assistant', text: clarifyingQuestion }]);
      } else {
        setMessages([
          ...next,
          {
            role: 'assistant',
            render: (
              <AssistantResult
                intent={intent}
                matches={matches}
                geminiAvailable={geminiAvailable}
                onAdd={(pid) => addItem(pid)}
              />
            ),
          },
        ]);
      }
    } catch (e) {
      setMessages([
        ...next,
        {
          role: 'system',
          text:
            e.response?.data?.error ||
            'Something went wrong. Try again or browse the catalog directly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const seed = params.get('q');
    if (seed) ask(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy-900">AI Shopping Assistant</h1>
          <p className="text-xs text-navy-500">Describe what you need — budget, purpose, preferences.</p>
        </div>
      </div>
      <ChatInterface
        messages={messages}
        onSend={ask}
        loading={loading}
        placeholder='e.g. "laptop under ₹70,000 for Java and AI projects"'
        examples={[
          'I need a laptop under ₹70,000 for Java development and beginner AI projects.',
          'Suggest comfortable running shoes under ₹3,000',
          'Washing machine for a family of four',
          'Best headphones for travel, under ₹5,000',
        ]}
      />
    </div>
  );
}

function AssistantResult({ intent, matches, geminiAvailable, onAdd }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-navy-500">
        Interpreted as:{' '}
        {intent.category && <span className="badge bg-navy-100 text-navy-700 mr-1">{intent.category}</span>}
        {intent.maxPrice && <span className="badge bg-navy-100 text-navy-700 mr-1">under ₹{intent.maxPrice}</span>}
        {(intent.useCases || []).map((u) => (
          <span key={u} className="badge bg-accent-100 text-accent-700 mr-1">{u}</span>
        ))}
      </div>
      {!geminiAvailable && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          AI explanations are on fallback mode — results come from catalogue filter.
        </div>
      )}
      {matches.length === 0 ? (
        <div className="text-navy-500 text-sm">No close matches found. Try adjusting budget or preferences.</div>
      ) : (
        <div className="grid gap-2">
          {matches.map((m) => (
            <div key={m.product._id} className="bg-white border border-navy-100 rounded-xl p-3 flex gap-3">
              <Link to={`/product/${m.product._id}`} className="w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <img src={m.product.image} alt={m.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-navy-500">{m.product.brand}</div>
                <Link to={`/product/${m.product._id}`} className="font-semibold text-navy-900 line-clamp-2">
                  {m.product.name}
                </Link>
                <div className="flex items-center gap-2 text-xs text-navy-600 mt-1">
                  <span className="inline-flex items-center gap-1 text-accent-700">
                    <Star className="w-3 h-3 fill-accent-500 stroke-accent-500" /> {m.product.rating?.toFixed(1)}
                  </span>
                  <span className="text-navy-400">·</span>
                  <span>₹{m.product.price.toLocaleString('en-IN')}</span>
                  <span className="text-navy-400">·</span>
                  <span className="text-navy-500">{m.availableStock} in stock</span>
                </div>
                <div className="text-xs text-navy-600 mt-1 italic">{m.explanation}</div>
              </div>
              <button onClick={() => onAdd(m.product._id)} className="btn-primary text-xs self-start">
                <ShoppingBag className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
