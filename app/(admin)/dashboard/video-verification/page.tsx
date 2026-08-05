"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Search, Filter, CheckCircle2, XCircle, MapPin, Mail, Play, Check, X, ChevronDown, Clock } from 'lucide-react';

const QUEUE_ITEMS = [
  {
    id: 1,
    name: 'Blessing Adeyemi',
    type: 'Extensions & Weaves',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&q=80',
    hasAutoBadge: true,
  },
  {
    id: 2,
    name: 'Funke Odeyemi',
    type: 'Braiding',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 3,
    name: 'Ifeoma Chukwu',
    type: 'Locs & Twists',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 4,
    name: 'Adaora Nkem',
    type: 'Natural Hair',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 5,
    name: 'Chinwe Igwe',
    type: 'Knotless Braids',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 6,
    name: 'Obiageli Onu',
    type: 'Protective Styles',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 7,
    name: 'Adaora Nkem',
    type: 'Natural Hair',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 8,
    name: 'Grace Ojo',
    type: 'Extensions & Weaves',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 9,
    name: 'Amaka Eze',
    type: 'Braiding',
    servicesCount: 2,
    timeAgo: '2 hours ago',
    time: '3:42',
    isActive: false,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
  }
];

export default function VideoVerificationPage() {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold text-[#1E1E1E]">Video Verification Queue</h1>
          <p className="text-[14px] text-gray-500 mt-1">6 stylists awaiting review</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[6px] h-[41px] bg-[#EAE8E8] border border-[#CFD4DB] rounded-[6px] px-[16px] w-[260px]">
            <Search className="w-[16px] h-[16px] text-[#97A2B1] shrink-0" />
            <input 
              type="text" 
              placeholder="Search stylists..." 
              className="bg-transparent border-none outline-none text-[14px] font-normal text-[#1E1E1E] placeholder:text-[#97A2B1] w-full"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 h-[41px] border border-[#CFD4DB] rounded-[6px] bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 min-h-0 flex-1">
        
        {/* Left Column - Queue List */}
        <div className="w-[580px] flex-shrink-0 bg-white border border-[#CFD4DB] rounded-[12px] flex flex-col overflow-hidden shadow-sm h-full">
          {/* Header */}
          <div className="h-[59px] bg-[#4D145D] rounded-t-[11px] px-4 flex items-center justify-between shrink-0 border-b border-[#CFD4DB]">
            <span className="text-white font-medium text-[15px]">6 Pending Submissions</span>
            <div className="bg-[#FFE4E6] text-[#E11D48] text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Review Required
            </div>
          </div>
          {/* List */}
          <div className="flex-1 overflow-y-auto flex flex-col hide-scrollbar">
            {QUEUE_ITEMS.map((item) => (
              <div 
                key={item.id}
                className={`h-[92px] px-[16px] flex items-center justify-between border-b-[0.5px] border-[#F0F1F3] cursor-pointer transition-colors ${
                  item.isActive 
                    ? 'bg-[#F4F6F8]' 
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Image src={item.avatar} alt={item.name} width={44} height={44} className="w-[44px] h-[44px] rounded-full object-cover shrink-0" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#1E1E1E]">{item.name}</span>
                      {item.hasAutoBadge && (
                        <span className="bg-[#E0E7FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Auto
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-[#8390A2] font-normal leading-[16px] line-clamp-1 mt-1">{item.type}</span>
                    <span className="text-[12px] text-[#9B51E0] font-normal leading-[16px] mt-1">{item.servicesCount} services submitted</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center shrink-0">
                  <span className="text-[12px] text-[#8390A2] font-normal leading-[16px]">{item.timeAgo}</span>
                  <span className="text-[12px] text-[#8390A2] font-normal leading-[16px] mt-1">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Detail Panel */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto hide-scrollbar pb-6">
          
          {/* Top Card: Video Player & Profile */}
          <div className="bg-white border border-[#CFD4DB] rounded-[12px] flex flex-col overflow-hidden shrink-0 shadow-sm">
            
            {/* Video Player Section */}
            <div className="w-full h-[320px] bg-black relative group overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                loop 
                controls
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                poster="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200"
              >
                <source src="/admin/makeup2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Custom Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300 pointer-events-none">
                  <div 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-[#4D145D] bg-opacity-90 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform duration-200 pointer-events-auto cursor-pointer"
                  >
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8">
              {/* Stylist Profile Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Image 
                    src={QUEUE_ITEMS[0].avatar} 
                    alt="Blessing Adeyemi" 
                    width={60}
                    height={60}
                    className="w-[60px] h-[60px] rounded-full object-cover ring-4 ring-gray-50 shrink-0"
                  />
                  <div>
                    <h2 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
                      Blessing Adeyemi
                    </h2>
                    <p className="text-[14px] text-gray-500 font-medium">Extensions & Weaves</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                        <MapPin className="w-4 h-4" />
                        Houston, TX
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                        <Mail className="w-4 h-4" />
                        b.adeyemi@email.com
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#FFF4E5] text-[#FF9800] px-4 py-1.5 rounded-full text-[13px] font-bold border border-[#FFE0B2]">
                  Pending
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-8">
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">ID Type</label>
                  <div className="bg-[#F8F9FA] border border-[#F0F1F3] rounded-xl px-4 py-3 text-[14px] text-gray-700 font-medium">
                    Driver's License
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">ID Uploaded</label>
                  <div className="bg-[#F8F9FA] border border-[#F0F1F3] rounded-xl px-4 py-3 text-[14px] text-gray-700 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Uploaded
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">Bank Account</label>
                  <div className="bg-[#F8F9FA] border border-[#F0F1F3] rounded-xl px-4 py-3 text-[14px] text-gray-700 font-medium font-mono">
                    **** 7303
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">Referral</label>
                  <div className="bg-[#F8F9FA] border border-[#F0F1F3] rounded-xl px-4 py-3 text-[14px] text-gray-700 font-medium font-mono">
                    PLAT-DIR-2794
                  </div>
                </div>
              </div>

              {/* Main Actions */}
              <div className="flex gap-4 mt-8">
                <button className="flex-1 h-[40px] bg-[#3BB515] hover:bg-[#2F9111] text-white rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors">
                  <CheckCircle2 className="w-[18px] h-[18px]" />
                  Approve Stylist
                </button>
                <button 
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex-1 h-[40px] bg-[#FF332C] hover:bg-[#E52D27] text-white rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-[18px] h-[18px]" />
                  Reject
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Card: Services Section */}
          <div className="bg-[#FFFFF7] border border-[#F3F4F6] rounded-[12px] p-[20px] shadow-sm flex flex-col gap-[16px] shrink-0">
            <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-[18px] font-bold text-gray-900">Services Submitted</h3>
                    <p className="text-[14px] text-gray-500 mt-0.5">Blessing Adeyemi added 2 services from the app</p>
                  </div>
                  <span className="bg-[#4D145D] text-white text-[12px] font-bold px-3 py-1 rounded-full">
                    2 Services
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Service 1 */}
                  <div className="flex items-start justify-between p-5 bg-[#F8F9FA] border border-[#F0F1F3] rounded-xl">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-[16px] font-bold text-gray-900">Knotless Box Braids</h4>
                        <span className="bg-purple-100 text-[#4D145D] text-[11px] font-bold px-2.5 py-0.5 rounded border border-purple-200">
                          Braiding
                        </span>
                      </div>
                      <p className="text-[14px] text-gray-600 leading-relaxed mb-3">
                        Medium length knotless box braids with natural hair included. No pulling, scalp-friendly technique.
                      </p>
                      <div className="flex items-center gap-4 text-[14px] font-bold text-gray-900">
                        <span>$160</span>
                        <span className="text-[#D1D5DB] text-[16px] leading-none mb-0.5">&bull;</span>
                        <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />3-4 hrs</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button className="bg-[#3BB515] hover:bg-[#2F9111] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Service
                      </button>
                      <button 
                        onClick={() => setIsRejectModalOpen(true)}
                        className="bg-[#FF332C] hover:bg-[#E52D27] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Service 2 */}
                  <div className="flex items-start justify-between p-5 bg-[#F8F9FA] border border-[#F0F1F3] rounded-xl">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-[16px] font-bold text-gray-900">Feed-in Cornrows</h4>
                        <span className="bg-purple-100 text-[#4D145D] text-[11px] font-bold px-2.5 py-0.5 rounded border border-purple-200">
                          Braiding
                        </span>
                      </div>
                      <p className="text-[14px] text-gray-600 leading-relaxed mb-3">
                        Small to medium feed-in cornrows with natural hair, finish.
                      </p>
                      <div className="flex items-center gap-4 text-[14px] font-bold text-gray-900">
                        <span>$90</span>
                        <span className="text-[#D1D5DB] text-[16px] leading-none mb-0.5">&bull;</span>
                        <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />1.5-2 hrs</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button className="bg-[#3BB515] hover:bg-[#2F9111] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Service
                      </button>
                      <button 
                        onClick={() => setIsRejectModalOpen(true)}
                        className="bg-[#FF332C] hover:bg-[#E52D27] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions (Duplicate as per design) */}
                <div className="flex gap-4 mt-2 pt-4 border-t border-[#F0F1F3]">
                  <button className="flex-1 h-[40px] bg-[#3BB515] hover:bg-[#2F9111] text-white rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle2 className="w-[18px] h-[18px]" />
                    Approve Stylist
                  </button>
                  <button 
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex-1 h-[40px] bg-[#FF332C] hover:bg-[#E52D27] text-white rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-[18px] h-[18px]" />
                    Reject
                  </button>
                </div>

          </div>
        </div>
      </div>
      
      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setIsRejectModalOpen(false)}
        >
          <div 
            className="bg-white rounded-[16px] w-[384px] p-6 shadow-xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-[18px] font-bold text-gray-900">Reject Submission</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex flex-col gap-4">
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Provide a reason for rejecting Blessing Adeyemi's entire submission.
              </p>
              
              <div className="flex flex-col gap-1.5">
                 <div className="w-full h-[40px] border border-[#CFD4DB] rounded-lg bg-white"></div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <textarea 
                  placeholder="Additional notes for the stylist..."
                  className="w-full border border-[#CFD4DB] rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#4D145D] resize-none h-[100px]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="text-[14px] font-medium text-gray-700 bg-white border border-[#D1D5DB] hover:bg-gray-50 rounded-[8px] h-[40px] px-5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="bg-[#FF332C] hover:bg-[#E52D27] text-white rounded-[8px] h-[40px] flex-1 font-bold text-[14px] transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Scrollbar Styles to match clean design */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
    </div>
  );
}
