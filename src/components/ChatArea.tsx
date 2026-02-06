import { useState, useEffect, useRef, useCallback } from 'react';
import { Hash, Users, Loader2, MessageSquareOff, Link, Check, Globe, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { translateMessage } from '../lib/translate';
import { t } from '../lib/i18n';
import type { LanguageCode } from '../lib/languages';
import type { Room, Message, Profile, MessageWithSender } from '../types';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

interface ChatAreaProps {
  roomId: string;
  locale: LanguageCode;
}

export default function ChatArea({ roomId, locale }: ChatAreaProps) {
  const { user, profile } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const profileRef = useRef(profile);

  // Keep profile ref updated
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const translateAndUpdate = useCallback(
    async (msg: MessageWithSender, userLang: string) => {
      if (msg.source_language === userLang) return;

      setTranslatingIds((prev) => new Set(prev).add(msg.id));

      const translated = await translateMessage(
        msg.id,
        msg.content,
        msg.source_language,
        userLang
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, translation: translated } : m))
      );
      setTranslatingIds((prev) => {
        const next = new Set(prev);
        next.delete(msg.id);
        return next;
      });
    },
    [setMessages, setTranslatingIds]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      setLoading(true);
      setMessages([]);

      const [roomRes, membersRes, messagesRes] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).maybeSingle(),
        supabase.from('room_members').select('user_id').eq('room_id', roomId),
        supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })
          .limit(100),
      ]);

      if (cancelled) return;

      setRoom(roomRes.data);
      setMemberCount(membersRes.data?.length ?? 0);

      const memberIds = membersRes.data?.map((m) => m.user_id) ?? [];
      if (memberIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds);

        if (!cancelled && profileData) {
          const profileMap = new Map(profileData.map((p) => [p.id, p]));
          setProfiles(profileMap);
        }
      }

      const msgs: MessageWithSender[] = (messagesRes.data ?? []).map((m) => ({
        ...m,
        sender: profiles.get(m.sender_id) ?? undefined,
      }));

      if (!cancelled) {
        setMessages(msgs);
        setLoading(false);
        setTimeout(scrollToBottom, 100);

        const userLang = profile?.preferred_language || 'en';
        msgs.forEach((msg) => {
          if (msg.source_language !== userLang) {
            translateAndUpdate(msg, userLang);
          }
        });
      }
    }

    loadRoom();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        sender: profiles.get(m.sender_id) ?? m.sender,
      }))
    );
  }, [profiles]);

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          setMemberCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          setMemberCount((prev) => Math.max(0, prev - 1));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          // Fetch sender profile
          const { data: senderData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMsg.sender_id)
            .maybeSingle();

          if (senderData) {
            setProfiles((prev) => new Map(prev).set(senderData.id, senderData));
          }

          const msgWithSender: MessageWithSender = {
            ...newMsg,
            sender: senderData ?? undefined,
          };

          setMessages((prev) => [...prev, msgWithSender]);
          setTimeout(scrollToBottom, 50);

          const userLang = profileRef.current?.preferred_language || 'en';
          if (newMsg.source_language !== userLang) {
            translateAndUpdate(msgWithSender, userLang);
          }
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, displayName } = payload.payload as {
          userId: string;
          displayName: string;
        };
        if (userId === user?.id) return;

        setTypingUsers((prev) => new Map(prev).set(userId, displayName));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.delete(userId);
            return next;
          });
        }, 3000);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active for room:', roomId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for room:', roomId);
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id]);

  const handleSend = async (content: string) => {
    if (!user || !profile) return;

    await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: user.id,
      content,
      source_language: profile.preferred_language,
    });
  };

  const handleTyping = () => {
    if (!channelRef.current || !user || !profile) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        displayName: profile.display_name,
      },
    });
  };

  const typingNames = Array.from(typingUsers.values());

  const handleCopyInviteCode = async () => {
    if (!room?.invite_code) return;
    await navigator.clipboard.writeText(room.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <Hash className="w-4.5 h-4.5 text-slate-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                {room?.name || '...'}
              </h2>
              {room && (
                room.is_public
                  ? <Globe className="w-3.5 h-3.5 text-slate-400" />
                  : <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            {room?.description && (
              <p className="text-xs text-slate-500 truncate max-w-md">
                {room.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            <span>
              {memberCount} {t('chat.members', locale)}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowInvite(!showInvite)}
              className={`p-2 rounded-lg transition-colors ${
                showInvite ? 'bg-teal-50 text-teal-600' : 'hover:bg-slate-100 text-slate-400'
              }`}
              title={t('invite.code', locale)}
            >
              <Link className="w-4 h-4" />
            </button>
            {showInvite && room && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-10 animate-in">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  {t('invite.code', locale)}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono tracking-wider text-slate-800">
                    {room.invite_code}
                  </code>
                  <button
                    onClick={handleCopyInviteCode}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      copied
                        ? 'bg-teal-50 text-teal-600'
                        : 'hover:bg-slate-100 text-slate-400'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {copied ? t('invite.copied', locale) : t('invite.share', locale)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquareOff className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">{t('chat.noMessages', locale)}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === user?.id}
                userLanguage={locale}
                isTranslating={translatingIds.has(msg.id)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {typingNames.length > 0 && (
        <div className="px-6 py-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {typingNames.join(', ')} {t('chat.typing', locale)}
            </span>
          </div>
        </div>
      )}

      <MessageComposer
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!user || loading}
        locale={locale}
      />
    </div>
  );
}
