"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { HomeIcon, SearchIcon, PlusIcon } from "@/components/ui/Icons";
import {
  getUsers, getUserChats, startChat, getChatMessages, sendChatMessage,
} from "@/lib/api";
import type { ApiUser, ChatRoom, ChatMessage } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const RADIUS = 8;

export default function ChatsDashboard() {
  const router = useRouter();
  const { token, user: me } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [floatOpen, setFloatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!token || !me?.id) return;
    Promise.all([
      getUsers(token).catch(() => [] as ApiUser[]),
      getUserChats(me.id, token).catch(() => [] as ChatRoom[]),
    ]).then(([u, c]) => {
      setUsers(u);
      setChats(c);
      setLoading(false);
    });
  }, [token, me?.id]);

  const otherMembers = activeChat
    ? activeChat.members.filter(m => m.id !== me?.id)
    : [];

  const connected = users.filter(u =>
    u.id !== me?.id && chats.some(c => c.members.some(m => m.id === u.id))
  );
  const disconnected = users.filter(u =>
    u.id !== me?.id && !chats.some(c => c.members.some(m => m.id === u.id))
  );

  const filteredConnected = connected.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.user.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDisconnected = disconnected.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.user.toLowerCase().includes(search.toLowerCase())
  );

  const selectChat = useCallback(async (chat: ChatRoom) => {
    setActiveChat(chat);
    setFloatOpen(false);
    if (!token) return;
    try {
      const msgs = await getChatMessages(chat.id, token);
      setMessages(msgs);
      setTimeout(scrollToBottom, 50);
    } catch {
      setMessages([]);
    }
  }, [token, scrollToBottom]);

  const handleStartChat = useCallback(async (targetUser: ApiUser) => {
    if (!token) return;
    try {
      const chat = await startChat(targetUser.id!, token);
      setChats(prev => {
        const exists = prev.find(c => c.id === chat.id);
        return exists ? prev : [chat, ...prev];
      });
      await selectChat(chat);
    } catch {}
  }, [token, selectChat]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeChat || !token) return;
    const content = input.trim();
    setInput("");
    try {
      const msg = await sendChatMessage(activeChat.id, content, token);
      setMessages(prev => [...prev, msg]);
      setTimeout(scrollToBottom, 50);
      setChats(prev => prev.map(c =>
        c.id === activeChat.id
          ? { ...c, lastMessage: { text: content, createdAt: new Date().toISOString(), userFK: me?.id! } }
          : c
      ));
    } catch {}
  }, [input, activeChat, token, me?.id, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Hoy";
    if (d.toDateString() === yesterday.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function shouldShowDayDivider(current: string, previous?: string): boolean {
    if (!previous) return true;
    const c = new Date(current);
    const p = new Date(previous);
    return c.toDateString() !== p.toDateString();
  }

  if (loading) {
    return (
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center", height: "80vh",
        color: "var(--text-50)", fontSize: 14,
      }}>
        Cargando chats...
      </div>
    );
  }

  const wrapStyle: React.CSSProperties = {
    display: "flex",
    height: 580,
    borderRadius: 16,
    overflow: "hidden",
    border: "0.5px solid var(--border-light)",
    background: "var(--card-bg)",
  };

  const s: Record<string, React.CSSProperties> = {
    sidebar: {
      width: 260, minWidth: 260,
      background: "var(--surface)",
      borderRight: "0.5px solid var(--border-light)",
      display: "flex", flexDirection: "column",
    },
    sbSearch: {
      margin: "10px 12px",
      background: "var(--card-bg)",
      border: "0.5px solid var(--border-light)",
      borderRadius: RADIUS,
      display: "flex", alignItems: "center", gap: 6,
      padding: "6px 10px",
    },
    section: {
      padding: "8px 14px 4px",
      fontSize: 11,
      color: "var(--text-35)",
      fontWeight: 500,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    friend: {
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 14px", cursor: "pointer",
      transition: "background 0.1s",
    },
    avatar: {
      width: 36, height: 36, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 500,
      position: "relative" as const, flexShrink: 0,
    },
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      padding: 20, boxSizing: "border-box",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingBottom: 14, borderBottom: "1px solid var(--border-light)", marginBottom: 20,
      }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--body-text)" }}>
          Chats — Meetr
        </h1>
        <button
          aria-label="Ir al inicio"
          onClick={() => router.push("/")}
          style={{
            width: 42, height: 42, borderRadius: 12,
            border: "0.5px solid var(--border-light)",
            background: "var(--surface)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-50)", fontSize: 18,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <HomeIcon size={18} />
        </button>
      </div>

      <div style={{
        ...wrapStyle, flex: 1, height: "auto",
        maxHeight: "calc(100vh - 100px)",
      }}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={{
            padding: 16, borderBottom: "0.5px solid var(--border-light)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--body-text)" }}>Amigos</span>
          </div>

          <div style={s.sbSearch}>
            <SearchIcon size={14} />
            <input
              type="text" placeholder="Buscar amigos…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                background: "none", border: "none", outline: "none",
                fontSize: 13, color: "var(--body-text)", width: "100%",
              }}
            />
          </div>

          <div style={s.section}>Conectados</div>
          {filteredConnected.length === 0 && (
            <div style={{ padding: "8px 14px", fontSize: 12, color: "var(--text-35)" }}>
              {search ? "Sin resultados" : "Sin chats activos"}
            </div>
          )}
          {filteredConnected.map(u => {
            const chat = chats.find(c => c.members.some(m => m.id === u.id));
            const isActive = activeChat?.id === chat?.id;
            return (
              <div
                key={u.id}
                className="friend"
                style={{
                  ...s.friend,
                  background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
                }}
                onClick={() => chat && selectChat(chat)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--card-bg)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={s.avatar}>
                  <img
                    src={u.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
                    alt={u.name}
                    style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div style={{
                    width: 9, height: 9, borderRadius: "50%",
                    position: "absolute", bottom: 1, right: 1,
                    border: "2px solid var(--surface)",
                    background: "#22c55e",
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: isActive ? "#c4b5fd" : "var(--body-text)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{u.name}</div>
                  <div style={{
                    fontSize: 11, color: "var(--text-50)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {chat?.lastMessage?.text ?? "Sin mensajes"}
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ ...s.section, marginTop: 4 }}>Desconectados</div>
          {filteredDisconnected.map(u => (
            <div
              key={u.id}
              style={s.friend}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--card-bg)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              onClick={() => handleStartChat(u)}
            >
              <div style={s.avatar}>
                <img
                  src={u.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
                  alt={u.name}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{
                  width: 9, height: 9, borderRadius: "50%",
                  position: "absolute", bottom: 1, right: 1,
                  border: "2px solid var(--surface)",
                  background: "var(--text-35)",
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: "var(--body-text)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{u.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-50)" }}>@{u.user}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Panel */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          background: "var(--card-bg)",
          borderLeft: "none",
        }}>
          {!activeChat ? (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-35)", fontSize: 13,
            }}>
              Seleccioná un amigo para chatear
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: "14px 20px",
                borderBottom: "0.5px solid var(--border-light)",
                display: "flex", alignItems: "center", gap: 12,
                background: "var(--card-bg)",
              }}>
                <img
                  src={otherMembers[0]?.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
                  alt={otherMembers[0]?.name ?? "Usuario"}
                  style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--body-text)" }}>
                    {otherMembers[0]?.name ?? "Usuario"}
                  </div>
                  <div style={{ fontSize: 11, color: "#22c55e" }}>En línea</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto",
                padding: "20px 20px 12px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {messages.length === 0 && (
                  <div style={{
                    textAlign: "center", color: "var(--text-35)", fontSize: 12, marginTop: 40,
                  }}>
                    No hay mensajes todavía. Enviá el primero.
                  </div>
                )}
                {messages.map((msg, idx) => {
                  const isMine = msg.userFK === me?.id;
                  const showDivider = shouldShowDayDivider(
                    msg.createdAt, messages[idx - 1]?.createdAt
                  );
                  return (
                    <div key={msg.id}>
                      {showDivider && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 10, margin: "8px 0",
                        }}>
                          <div style={{ flex: 1, height: "0.5px", background: "var(--border-light)" }} />
                          <span style={{ fontSize: 11, color: "var(--text-35)" }}>
                            {formatDate(msg.createdAt)}
                          </span>
                          <div style={{ flex: 1, height: "0.5px", background: "var(--border-light)" }} />
                        </div>
                      )}
                      <div style={{
                        display: "flex", gap: 8,
                        maxWidth: "75%",
                        alignItems: "flex-end",
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        flexDirection: isMine ? "row-reverse" : "row",
                      }}>
                        {!isMine && (
                          <img
                            src={msg.user.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80"}
                            alt={msg.user.name}
                            style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          />
                        )}
                        <div>
                          <div style={{
                            padding: "9px 13px",
                            borderRadius: 14,
                            fontSize: 13,
                            lineHeight: 1.5,
                            background: isMine ? "#8B5CF6" : "var(--surface)",
                            color: isMine ? "#fff" : "var(--body-text)",
                            borderBottomLeftRadius: isMine ? 14 : 4,
                            borderBottomRightRadius: isMine ? 4 : 14,
                          }}>
                            {msg.text}
                          </div>
                          <div style={{
                            fontSize: 10,
                            color: "var(--text-35)",
                            marginTop: 2,
                            textAlign: isMine ? "right" : "left",
                          }}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div style={{
                padding: "12px 16px",
                borderTop: "0.5px solid var(--border-light)",
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--card-bg)",
              }}>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setFloatOpen(!floatOpen)}
                    style={{
                      width: 36, height: 36, borderRadius: RADIUS,
                      border: "0.5px solid var(--border-light)",
                      background: "transparent", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-50)", flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <PlusIcon size={16} />
                  </button>

                  {floatOpen && (
                    <div style={{
                      position: "absolute", bottom: 48, left: 0,
                      background: "var(--card-bg)",
                      border: "0.5px solid var(--border-light)",
                      borderRadius: 12, padding: 6,
                      display: "flex", flexDirection: "column", gap: 2,
                      width: 160, zIndex: 10,
                    }}>
                      {[
                        { type: "foto", label: "Foto", color: "#a78bfa" },
                        { type: "video", label: "Video", color: "#c4b5fd" },
                        { type: "archivo", label: "Archivo", color: "var(--text-50)" },
                      ].map(item => (
                        <div
                          key={item.type}
                          onClick={() => setFloatOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 10px", borderRadius: RADIUS,
                            cursor: "pointer", fontSize: 13,
                            color: "var(--body-text)",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <span style={{ fontSize: 14 }}>{item.type === "foto" ? "📷" : item.type === "video" ? "🎥" : "📎"}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                  placeholder="Escribí un mensaje…"
                  style={{
                    flex: 1,
                    background: "var(--surface)",
                    border: "0.5px solid var(--border-light)",
                    borderRadius: 20,
                    padding: "8px 14px",
                    fontSize: 13,
                    color: "var(--body-text)",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />

                <button
                  onClick={handleSend}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#8B5CF6", border: "none",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
