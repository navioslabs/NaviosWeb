/**
 * ============================================
 * NaviOs MVP - Phase 1 UI Prototype (Improved)
 * ============================================
 * 
 * 改善点:
 * 1. Pulseページにアニメーションを追加
 * 2. 「Pulseで検索」→「NaviOs AI」に文言変更
 * 3. ヘッダーのログインアイコンを削除（マイページに統一）
 * 4. マイページにモックデータを追加
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, X, Clock, Navigation, Package, Calendar, 
  HandHelping, Building2, ChevronUp, ChevronDown, Locate,
  MessageCircle, Share2, ChevronLeft, Send,
  CheckCircle, AlertCircle, Users, Sparkles, Gift,
  Flame, Bell, User, Hand,
  Home, Search, Zap, Loader, ArrowRight, ChevronRight,
  TrendingUp, History, Star, Heart, Map, Camera, Image, 
  ToggleLeft, ToggleRight, Coins, FileText, Settings, LogOut,
  Edit3, MapPinned, Shield
} from 'lucide-react';


// ============================================
// 1. 定数
// ============================================

const categories = [
  { id: 'all', label: 'すべて', icon: Sparkles, color: 'bg-slate-700' },
  { id: 'stock', label: '物資', icon: Package, color: 'bg-emerald-500' },
  { id: 'event', label: 'イベント', icon: Calendar, color: 'bg-amber-500' },
  { id: 'help', label: '近助', icon: HandHelping, color: 'bg-rose-500' },
  { id: 'admin', label: '行政', icon: Building2, color: 'bg-violet-500' },
];

const getCategoryInfo = (id) => categories.find(c => c.id === id) || categories[0];

const formatDistance = (m) => m < 1000 ? `${m}m` : `${(m/1000).toFixed(1)}km`;
const getWalkTime = (m) => `徒歩${Math.ceil(m/80)}分`;

const pulseSearch = (query, posts) => {
  const keywords = query.toLowerCase().split(/\s+/);
  return posts.map(post => {
    const text = `${post.title} ${post.content} ${post.category}`.toLowerCase();
    let score = 0;
    keywords.forEach(kw => {
      if (text.includes(kw)) score += 30;
      if (post.title.toLowerCase().includes(kw)) score += 20;
    });
    if (post.distance < 300) score += 20;
    else if (post.distance < 500) score += 10;
    if (post.urgency === 'high') score += 10;
    return { ...post, matchScore: Math.min(score, 100) };
  }).filter(p => p.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
};


// ============================================
// 2. モックデータ
// ============================================

const users = {
  'user_001': { displayName: '田中商店', verified: true, avatar: '田', phone: '099-123-4567' },
  'user_002': { displayName: '地域サバイバル部', verified: true, avatar: 'サ', phone: null },
  'user_003': { displayName: '山田よしこ', verified: false, avatar: '山', phone: '090-1234-5678' },
  'user_004': { displayName: '伊集院役所', verified: true, avatar: '役', phone: '099-248-1111' },
  'user_005': { displayName: 'Bスーパー', verified: true, avatar: 'B', phone: '099-234-5678' },
  'user_006': { displayName: '佐藤たけし', verified: false, avatar: '佐', phone: null },
};

// ログインユーザー（モック）
const currentUser = {
  id: 'user_current',
  displayName: '田中太郎',
  email: 'tanaka@example.com',
  avatar: '田',
  verified: true,
  bio: '伊集院町で八百屋をやっています。新鮮な野菜をお届け！',
  phone: '090-1234-5678',
  location: '伊集院町在住',
  stats: {
    posts: 12,
    helped: 5,
    comments: 28
  }
};

// ログインユーザーの投稿（モック）
const myPosts = [
  {
    id: 101,
    category: 'stock',
    title: '卵入荷しました（残り少）',
    time: '30分前',
    status: 'active',
    views: 45,
    comments: 6
  },
  {
    id: 102,
    category: 'help',
    title: '薪運びを手伝ってください',
    time: '2日前',
    status: 'active',
    views: 89,
    comments: 12
  },
  {
    id: 103,
    category: 'event',
    title: '朝市のお知らせ',
    time: '1週間前',
    status: 'ended',
    views: 234,
    comments: 45
  }
];

const postsData = [
  {
    id: 1,
    category: 'stock',
    title: '卵入荷しました（残り少）',
    content: '本日朝入荷しました。地元養鶏場の新鮮卵です。お一人様2パックまで。',
    distance: 350,
    time: '30分前',
    authorId: 'user_001',
    urgency: 'high',
    stockStatus: '残りわずか',
    price: '¥280/パック',
    spotName: '田中商店',
    spotAddress: '伊集院町徳重1丁目',
    images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop']
  },
  {
    id: 2,
    category: 'event',
    title: '家庭菜園はじめよう講座',
    content: 'プランターでできる野菜づくりの基礎を学びます。初心者大歓迎！',
    distance: 600,
    time: '2時間前',
    authorId: 'user_002',
    eventDate: '3/9（日）10:00〜',
    participants: 8,
    maxParticipants: 15,
    fee: '無料',
    spotName: '伊集院公民館',
    spotAddress: '伊集院町徳重',
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop']
  },
  {
    id: 3,
    category: 'help',
    title: '薪運びを手伝ってください',
    content: '裏山の薪を自宅まで運びたいです。お礼に野菜をお渡しします。',
    distance: 200,
    time: '1時間前',
    authorId: 'user_003',
    urgency: 'medium',
    reward: '自家製野菜',
    estimatedTime: '30分〜1時間',
    spotName: '山田さん宅付近',
    spotAddress: '伊集院町下谷口',
    images: []
  },
  {
    id: 4,
    category: 'admin',
    title: '燃料費高騰対策給付金',
    content: '対象世帯に5,000円を給付します。届いたハガキと本人確認書類をお持ちください。',
    distance: 800,
    time: '今朝',
    authorId: 'user_004',
    urgency: 'high',
    deadline: '3/15（金）17:00',
    requirements: ['届いたハガキ', '本人確認書類', '振込口座がわかるもの'],
    spotName: '日置市役所',
    spotAddress: '伊集院町郡1丁目',
    images: []
  },
  {
    id: 5,
    category: 'stock',
    title: '灯油 特価販売中',
    content: '18L 1,800円（通常1,980円）。配達も承ります。',
    distance: 1200,
    time: '3時間前',
    authorId: 'user_005',
    stockStatus: '在庫あり',
    price: '¥1,800/18L',
    spotName: 'Bスーパー',
    spotAddress: '伊集院町猪鹿倉',
    images: []
  },
  {
    id: 6,
    category: 'help',
    title: '【お裾分け】大根たくさん採れました',
    content: '大根が豊作で食べきれません。1人2本まで。',
    distance: 250,
    time: '4時間前',
    authorId: 'user_006',
    helpType: 'share',
    shareItem: '大根（1人2本まで）',
    spotName: '佐藤さん宅',
    spotAddress: '伊集院町下谷口',
    images: ['https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&h=300&fit=crop']
  },
  {
    id: 7,
    category: 'event',
    title: '防災訓練・避難経路確認',
    content: '参加者には非常食セットをプレゼント！',
    distance: 900,
    time: '5時間前',
    authorId: 'user_002',
    eventDate: '3/10（月）9:00〜',
    participants: 23,
    maxParticipants: 50,
    fee: '無料',
    spotName: '妙円寺公園',
    spotAddress: '伊集院町徳重',
    images: []
  },
  {
    id: 8,
    category: 'stock',
    title: '春キャベツ・新玉ねぎ入荷',
    content: '地元農家さんの春野菜。キャベツ1玉150円。',
    distance: 450,
    time: '6時間前',
    authorId: 'user_001',
    stockStatus: '在庫あり',
    price: '¥150〜',
    spotName: 'JA直売所',
    spotAddress: '伊集院町徳重2丁目',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&h=300&fit=crop'
    ]
  },
];

const allComments = [
  { id: 1, authorId: 'user_006', text: '明日の午前なら手伝えます！軽トラも出せます。', time: '10分前', canHelp: true },
  { id: 2, authorId: 'user_005', text: '軽トラ出せますよ🚛 何時頃がいいですか？', time: '25分前', canHelp: true },
  { id: 3, authorId: 'user_001', text: '何時頃がご希望ですか？うちの息子も手伝えるかも。', time: '30分前', canHelp: false },
  { id: 4, authorId: 'user_002', text: '私も参加できます！道具は持っていきましょうか？', time: '45分前', canHelp: true },
  { id: 5, authorId: 'user_004', text: '役所からも応援出せるかもしれません。確認します。', time: '1時間前', canHelp: false },
  { id: 6, authorId: 'user_006', text: '友人も誘ってみます！', time: '2時間前', canHelp: true },
];

const trendingPosts = [
  { id: 101, category: 'event', title: '餅つき大会', spotName: '妙円寺公園', distance: 400, time: '今日 14:00〜', comments: 23, likes: 45, isToday: true, isTrending: true },
  { id: 102, category: 'stock', title: '年末セール 全品20%OFF', spotName: 'Bスーパー', distance: 1200, time: '今日限り', comments: 12, likes: 38, isToday: true, isTrending: true },
  { id: 103, category: 'help', title: '雪かきボランティア募集', spotName: '伊集院駅前', distance: 300, time: '今日 8:00〜', comments: 31, likes: 67, isToday: true, isTrending: true },
];

const pastHotPosts = [
  { id: 201, category: 'event', title: '夏祭り盆踊り大会', spotName: '妙円寺公園', time: '2024/8/15', comments: 89, likes: 234, participants: 150 },
  { id: 202, category: 'help', title: '台風19号 復旧ボランティア', spotName: '伊集院町全域', time: '2024/9/22', comments: 156, likes: 412, participants: 80 },
  { id: 203, category: 'event', title: '新春もちつき大会', spotName: '伊集院公民館', time: '2024/1/3', comments: 67, likes: 189, participants: 120 },
  { id: 204, category: 'stock', title: '農家直売フェア', spotName: 'JA直売所', time: '2024/11/23', comments: 45, likes: 167, participants: null },
];

const pinPositions = [
  { top: '22%', left: '25%' },
  { top: '30%', left: '68%' },
  { top: '58%', left: '20%' },
  { top: '65%', left: '72%' },
  { top: '18%', left: '50%' },
  { top: '48%', left: '40%' },
  { top: '75%', left: '45%' },
  { top: '38%', left: '30%' },
];


// ============================================
// 3. CSSアニメーション定義（Tailwindを補完）
// ============================================

const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
    }
    50% {
      box-shadow: 0 0 20px 10px rgba(147, 51, 234, 0.1);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.5s ease-out forwards;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.4s ease-out forwards;
  }
  
  .animate-pulseGlow {
    animation: pulseGlow 2s ease-in-out infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out forwards;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
  .stagger-5 { animation-delay: 0.5s; }
`;


// ============================================
// 4. メインアプリ
// ============================================

export default function NaviOsApp() {
  const [view, setView] = useState('pulse');
  const [activeTab, setActiveTab] = useState('pulse');
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sheetOpen, setSheetOpen] = useState('half');
  const [newPost, setNewPost] = useState({ 
    title: '', content: '', category: 'stock', images: [],
    allowComments: true, isEnded: false,
    price: '', stockStatus: '在庫あり', stockDuration: '48hours',
    eventDate: '', eventTime: '', fee: '', maxParticipants: '',
    helpType: 'request', reward: '', estimatedTime: '',
    deadline: '', requirements: ''
  });
  const [visibleComments, setVisibleComments] = useState(3);
  const [pulseQuery, setPulseQuery] = useState('');
  const [pulseResults, setPulseResults] = useState([]);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [pulseSearched, setPulseSearched] = useState(false);
  const [myPostTab, setMyPostTab] = useState('active'); // 'active' | 'ended'

  const filteredPosts = activeCategory === 'all' 
    ? postsData 
    : postsData.filter(p => p.category === activeCategory);
  const sortedPosts = [...filteredPosts].sort((a, b) => a.distance - b.distance);
  const hotPosts = sortedPosts.slice(0, 3);


  // ============================================
  // 画面: 近く (NearbyScreen) 
  // ============================================
  
  if (view === 'main') {
    return (
      <div className="h-screen w-full max-w-md mx-auto bg-slate-100 relative overflow-hidden">
        <style>{customStyles}</style>
        
        {/* 地図エリア */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
          
          <div className="absolute top-1/2 left-0 right-0 h-6 bg-white/60 -translate-y-1/2" />
          <div className="absolute top-0 bottom-0 left-1/3 w-5 bg-white/50" />
          <div className="absolute top-0 bottom-0 right-1/4 w-4 bg-white/40" />
          <div className="absolute top-1/4 left-0 w-1/2 h-3 bg-white/30" />
          
          <div className="absolute top-[12%] right-[8%] w-16 h-14 bg-green-300/40 rounded-full blur-lg" />
          <div className="absolute bottom-[35%] left-[8%] w-20 h-16 bg-green-300/30 rounded-full blur-lg" />

          {/* 現在地マーカー */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="absolute -inset-3 bg-blue-400/30 rounded-full animate-ping" />
              <div className="absolute -inset-1 bg-blue-400/40 rounded-full animate-pulse" />
              <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <Navigation size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* 投稿ピン */}
          {sortedPosts.slice(0, 8).map((post, i) => {
            const cat = getCategoryInfo(post.category);
            const pos = pinPositions[i];
            const Icon = cat.icon;
            return (
              <button
                key={post.id}
                onClick={() => { 
                  setSelectedPost(post); 
                  setActiveCategory(post.category);
                  setSheetOpen('half'); 
                }}
                className="absolute -translate-x-1/2 z-10 transition-transform hover:scale-110 active:scale-95"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className="relative">
                  <div className={`${cat.color} w-9 h-9 rounded-full shadow-lg flex items-center justify-center border-2 border-white`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  {post.urgency === 'high' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">!</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ヘッダー（ログインアイコン削除済み） */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-black text-lg text-slate-800">NaviOs</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-500" />
                <span className="text-xs font-medium text-slate-700">伊集院</span>
              </button>
              <button className="w-9 h-9 bg-white/95 backdrop-blur rounded-full shadow flex items-center justify-center relative">
                <Bell size={18} className="text-slate-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">3</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* カテゴリフィルター */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all whitespace-nowrap ${
                    isActive 
                      ? `${cat.color} text-white shadow-lg` 
                      : 'bg-white/95 backdrop-blur text-slate-600 shadow'
                  }`}
                >
                  <Icon size={14} />
                  <span className="text-xs font-medium">{cat.label}</span>
                  {cat.id !== 'all' && (
                    <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {postsData.filter(p => p.category === cat.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ボトムシート */}
        <div className={`absolute left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 transition-all duration-300 ${
          sheetOpen === 'full' ? 'bottom-16 h-[55%]' : 
          sheetOpen === 'half' ? 'bottom-16 h-[32%]' : 
          'bottom-16 h-[70px]'
        }`}>
          {/* ハンドル */}
          <button 
            onClick={() => {
              if (sheetOpen === 'closed') setSheetOpen('half');
              else if (sheetOpen === 'half') setSheetOpen('full');
              else setSheetOpen('half');
            }} 
            className="w-full flex justify-center pt-4 pb-3"
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </button>

          {/* 閉じた状態 */}
          {sheetOpen === 'closed' && (
            <div className="px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-bold text-slate-800 text-sm">近くの今</span>
                <span className="text-xs text-slate-400">{sortedPosts.length}件</span>
              </div>
              <ChevronUp size={18} className="text-slate-400" />
            </div>
          )}

          {/* ヘッダー（half/full） */}
          {sheetOpen !== 'closed' && (
            <div className="px-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-bold">近くの今</span>
                </div>
                <span className="text-xs text-slate-400">{sortedPosts.length}件の情報</span>
              </div>
              <button onClick={() => setSheetOpen('closed')} className="p-2">
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>
          )}

          {/* 横スクロールのホットカード */}
          {sheetOpen !== 'closed' && (
            <div className="px-4 mb-3">
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {hotPosts.map(post => {
                  const cat = getCategoryInfo(post.category);
                  const Icon = cat.icon;
                  const user = users[post.authorId];
                  return (
                    <button
                      key={post.id}
                      onClick={() => { setSelectedPost(post); setView('detail'); setVisibleComments(3); }}
                      className={`flex-shrink-0 w-40 p-3 rounded-xl border-2 transition-all ${
                        selectedPost?.id === post.id 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`${cat.color} w-6 h-6 rounded-full flex items-center justify-center`}>
                          <Icon size={12} className="text-white" />
                        </div>
                        {post.urgency === 'high' && <Flame size={12} className="text-red-500" />}
                        {user.verified && <CheckCircle size={12} className="text-blue-500" />}
                      </div>
                      <p className="font-bold text-slate-800 text-xs text-left line-clamp-2 mb-1.5">{post.title}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin size={10} />
                        <span className="truncate">{post.spotName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-emerald-600">{formatDistance(post.distance)}</span>
                        <span className="text-[10px] text-slate-400">{post.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 投稿リスト（full時のみ） */}
          {sheetOpen === 'full' && (
            <div className="px-4 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
              <div className="space-y-2">
                {sortedPosts.map(post => {
                  const cat = getCategoryInfo(post.category);
                  const Icon = cat.icon;
                  const user = users[post.authorId];
                  return (
                    <button
                      key={post.id}
                      onClick={() => { setSelectedPost(post); setView('detail'); setVisibleComments(3); }}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-left hover:bg-slate-100 transition-colors"
                    >
                      <div className={`${cat.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{post.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="text-emerald-600 font-medium">{formatDistance(post.distance)}</span>
                          <span>·</span>
                          <span className="truncate">{user.displayName}</span>
                          <span>·</span>
                          <span>{post.time}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ボトムナビ */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
          <div className="flex items-center justify-around py-2 pb-4">
            <button 
              onClick={() => { setActiveTab('pulse'); setView('pulse'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Zap size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">Pulse</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 px-6 py-1 text-emerald-600">
              <Map size={22} strokeWidth={2.5} />
              <span className="text-[10px] font-medium">近く</span>
            </button>
            <button 
              onClick={() => setView('post')}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Plus size={28} className="text-white" />
              </div>
            </button>
            <button 
              onClick={() => { setActiveTab('search'); setView('search'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Search size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">検索</span>
            </button>
            <button 
              onClick={() => { setActiveTab('profile'); setView('profile'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <User size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">マイページ</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }


  // ============================================
  // 画面: 投稿詳細 (DetailScreen)
  // ============================================
  
  if (view === 'detail' && selectedPost) {
    const cat = getCategoryInfo(selectedPost.category);
    const Icon = cat.icon;
    const user = users[selectedPost.authorId];
    const comments = allComments.slice(0, visibleComments);
    const remainingComments = allComments.length - visibleComments;

    return (
      <div className="h-screen w-full max-w-md mx-auto bg-white flex flex-col">
        <style>{customStyles}</style>
        
        {/* ヘッダー */}
        <header className="flex items-center justify-between p-4 pt-6 border-b border-slate-100">
          <button 
            onClick={() => setView('main')} 
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <div className={`${cat.color} px-3 py-1 rounded-full flex items-center gap-1`}>
            <Icon size={14} className="text-white" />
            <span className="text-white text-sm font-medium">{cat.label}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center -mr-2">
            <Share2 size={20} className="text-slate-600" />
          </button>
        </header>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {/* 画像 */}
          {selectedPost.images && selectedPost.images.length > 0 && (
            <div className="relative h-48 bg-slate-100">
              <img 
                src={selectedPost.images[0]} 
                alt=""
                className="w-full h-full object-cover"
              />
              {selectedPost.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {selectedPost.images.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-4">
            {/* タイトル・投稿者 */}
            <h1 className="text-xl font-black text-slate-800 mb-2">{selectedPost.title}</h1>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-slate-600">{user.avatar}</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-700 text-sm">{user.displayName}</span>
                  {user.verified && <CheckCircle size={14} className="text-emerald-500" />}
                </div>
                <span className="text-xs text-slate-500">{selectedPost.time}</span>
              </div>
            </div>

            {/* 場所情報 */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <MapPin size={18} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{selectedPost.spotName}</p>
                <p className="text-xs text-slate-500">{selectedPost.spotAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-600 font-bold text-sm">{formatDistance(selectedPost.distance)}</p>
                <p className="text-xs text-slate-500">{getWalkTime(selectedPost.distance)}</p>
              </div>
            </div>

            {/* 詳細テキスト */}
            <p className="text-slate-700 mb-4 leading-relaxed">{selectedPost.content}</p>

            {/* カテゴリ別情報 */}
            {selectedPost.category === 'stock' && (
              <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-emerald-700">価格</span>
                  <span className="font-bold text-emerald-800">{selectedPost.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">在庫状況</span>
                  <span className={`font-bold ${selectedPost.stockStatus === '残りわずか' ? 'text-red-600' : 'text-emerald-800'}`}>
                    {selectedPost.stockStatus}
                  </span>
                </div>
              </div>
            )}

            {selectedPost.category === 'event' && (
              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-amber-700">日時</span>
                  <span className="font-bold text-amber-800">{selectedPost.eventDate}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-amber-700">参加費</span>
                  <span className="font-bold text-amber-800">{selectedPost.fee}</span>
                </div>
                {selectedPost.participants && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-700">参加者</span>
                    <span className="font-bold text-amber-800">
                      {selectedPost.participants}/{selectedPost.maxParticipants}人
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedPost.category === 'help' && (
              <div className="bg-rose-50 rounded-xl p-4 mb-4">
                {selectedPost.reward && (
                  <div className="flex items-center gap-2 mb-2">
                    <Gift size={16} className="text-rose-500" />
                    <span className="text-sm text-rose-700">お礼: </span>
                    <span className="font-bold text-rose-800">{selectedPost.reward}</span>
                  </div>
                )}
                {selectedPost.estimatedTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-rose-500" />
                    <span className="text-sm text-rose-700">所要時間: </span>
                    <span className="font-bold text-rose-800">{selectedPost.estimatedTime}</span>
                  </div>
                )}
              </div>
            )}

            {selectedPost.category === 'admin' && (
              <div className="bg-violet-50 rounded-xl p-4 mb-4">
                {selectedPost.deadline && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-violet-500" />
                    <span className="text-sm text-violet-700">締切: </span>
                    <span className="font-bold text-violet-800">{selectedPost.deadline}</span>
                  </div>
                )}
                {selectedPost.requirements && (
                  <div>
                    <span className="text-sm text-violet-700">必要なもの:</span>
                    <ul className="mt-1 space-y-1">
                      {selectedPost.requirements.map((req, i) => (
                        <li key={i} className="text-sm text-violet-800 flex items-center gap-1">
                          <CheckCircle size={12} className="text-violet-400" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* コメント */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={18} className="text-slate-600" />
                <span className="font-bold text-slate-800">コメント ({allComments.length})</span>
              </div>
              
              <div className="space-y-3">
                {comments.map(comment => {
                  const commentUser = users[comment.authorId];
                  return (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-500">{commentUser.avatar}</span>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-700 text-sm">{commentUser.displayName}</span>
                          {comment.canHelp && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                              協力可
                            </span>
                          )}
                          <span className="text-xs text-slate-400">{comment.time}</span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {remainingComments > 0 && (
                <button 
                  onClick={() => setVisibleComments(prev => prev + 3)}
                  className="w-full mt-3 py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  もっと見る（残り{remainingComments}件）
                </button>
              )}
            </div>
          </div>
        </div>

        {/* コメント入力 */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="コメントを入力..."
              className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="p-4 pt-0 flex gap-3">
          <button className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-2">
            <Navigation size={18} />
            ここへ行く
          </button>
          {selectedPost.category === 'stock' && user.phone && (
            <button className="flex-1 py-3 bg-emerald-500 rounded-xl font-bold text-white flex items-center justify-center gap-2">
              📞 電話する
            </button>
          )}
          {selectedPost.category === 'event' && (
            <button className="flex-1 py-3 bg-amber-500 rounded-xl font-bold text-white flex items-center justify-center gap-2">
              ✋ 参加する
            </button>
          )}
          {selectedPost.category === 'help' && (
            <button className="flex-1 py-3 bg-rose-500 rounded-xl font-bold text-white flex items-center justify-center gap-2">
              <Hand size={18} />
              協力する
            </button>
          )}
          {selectedPost.category === 'admin' && (
            <button className="flex-1 py-3 bg-violet-500 rounded-xl font-bold text-white flex items-center justify-center gap-2">
              → 公式サイト
            </button>
          )}
        </div>
      </div>
    );
  }


  // ============================================
  // 画面: Pulse (PulseScreen) - アニメーション強化版
  // ============================================
  
  if (view === 'pulse') {
    const handlePulseSearch = () => {
      if (!pulseQuery.trim()) return;
      setPulseLoading(true);
      setPulseSearched(false);
      setTimeout(() => {
        const results = pulseSearch(pulseQuery, postsData);
        setPulseResults(results);
        setPulseLoading(false);
        setPulseSearched(true);
      }, 1000); // 少し長めにしてアニメーション効果を見せる
    };

    const quickTags = ['野菜', '卵', '手伝い', 'イベント', '給付金'];

    return (
      <div className="h-screen w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col overflow-hidden">
        <style>{customStyles}</style>
        
        {/* ヘッダー（ログインアイコン削除済み、NaviOs AIに変更） */}
        <header className="p-4 pt-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulseGlow">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">NaviOs AI</h1>
                <p className="text-xs text-slate-500">近くの情報をAIがキャッチ</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow relative hover:scale-105 transition-transform">
              <Bell size={20} className="text-slate-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-[10px] text-white font-bold">3</span>
              </div>
            </button>
          </div>
        </header>

        {/* 検索入力 */}
        <div className="px-4 mb-4 animate-fadeInUp stagger-1" style={{ opacity: 0 }}>
          <div className="relative">
            <input
              type="text"
              value={pulseQuery}
              onChange={(e) => setPulseQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePulseSearch()}
              placeholder="NaviOs AIに聞いてみる..."
              className="w-full px-4 py-3.5 pr-12 bg-white rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button 
              onClick={handlePulseSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            >
              {pulseLoading ? (
                <Loader size={16} className="text-white animate-spin" />
              ) : (
                <Search size={16} className="text-white" />
              )}
            </button>
          </div>
          
          {/* クイックタグ */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {quickTags.map((tag, idx) => (
              <button
                key={tag}
                onClick={() => { setPulseQuery(tag); }}
                className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-600 shadow-sm hover:bg-purple-50 hover:text-purple-600 hover:scale-105 transition-all border border-slate-100"
                style={{ 
                  animation: `fadeIn 0.3s ease-out ${0.1 * idx}s forwards`,
                  opacity: 0 
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 検索結果 */}
        <div className="flex-1 overflow-y-auto px-4 pb-20">
          {/* ローディングアニメーション */}
          {pulseLoading && (
            <div className="py-12 animate-fadeIn">
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 mb-4">
                  <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-30" />
                  <div className="absolute inset-2 bg-purple-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute inset-4 bg-purple-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.4s' }} />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Zap size={32} className="text-white animate-pulse" />
                  </div>
                </div>
                <p className="text-slate-600 font-medium">検索中...</p>
                <p className="text-sm text-slate-400 mt-1">近くの情報を探しています</p>
              </div>
            </div>
          )}

          {/* 検索結果表示（アニメーション付き） */}
          {pulseSearched && !pulseLoading && pulseResults.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3 animate-fadeInUp">
                <Sparkles size={16} className="text-purple-500" />
                <span className="font-bold text-slate-800">{pulseResults.length}件見つかりました</span>
              </div>
              <div className="space-y-3">
                {pulseResults.map((post, idx) => {
                  const cat = getCategoryInfo(post.category);
                  const Icon = cat.icon;
                  const user = users[post.authorId];
                  return (
                    <button
                      key={post.id}
                      onClick={() => { setSelectedPost(post); setView('detail'); setVisibleComments(3); }}
                      className="w-full p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-left hover:shadow-md hover:scale-[1.02] transition-all animate-fadeInUp"
                      style={{ 
                        animationDelay: `${0.1 * idx}s`,
                        opacity: 0
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${cat.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 truncate">{post.title}</h3>
                            <span className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                              {post.matchScore}%
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{post.content}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="text-emerald-600 font-medium">{formatDistance(post.distance)}</span>
                            <span>·</span>
                            <span>{user.displayName}</span>
                            <span>·</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* 結果なし */}
          {pulseSearched && !pulseLoading && pulseResults.length === 0 && (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500">該当する情報が見つかりませんでした</p>
              <p className="text-sm text-slate-400 mt-1">別のキーワードで試してみてください</p>
            </div>
          )}

          {/* 初期状態（NaviOs AIに変更、アニメーション付き） */}
          {!pulseSearched && !pulseLoading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <Zap size={28} className="text-white" />
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-2 text-lg animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0 }}>
                NaviOs AIに聞いてみよう
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
                あなたの言葉で探してみてください。<br />
                AIが近くの最適な情報を見つけます。
              </p>
              
              {/* ヒント */}
              <div className="mt-8 space-y-2 animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <p className="text-xs text-slate-400">例えば...</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['新鮮な卵が欲しい', '今日のイベント', '誰か手伝って'].map((hint, i) => (
                    <button
                      key={hint}
                      onClick={() => setPulseQuery(hint)}
                      className="px-3 py-1.5 bg-white/80 rounded-full text-xs text-slate-500 border border-slate-200 hover:border-purple-300 hover:text-purple-600 transition-all"
                    >
                      "{hint}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ボトムナビ */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
          <div className="flex items-center justify-around py-2 pb-4">
            <button className="flex flex-col items-center gap-0.5 px-6 py-1 text-purple-600">
              <div className="relative">
                <Zap size={22} strokeWidth={2.5} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              </div>
              <span className="text-[10px] font-medium">Pulse</span>
            </button>
            <button 
              onClick={() => { setActiveTab('map'); setView('main'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Map size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">近く</span>
            </button>
            <button 
              onClick={() => setView('post')}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform">
                <Plus size={28} className="text-white" />
              </div>
            </button>
            <button 
              onClick={() => { setActiveTab('search'); setView('search'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Search size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">検索</span>
            </button>
            <button 
              onClick={() => { setActiveTab('profile'); setView('profile'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <User size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">マイページ</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }


  // ============================================
  // 画面: 投稿作成 (PostScreen)
  // ============================================
  
  if (view === 'post') {
    const stockDurationOptions = [
      { value: 'today', label: '今日中' },
      { value: '48hours', label: '明日まで' },
      { value: '3days', label: '3日間' },
      { value: '1week', label: '1週間' },
      { value: 'manual', label: '手動で終了' },
    ];

    const getCategoryTips = (category) => {
      switch(category) {
        case 'stock':
          return ['数量制限があれば明記しましょう', '価格は税込みで記載すると親切です', '在庫状況をこまめに更新しましょう'];
        case 'event':
          return ['集合場所を具体的に書きましょう', '持ち物があれば記載しましょう', '雨天時の対応も書くと親切です'];
        case 'help':
          return ['具体的な作業内容を書きましょう', 'お礼の内容を明記すると◎', '所要時間の目安があると助かります'];
        case 'admin':
          return ['申請期限を必ず記載しましょう', '必要書類を箇条書きで', '問い合わせ先も記載しましょう'];
        default:
          return [];
      }
    };

    return (
      <div className="h-screen w-full max-w-md mx-auto bg-white flex flex-col">
        <style>{customStyles}</style>
        
        {/* ヘッダー */}
        <header className="flex items-center justify-between p-4 pt-6 border-b border-slate-100">
          <button 
            onClick={() => setView('pulse')}
            className="w-10 h-10 flex items-center justify-center"
          >
            <X size={24} className="text-slate-600" />
          </button>
          <span className="font-bold text-slate-800">情報を投稿</span>
          <button 
            className="px-4 py-2 bg-emerald-500 rounded-full text-white text-sm font-bold"
            onClick={() => {
              alert('投稿しました！（デモ）');
              setView('pulse');
              setNewPost({ 
                title: '', content: '', category: 'stock',
                images: [], allowComments: true, isEnded: false,
                price: '', stockStatus: '在庫あり', stockDuration: '48hours',
                eventDate: '', eventTime: '', fee: '', maxParticipants: '',
                helpType: 'request', reward: '', estimatedTime: '',
                deadline: '', requirements: ''
              });
            }}
          >
            投稿
          </button>
        </header>

        {/* フォーム */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* カテゴリ選択 */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700 mb-2 block">カテゴリ</label>
            <div className="flex gap-2">
              {categories.slice(1).map(cat => {
                const Icon = cat.icon;
                const isActive = newPost.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setNewPost({ ...newPost, category: cat.id })}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                      isActive 
                        ? `${cat.color} text-white shadow-lg` 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 写真 */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700 mb-2 block">写真（任意）</label>
            <div className="flex gap-2">
              <button className="flex-1 py-4 bg-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-600">
                <Camera size={20} />
                <span className="text-sm font-medium">撮影</span>
              </button>
              <button className="flex-1 py-4 bg-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-600">
                <Image size={20} />
                <span className="text-sm font-medium">選択</span>
              </button>
            </div>
          </div>

          {/* タイトル */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="例: 卵入荷しました"
              className="w-full px-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 詳細 */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700 mb-2 block">詳細（任意）</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="詳しい情報を入力..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* カテゴリ別追加フィールド */}
          <div className="mb-4 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const cat = getCategoryInfo(newPost.category);
                const Icon = cat.icon;
                return (
                  <>
                    <div className={`${cat.color} w-6 h-6 rounded-full flex items-center justify-center`}>
                      <Icon size={12} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-700">{cat.label}情報</span>
                  </>
                );
              })()}
            </div>

            {/* 物資 */}
            {newPost.category === 'stock' && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">価格</label>
                    <input
                      type="text"
                      value={newPost.price}
                      onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                      placeholder="¥280"
                      className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">在庫状況</label>
                    <select
                      value={newPost.stockStatus}
                      onChange={(e) => setNewPost({ ...newPost, stockStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="在庫あり">在庫あり</option>
                      <option value="残りわずか">残りわずか</option>
                      <option value="入荷予定">入荷予定</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">表示期間</label>
                  <div className="flex flex-wrap gap-2">
                    {stockDurationOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setNewPost({ ...newPost, stockDuration: opt.value })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          newPost.stockDuration === opt.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* イベント */}
            {newPost.category === 'event' && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">開催日</label>
                    <input
                      type="date"
                      value={newPost.eventDate}
                      onChange={(e) => setNewPost({ ...newPost, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">開始時間</label>
                    <input
                      type="time"
                      value={newPost.eventTime}
                      onChange={(e) => setNewPost({ ...newPost, eventTime: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">参加費</label>
                    <input
                      type="text"
                      value={newPost.fee}
                      onChange={(e) => setNewPost({ ...newPost, fee: e.target.value })}
                      placeholder="無料"
                      className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">定員</label>
                    <input
                      type="number"
                      value={newPost.maxParticipants}
                      onChange={(e) => setNewPost({ ...newPost, maxParticipants: e.target.value })}
                      placeholder="20"
                      className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  📅 開催日の23:59まで表示されます
                </p>
              </div>
            )}

            {/* 近助 */}
            {newPost.category === 'help' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">タイプ</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewPost({ ...newPost, helpType: 'request' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        newPost.helpType === 'request'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      🙏 お願い
                    </button>
                    <button
                      onClick={() => setNewPost({ ...newPost, helpType: 'share' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        newPost.helpType === 'share'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      🎁 お裾分け
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    {newPost.helpType === 'request' ? 'お礼' : 'お裾分け品'}
                  </label>
                  <input
                    type="text"
                    value={newPost.reward}
                    onChange={(e) => setNewPost({ ...newPost, reward: e.target.value })}
                    placeholder={newPost.helpType === 'request' ? '自家製野菜' : '大根2本'}
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                {newPost.helpType === 'request' && (
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">所要時間の目安</label>
                    <input
                      type="text"
                      value={newPost.estimatedTime}
                      onChange={(e) => setNewPost({ ...newPost, estimatedTime: e.target.value })}
                      placeholder="30分〜1時間"
                      className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
                <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                  ⏰ 48時間後に自動で非表示になります（手動で終了も可）
                </p>
              </div>
            )}

            {/* 行政 */}
            {newPost.category === 'admin' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">申請期限</label>
                  <input
                    type="date"
                    value={newPost.deadline}
                    onChange={(e) => setNewPost({ ...newPost, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">必要書類（改行区切り）</label>
                  <textarea
                    value={newPost.requirements}
                    onChange={(e) => setNewPost({ ...newPost, requirements: e.target.value })}
                    placeholder="届いたハガキ&#10;本人確認書類&#10;振込口座がわかるもの"
                    rows={3}
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
                <p className="text-xs text-violet-600 bg-violet-50 px-3 py-2 rounded-lg">
                  📋 申請期限まで表示されます
                </p>
              </div>
            )}
          </div>

          {/* 場所 */}
          <div className="mb-4 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-emerald-500" />
              <span className="font-bold text-slate-700">場所</span>
            </div>
            <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <Locate size={16} className="text-emerald-500" />
                <span className="text-sm text-slate-600">現在地を使用</span>
              </div>
              <span className="text-xs text-slate-400">伊集院町付近</span>
            </button>
          </div>

          {/* コメント設定 */}
          <div className="mb-4 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-slate-500" />
                <span className="font-bold text-slate-700">コメントを受け付ける</span>
              </div>
              <button
                onClick={() => setNewPost({ ...newPost, allowComments: !newPost.allowComments })}
                className={`w-12 h-6 rounded-full transition-all ${
                  newPost.allowComments ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  newPost.allowComments ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* 投稿のコツ */}
          <div className="p-4 bg-amber-50 rounded-xl mb-20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-amber-500" />
              <span className="font-bold text-amber-700">投稿のコツ</span>
            </div>
            <ul className="space-y-1">
              {getCategoryTips(newPost.category).map((tip, i) => (
                <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }


  // ============================================
  // 画面: 検索 (SearchScreen)
  // ============================================
  
  if (view === 'search') {
    return (
      <div className="h-screen w-full max-w-md mx-auto bg-slate-50 flex flex-col">
        <style>{customStyles}</style>
        
        {/* ヘッダー */}
        <header className="bg-white p-4 pt-6 border-b border-slate-100">
          <h1 className="text-xl font-black text-slate-800 mb-4">検索</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="キーワードで検索..."
              className="w-full px-4 py-3 pl-11 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {/* トレンド */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-slate-800">今日のトレンド</h2>
            </div>
            <div className="space-y-2">
              {trendingPosts.map(post => {
                const cat = getCategoryInfo(post.category);
                const Icon = cat.icon;
                return (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm"
                  >
                    <div className={`${cat.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{post.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{post.spotName}</span>
                        <span>·</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-rose-500">
                        <Flame size={12} />
                        {post.likes}
                      </div>
                      <span className="text-xs text-slate-400">{post.comments}件</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 過去の盛り上がり */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <History size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-slate-800">過去の盛り上がり</h2>
            </div>
            <div className="space-y-2">
              {pastHotPosts.map(post => {
                const cat = getCategoryInfo(post.category);
                const Icon = cat.icon;
                return (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl"
                  >
                    <div className={`${cat.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{post.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{post.spotName}</span>
                        <span>·</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star size={12} fill="currentColor" />
                        {post.likes}
                      </div>
                      {post.participants && (
                        <span className="text-xs text-slate-400">{post.participants}人参加</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* カテゴリ別ブラウズ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-slate-800">カテゴリから探す</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(1).map(cat => {
                const Icon = cat.icon;
                const count = postsData.filter(p => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setView('main'); }}
                    className={`p-4 rounded-xl ${cat.color} text-white`}
                  >
                    <Icon size={24} className="mb-2" />
                    <p className="font-bold">{cat.label}</p>
                    <p className="text-xs opacity-80">{count}件の投稿</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ボトムナビ */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
          <div className="flex items-center justify-around py-2 pb-4">
            <button 
              onClick={() => { setActiveTab('pulse'); setView('pulse'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Zap size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">Pulse</span>
            </button>
            <button 
              onClick={() => { setActiveTab('map'); setView('main'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Map size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">近く</span>
            </button>
            <button 
              onClick={() => setView('post')}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Plus size={28} className="text-white" />
              </div>
            </button>
            <button className="flex flex-col items-center gap-0.5 px-6 py-1 text-emerald-600">
              <Search size={22} strokeWidth={2.5} />
              <span className="text-[10px] font-medium">検索</span>
            </button>
            <button 
              onClick={() => { setActiveTab('profile'); setView('profile'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <User size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">マイページ</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }


  // ============================================
  // 画面: マイページ (ProfileScreen) - モック追加版
  // ============================================
  
  if (view === 'profile') {
    const activePosts = myPosts.filter(p => p.status === 'active');
    const endedPosts = myPosts.filter(p => p.status === 'ended');
    const displayPosts = myPostTab === 'active' ? activePosts : endedPosts;

    return (
      <div className="h-screen w-full max-w-md mx-auto bg-slate-50 flex flex-col">
        <style>{customStyles}</style>
        
        {/* ヘッダー */}
        <header className="bg-white p-4 pt-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-800">マイページ</h1>
            <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Settings size={20} className="text-slate-600" />
            </button>
          </div>
        </header>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* プロフィールカード */}
          <div className="bg-white p-4 mb-2">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-800">{currentUser.displayName}</h2>
                  {currentUser.verified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                      <Shield size={12} className="text-emerald-600" />
                      <span className="text-[10px] text-emerald-600 font-bold">認証済み</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-2">{currentUser.location}</p>
                <p className="text-sm text-slate-600">{currentUser.bio}</p>
              </div>
            </div>
            
            {/* プロフィール編集ボタン */}
            <button className="w-full mt-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
              <Edit3 size={16} />
              プロフィールを編集
            </button>
          </div>

          {/* 活動統計 */}
          <div className="bg-white p-4 mb-2">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              あなたの活動
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-emerald-600">{currentUser.stats.posts}</p>
                <p className="text-xs text-slate-500">投稿</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-rose-600">{currentUser.stats.helped}</p>
                <p className="text-xs text-slate-500">協力</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-blue-600">{currentUser.stats.comments}</p>
                <p className="text-xs text-slate-500">コメント</p>
              </div>
            </div>
          </div>

          {/* 自分の投稿 */}
          <div className="bg-white p-4 mb-2">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-slate-600" />
              自分の投稿
            </h3>
            
            {/* タブ */}
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => setMyPostTab('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  myPostTab === 'active' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                公開中 ({activePosts.length})
              </button>
              <button 
                onClick={() => setMyPostTab('ended')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  myPostTab === 'ended' 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                終了済み ({endedPosts.length})
              </button>
            </div>
            
            {/* 投稿リスト */}
            <div className="space-y-2">
              {displayPosts.map(post => {
                const cat = getCategoryInfo(post.category);
                const Icon = cat.icon;
                return (
                  <div 
                    key={post.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      post.status === 'ended' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className={`${cat.color} ${post.status === 'ended' ? 'opacity-50' : ''} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate ${post.status === 'ended' ? 'text-slate-500' : 'text-slate-800'}`}>
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{post.time}</span>
                        <span>·</span>
                        <span>👁 {post.views}</span>
                        <span>·</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                    {post.status === 'active' ? (
                      <button className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                        編集
                      </button>
                    ) : (
                      <span className="px-2 py-1 bg-slate-200 rounded text-xs text-slate-500">終了</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {displayPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">
                  {myPostTab === 'active' ? '公開中の投稿はありません' : '終了済みの投稿はありません'}
                </p>
              </div>
            )}
          </div>

          {/* 設定メニュー */}
          <div className="bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Settings size={18} className="text-slate-600" />
              設定
            </h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-700">通知設定</p>
                  <p className="text-xs text-slate-500">プッシュ通知のON/OFF</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <MapPinned size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-700">位置情報設定</p>
                  <p className="text-xs text-slate-500">現在地の取得設定</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-violet-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-700">プライバシー</p>
                  <p className="text-xs text-slate-500">公開範囲の設定</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>
            
            {/* ログアウト */}
            <button className="w-full mt-4 py-3 border border-red-200 rounded-xl text-sm font-medium text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
              <LogOut size={16} />
              ログアウト
            </button>
          </div>
        </div>

        {/* ボトムナビ */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
          <div className="flex items-center justify-around py-2 pb-4">
            <button 
              onClick={() => { setActiveTab('pulse'); setView('pulse'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Zap size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">Pulse</span>
            </button>
            <button 
              onClick={() => { setActiveTab('map'); setView('main'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Map size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">近く</span>
            </button>
            <button 
              onClick={() => setView('post')}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Plus size={28} className="text-white" />
              </div>
            </button>
            <button 
              onClick={() => { setActiveTab('search'); setView('search'); }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 text-slate-400"
            >
              <Search size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">検索</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 px-6 py-1 text-emerald-600">
              <User size={22} strokeWidth={2.5} />
              <span className="text-[10px] font-medium">マイページ</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return null;
}