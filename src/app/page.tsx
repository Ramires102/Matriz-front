"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Background from "@/components/layout/Background";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import BottomNav from "@/components/layout/BottomNav";
import Modal from "@/components/layout/Modal";
import HeroCarousel from "@/components/home/HeroCarousel";
import FeedGrid from "@/components/home/FeedGrid";
import AuthGuard from "@/components/auth/AuthGuard";
import { getEvents } from "@/lib/api";
import { apiEventsToEventItems } from "@/lib/mapper";

export interface EventItem {
  id: string;
  rating: number;
  themeColor: string;
  title: string;
  category: string;
  description: string;
  meta: string;
  price: string;
  free: boolean;
  attendees: number;
  bgStyle: string;
  live?: boolean;
}

export type HeroSlide = {
  rating: number;
  badge: string;
  title: string;
  desc: string;
  meta: string[];
  gradient: string;
  glow: string;
};

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [starsFilter, setStarsFilter] = useState<number | null>(null);
  const [likedFilter, setLikedFilter] = useState(false);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [likedHero, setLikedHero] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState("boliches");
  const [modalData, setModalData] = useState<{
    event: EventItem | null;
    heroTitle?: string;
    fromHero?: boolean;
  }>({ event: null });
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [feedEvents, setFeedEvents] = useState<EventItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  const toggleLike = useCallback((id: string) => {
    setLikedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleHeroLike = useCallback((title: string) => {
    setLikedHero(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }, []);

  useEffect(() => {
    setFeedLoading(true);
    const timer = setTimeout(() => {
      getEvents({ search: searchTerm || undefined, limit: 50 })
        .then(res => {
          const items = apiEventsToEventItems(res.data);
          setFeedEvents(items);
        })
        .catch(() => {})
        .finally(() => setFeedLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredEvents = useMemo(() => {
    return feedEvents.filter(ev => {
      const matchesStars = starsFilter === null || ev.rating === starsFilter;
      const matchesLiked = !likedFilter || likedCards.has(ev.id);
      return matchesStars && matchesLiked;
    });
  }, [feedEvents, starsFilter, likedFilter, likedCards]);

  const openCardModal = useCallback((event: EventItem) => {
    setCurrentCard(event.id);
    setModalData({ event, fromHero: false });
  }, []);

  const openHeroModal = useCallback((slide: HeroSlide) => {
    setCurrentCard(null);
    const price = slide.meta[2];
    const ev: EventItem = {
      id: `hero-${slide.title}`,
      rating: slide.rating,
      themeColor: "#8B5CF6",
      title: slide.title,
      category: slide.badge,
      description: slide.desc,
      meta: slide.meta.join(" · "),
      price,
      free: price === "Gratis",
      attendees: parseInt(slide.meta[3]),
      bgStyle: slide.gradient,
    };
    setModalData({ event: ev, heroTitle: slide.title, fromHero: true });
  }, []);

  const closeModal = useCallback(() => {
    setModalData({ event: null });
  }, []);

  const isLiked = modalData.event
    ? modalData.fromHero
      ? likedHero.has(modalData.heroTitle || "")
      : likedCards.has(modalData.event.id)
    : false;

  const handleModalLike = useCallback(() => {
    if (modalData.fromHero && modalData.heroTitle) {
      toggleHeroLike(modalData.heroTitle);
    } else if (modalData.event) {
      toggleLike(modalData.event.id);
    }
  }, [modalData, toggleLike, toggleHeroLike]);

  return (
    <AuthGuard>
    <div className="app" style={{ background: "var(--body-bg)", minHeight: "100vh", position: "relative" }}>
      <Background />
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        menuTab={menuTab}
        onMenuTabChange={setMenuTab}
        likedFilter={likedFilter}
        onLikedFilterToggle={() => setLikedFilter(!likedFilter)}
        starsFilter={starsFilter}
        onStarsFilterChange={setStarsFilter}
        onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
      />

      <div className="main-layout" style={{ display: "flex", width: "100%", minHeight: "calc(100vh - 65px)", position: "relative" }}>
        <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <main className="center-content" style={{ flex: 1, padding: "24px", position: "relative", zIndex: 1 }}>
          <HeroCarousel
            slides={heroSlides}
            likedHero={likedHero}
            onLikeToggle={toggleHeroLike}
            onOpenDetail={openHeroModal}
          />

          <FeedGrid
            events={filteredEvents}
            likedCards={likedCards}
            onLikeToggle={toggleLike}
            onCardClick={openCardModal}
            eventCount={filteredEvents.length}
          />
        </main>

        <RightPanel />
      </div>

      <BottomNav
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
      />

      <Modal
        event={modalData.event}
        open={!!modalData.event}
        isLiked={isLiked}
        onLike={handleModalLike}
        onClose={closeModal}
      />
    </div>
    </AuthGuard>
  );
}
