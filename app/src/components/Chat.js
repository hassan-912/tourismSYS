'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Chat({ isPreview = false }) {
  const { user, authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadMessages();
    intervalRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const res = isPreview
        ? await fetch('/api/messages')
        : await authFetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.length > messages.length && !isOpen) {
          setUnread(prev => prev + (data.length - messages.length));
        }
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const body = isPreview
        ? { content: input.trim(), isPreview: true, replyTo: replyTo?._id }
        : { content: input.trim(), replyTo: replyTo?._id };

      const res = isPreview
        ? await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await authFetch('/api/messages', {
            method: 'POST',
            body: JSON.stringify(body),
          });

      if (res.ok) {
        setInput('');
        setReplyTo(null);
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleMention = (msgSender) => {
    setInput((prev) => prev + `@${msgSender} `);
    inputRef.current?.focus();
  };
  const inputRef = useRef(null);

  const renderContent = (content) => {
    // Basic mention parsing
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{part}</span>;
      }
      return part;
    });
  };

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
        title="Internal Chat"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>

      {isOpen && (
        <div className="chat-popup" style={{ height: 600, width: 380 }}>
          <div className="chat-header">
            <h3>💬 Internal Chat</h3>
            <button onClick={() => setIsOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="chat-messages" style={{ flex: 1 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.88rem' }}>
                No messages yet. Start the conversation! 🚀
              </div>
            )}
            {messages.map((msg) => {
              const isSelf = isPreview
                ? msg.senderRole === 'manager'
                : msg.sender === user?.name;
              return (
                <div
                  key={msg._id}
                  className={`chat-message ${isSelf ? 'self' : msg.senderRole}`}
                  style={{ marginBottom: 12, position: 'relative' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="chat-message-sender">
                      {msg.sender} <span style={{fontSize: '0.7em', opacity: 0.7}}>({msg.senderRole})</span>
                    </div>
                    {!isSelf && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.75rem' }} onClick={() => handleMention(msg.sender)}>
                          @
                        </button>
                        <button style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.75rem' }} onClick={() => setReplyTo(msg)}>
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.replyTo && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(0,0,0,0.05)', 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      marginBottom: 6,
                      borderLeft: '2px solid var(--primary)',
                      color: 'var(--text-secondary)'
                    }}>
                      Replying to {msg.replyTo.sender}: {msg.replyTo.content.substring(0, 30)}{msg.replyTo.content.length > 30 ? '...' : ''}
                    </div>
                  )}
                  <div>{renderContent(msg.content)}</div>
                  <div className="chat-message-time" style={{ textAlign: isSelf ? 'right' : 'left' }}>{formatTime(msg.createdAt)}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {replyTo && (
            <div style={{ padding: '8px 16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <div>
                Replying to <strong>{replyTo.sender}</strong>
              </div>
              <button 
                onClick={() => setReplyTo(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >✕</button>
            </div>
          )}
          
          <div className="chat-input" >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or use @ to mention..."
            />
            <button onClick={sendMessage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
